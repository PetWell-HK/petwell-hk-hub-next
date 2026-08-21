import { Suspense } from "react";
import Page from "@/views/Register";

export default function RoutePage() {
  return <Suspense fallback={null}><Page  /></Suspense>;
}
