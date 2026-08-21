import { Suspense } from "react";
import Page from "@/views/ForgotPassword";

export default function RoutePage() {
  return <Suspense fallback={null}><Page  /></Suspense>;
}
