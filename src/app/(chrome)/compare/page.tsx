import { Suspense } from "react";
import Page from "@/views/Compare";

export default function RoutePage() {
  return <Suspense fallback={null}><Page  /></Suspense>;
}
