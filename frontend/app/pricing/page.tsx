import { redirect } from "next/navigation";

/** Legacy route — pricing lives on the landing page. */
export default function PricingPage() {
  redirect("/#pricing");
}
