import type { Tournament } from "@/lib/api/tournamentApi";

export function prizeText(t: Tournament) {
  switch (t.prize.type) {
    case "discount":
      return `${t.prize.value}% Discount`;
    case "freeMonth":
      return `${t.prize.value} Free Month${t.prize.value !== 1 ? "s" : ""}`;
    case "custom":
      return t.prize.description || `$${t.prize.value} Prize`;
  }
}

export function formatDateRange(start: string, end: string) {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  const year = new Date(end).getFullYear();
  return `${fmt(start)} – ${fmt(end)}, ${year}`;
}

export function timeRemaining(endDate: string) {
  const diff = new Date(endDate).getTime() - Date.now();
  if (diff <= 0) return "Ended";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days > 0) return `${days}d remaining`;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours > 0) return `${hours}h remaining`;
  const mins = Math.floor(diff / (1000 * 60));
  return `${mins}m remaining`;
}
