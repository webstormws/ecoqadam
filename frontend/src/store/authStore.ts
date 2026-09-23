import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Profile, User } from "@/api/types";

interface AuthState {
  access: string | null;
  refresh: string | null;
  profile: Profile | null;
  setTokens: (access: string, refresh: string) => void;
  setProfile: (profile: Profile) => void;
  setUser: (user: User) => void;
  logout: () => void;
  isAuthed: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      access: null,
      refresh: null,
      profile: null,
      setTokens: (access, refresh) => set({ access, refresh }),
      setProfile: (profile) => set({ profile }),
      setUser: (user) =>
        set((state) => ({ profile: state.profile ? { ...state.profile, user } : state.profile })),
      logout: () => set({ access: null, refresh: null, profile: null }),
      isAuthed: () => Boolean(get().access && get().refresh),
    }),
    { name: "eco_qadam_auth" }
  )
);