import { useAuthStore } from "@/lib/store/authStore";
import { useSession } from "next-auth/react";

export function useAuth() {
  const { user: storeUser, isLoading } = useAuthStore();
  const { data: session } = useSession();

  const user = storeUser || session?.user;
  const isLoggedIn = !!user;

  return {
    user,
    isLoggedIn,
    isLoading,
  };
}
