import { Suspense } from "react";
import Page from "@/views/ActivateTag";

export default function RoutePage() {
  return <Suspense fallback={null}><Page  /></Suspense>;
}
