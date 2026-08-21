import { Suspense } from "react";
import Page from "@/views/SignUpLogin";

export default function RoutePage() {
  return <Suspense fallback={null}><Page  /></Suspense>;
}
