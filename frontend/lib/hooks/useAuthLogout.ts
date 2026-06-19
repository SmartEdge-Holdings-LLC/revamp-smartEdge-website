import { signOut } from "next-auth/react";
import { useAuthStore } from "@/lib/store/authStore";

export function useAuthLogout() {
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    logout();
    await signOut({ redirect: true, redirectTo: "/" });
  };

  return { logout: handleLogout };
}
