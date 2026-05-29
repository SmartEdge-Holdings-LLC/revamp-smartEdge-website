"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import {
  mapBackendMemberToSessionUser,
  type BackendMemberUser,
} from "@/types/member-session";

/** Pull latest entitlements from the API into the JWT session (session is not live by default). */
export function MemberSessionRefresh() {
  const { data: session, update } = useSession();
  const refreshed = useRef(false);

  useEffect(() => {
    const token = session?.user?.backendToken;
    if (!token || refreshed.current) return;
    refreshed.current = true;

    void (async () => {
      try {
        const res = await fetch("/api/user/profile", {
          credentials: "same-origin",
          cache: "no-store",
        });
        if (!res.ok) return;
        const { user } = (await res.json()) as { user: BackendMemberUser };
        await update({ user: mapBackendMemberToSessionUser(user, token) });
      } catch {
        /* non-fatal */
      }
    })();
  }, [session?.user?.backendToken, update]);

  return null;
}
