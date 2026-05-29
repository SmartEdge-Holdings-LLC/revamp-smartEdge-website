"use client";

import ColorBends from "@/components/ui/ColorBends";

export function LandingBackdrop() {
  return (
    <div className="absolute inset-0 z-0">
      <ColorBends transparent />
    </div>
  );
}
