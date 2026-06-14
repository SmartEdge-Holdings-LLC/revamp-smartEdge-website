const STORAGE_KEY = "sep_pending_checkout_promo";

export function stashPendingCheckoutPromo(code: string): void {
  if (typeof window === "undefined") return;
  const normalized = code.trim().toUpperCase();
  if (!normalized) {
    sessionStorage.removeItem(STORAGE_KEY);
    return;
  }
  sessionStorage.setItem(STORAGE_KEY, normalized);
}

export function peekPendingCheckoutPromo(): string | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(STORAGE_KEY);
  return raw?.trim() ? raw.trim().toUpperCase() : null;
}

export function consumePendingCheckoutPromo(): string | null {
  if (typeof window === "undefined") return null;
  const code = peekPendingCheckoutPromo();
  sessionStorage.removeItem(STORAGE_KEY);
  return code;
}
