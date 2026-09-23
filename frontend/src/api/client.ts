import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/authStore";

const BASE_URL = import.meta.env.VITE_API_URL ?? "/api/v1/";

export const client = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().access;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshPromise: Promise<string> | null = null;

async function refreshAccess(): Promise<string> {
  const refresh = useAuthStore.getState().refresh;
  if (!refresh) throw new Error("No refresh token");
  const { data } = await axios.post(`${BASE_URL}auth/refresh/`, { refresh });
  useAuthStore.getState().setTokens(data.access, data.refresh);
  return data.access as string;
}

client.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;
    if (status === 401 && !original._retry && !original.url?.includes("login")) {
      original._retry = true;
      try {
        refreshPromise = refreshPromise ?? refreshAccess();
        const access = await refreshPromise;
        original.headers.Authorization = `Bearer ${access}`;
        return client(original);
      } catch {
        useAuthStore.getState().logout();
        if (!location.pathname.startsWith("/login")) location.href = "/login";
      } finally {
        refreshPromise = null;
      }
    }
    return Promise.reject(error);
  }
);

export function errorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { detail?: string; [k: string]: unknown };
    if (typeof data?.detail === "string") return data.detail;
    const first = Object.values(data ?? {}).find((v) => Array.isArray(v) && v.length);
    if (Array.isArray(first) && typeof first[0] === "string") return first[0];
    return err.message;
  }
  return "Nimadir noto'g'ri ketdi";
}