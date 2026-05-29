import type { SessionMemberUser } from "@/types/member-session";
import "next-auth";

declare module "next-auth" {
  interface Session {
    user: SessionMemberUser;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user?: SessionMemberUser;
  }
}
