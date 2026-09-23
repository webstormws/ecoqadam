import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AdminUser {
  id: number;
  phone: string;
  first_name: string;
  last_name: string;
  full_name: string;
  is_staff: boolean;
  is_active: boolean;
}

interface AuthState {
  access: string | null;
  refresh: string | null;
  admin: AdminUser | null;
  setTokens: (access: string, refresh: string) => void;
  setAdmin: (admin: AdminUser) => void;
  logout: () => void;
  isAuthed: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      access: null,
      refresh: null,
      admin: null,
      setTokens: (access, refresh) => set({ access, refresh }),
      setAdmin: (admin) => set({ admin }),
      logout: () => set({ access: null, refresh: null, admin: null }),
      isAuthed: () => Boolean(get().access && get().refresh),
    }),
    { name: "eco_qadam_admin_auth" }
  )
);