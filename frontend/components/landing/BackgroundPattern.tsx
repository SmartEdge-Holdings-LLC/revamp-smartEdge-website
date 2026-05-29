/**
 * Layered radial wash + dotted grain. No mask-alpha tricks (those often hide the whole layer cross-browser).
 * Fades softly via gradients contained in the pattern itself.
 */
export function BackgroundPattern() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[1] min-h-full"
      style={{
        opacity: 0.95,
        backgroundImage: `
          radial-gradient(
            ellipse 90% 70% at 50% -15%,
            rgb(234 105 58 / 0.14),
            transparent 55%
          ),
          radial-gradient(
            ellipse 55% 50% at 0% 30%,
            rgb(234 105 58 / 0.1),
            transparent 50%
          ),
          radial-gradient(
            ellipse 50% 45% at 100% 20%,
            rgb(255 255 255 / 0.08),
            transparent 48%
          ),
          radial-gradient(
            ellipse 60% 50% at 80% 100%,
            rgb(234 105 58 / 0.07),
            transparent 55%
          ),
          radial-gradient(
            ellipse 50% 40% at 15% 100%,
            rgb(255 255 255 / 0.055),
            transparent 50%
          ),
          radial-gradient(rgb(255 255 255 / 0.09) 1px, transparent 1px),
          radial-gradient(rgb(234 105 58 / 0.065) 1px, transparent 1px),
          radial-gradient(
            ellipse 140% 100% at 50% 115%,
            rgb(0 0 0 / 0),
            rgb(0 0 0 / 0.6) 100%
          )
        `,
        backgroundSize:
          "100% 100%, 100% 100%, 100% 100%, 100% 100%, 100% 100%, 24px 24px, 24px 24px, 100% 100%",
        backgroundPosition:
          "center, center, center, center, center, 0 0, 12px 12px, center",
      }}
    />
  );
}
