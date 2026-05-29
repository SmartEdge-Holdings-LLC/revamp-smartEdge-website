"use client";

import { useState } from "react";
import { OddsContent } from "@/components/landing/OddsContent";
import { OddsSportSubNav } from "@/components/landing/OddsSportSubNav";
import type { OddsSport } from "@/components/landing/odds-data";

export function OddsPageShell() {
  const [sport, setSport] = useState<OddsSport>("NBA");

  return <OddsContent sport={sport} onSportChange={setSport} />;
}
