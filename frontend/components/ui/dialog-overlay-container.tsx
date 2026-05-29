"use client";

import * as React from "react";

/** Portal target for Popover/Select inside a modal dialog (avoids blocked clicks). */
export const DialogOverlayContainerContext =
  React.createContext<HTMLElement | null>(null);

export function useDialogOverlayContainer(): HTMLElement | null {
  return React.useContext(DialogOverlayContainerContext);
}
