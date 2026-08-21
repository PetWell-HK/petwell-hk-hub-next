import { Suspense } from "react";
import Page from "@/views/CheckTag";

export default function RoutePage() {
  return <Suspense fallback={null}><Page  /></Suspense>;
}
