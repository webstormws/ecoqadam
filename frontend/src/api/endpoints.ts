import type {
  BalanceInfo,
  MapReport,
  Notification,
  Profile,
  Report,
  ReportsSummary,
  Transaction,
  User,
  Withdrawal,
} from "@/api/types";
import { client } from "@/api/client";

interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

export const authApi = {
  register: async (payload: {
    phone: string;
    first_name: string;
    last_name?: string;
    password: string;
  }) => (await client.post<AuthResponse>(`auth/register/`, payload)).data,
  login: async (payload: { phone: string; password: string }) =>
    (await client.post<AuthResponse>(`auth/login/`, payload)).data,
  telegramVerify: async (token: string) =>
    (await client.post<AuthResponse>(`auth/telegram/verify/`, { token })).data,
  me: async () => (await client.get<Profile>(`auth/me/`)).data,
  updateProfile: async (payload: { notifications_enabled?: boolean; language?: string }) =>
    (await client.patch<Profile>(`auth/me/`, payload)).data,
};

export const reportsApi = {
  list: async () =>
    (await client.get<{ results: Report[]; summary: ReportsSummary }>(`reports/`)).data,
  detail: async (id: number) => (await client.get<Report>(`reports/${id}/`)).data,
  create: async (formData: FormData) =>
    (await client.post<Report>(`reports/`, formData, { headers: { "Content-Type": undefined } }))
      .data,
  map: async () => (await client.get<{ results: MapReport[] }>(`map/my/`)).data,
};

export const walletApi = {
  balance: async () => (await client.get<BalanceInfo>(`balance/`)).data,
  transactions: async () => (await client.get<{ results: Transaction[] }>(`transactions/`)).data,
};

export const withdrawalApi = {
  list: async () => (await client.get<{ results: Withdrawal[] }>(`withdrawals/`)).data,
  create: async (payload: { amount: number; card_number: string }) =>
    (await client.post<Withdrawal>(`withdrawals/`, payload)).data,
};

export const notificationsApi = {
  list: async () => (await client.get<{ results: Notification[]; unread: number }>(`notifications/`)).data,
  markRead: async (id: number) => (await client.post(`notifications/${id}/read/`)).data,
  markAllRead: async () => (await client.post(`notifications/read-all/`)).data,
};

export const botApi = {
  config: async () =>
    (await client.get<{ bot_username: string; app_base_url: string }>(`bot/config/`)).data,
};