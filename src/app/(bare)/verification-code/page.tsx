import { Suspense } from "react";
import Page from "@/views/VerificationCode";

export default function RoutePage() {
  return <Suspense fallback={null}><Page  /></Suspense>;
}
