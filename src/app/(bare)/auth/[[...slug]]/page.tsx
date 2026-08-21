import { Suspense } from "react";
import Page from "@/views/AuthCallback";

export default function RoutePage() {
  return <Suspense fallback={null}><Page  /></Suspense>;
}
