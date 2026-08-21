import { Suspense } from "react";
import Page from "@/views/AfcdPdfRedirect";

export default function RoutePage() {
  return <Suspense fallback={null}><Page  /></Suspense>;
}
