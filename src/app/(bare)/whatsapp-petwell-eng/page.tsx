import { Suspense } from "react";
import Page from "@/views/WhatsAppPetwellEng";

export default function RoutePage() {
  return <Suspense fallback={null}><Page  /></Suspense>;
}
