import { cookies } from "next/headers";
import { readAuthCookies } from "@/lib/authSession";

/** Admin / handicapper session from `sep_*` cookies (server components & layouts). */
export async function getServerAdminAuthSession() {
  const store = await cookies();
  return readAuthCookies((name) => store.get(name)?.value);
}
