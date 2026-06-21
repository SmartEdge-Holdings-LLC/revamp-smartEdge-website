import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function useHashNavigation() {
  const router = useRouter();

  useEffect(() => {
    const handleHashClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a[href*='#']");

      if (!link) return;

      const href = link.getAttribute("href");
      if (!href || !href.includes("#")) return;

      // Extract the hash part (handles both "#pricing" and "/#pricing")
      const hashIndex = href.indexOf("#");
      const id = href.substring(hashIndex + 1);

      if (!id) return;

      e.preventDefault();

      const element = document.getElementById(id);

      if (element) {
        // Update the URL hash
        router.push(`#${id}`, { scroll: false } as any);

        // Smooth scroll to the element
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };

    document.addEventListener("click", handleHashClick);
    return () => document.removeEventListener("click", handleHashClick);
  }, [router]);
}
