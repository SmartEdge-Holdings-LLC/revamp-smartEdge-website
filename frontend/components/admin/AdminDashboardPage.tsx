"use client";

import * as React from "react";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { JonahDashboard } from "@/components/admin/JonahDashboard";
import { readAuthSession } from "@/lib/authCookies";

export function AdminDashboardPage() {
  const [handicapper, setHandicapper] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    setHandicapper(readAuthSession()?.role === "handicapper");
  }, []);

  if (handicapper === null) {
    return null;
  }

  return handicapper ? <JonahDashboard /> : <AdminDashboard />;
}
