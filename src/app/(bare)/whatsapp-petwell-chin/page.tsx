import { Suspense } from "react";
import Page from "@/views/WhatsAppPetwellChin";

export default function RoutePage() {
  return <Suspense fallback={null}><Page  /></Suspense>;
}
