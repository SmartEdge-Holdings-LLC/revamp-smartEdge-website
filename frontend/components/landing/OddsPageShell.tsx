"use client";

import { useState } from "react";
import { OddsContent } from "@/components/landing/OddsContent";
import type { OddsSport } from "@/components/landing/odds-data";

export function OddsPageShell() {
  const [sport, setSport] = useState<OddsSport>("MLB");

  return <OddsContent sport={sport} onSportChange={setSport} />;
}
