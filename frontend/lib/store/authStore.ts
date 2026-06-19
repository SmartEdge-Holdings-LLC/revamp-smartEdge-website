import { create } from "zustand";
import type { SessionMemberUser } from "@/types/member-session";

interface AuthState {
  user: SessionMemberUser | null;
  isLoading: boolean;
  setUser: (user: SessionMemberUser | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ user: null, isLoading: false }),
}));
