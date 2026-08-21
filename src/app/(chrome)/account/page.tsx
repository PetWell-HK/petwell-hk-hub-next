import { Suspense } from "react";
import Page from "@/views/AccountProfile";

export default function RoutePage() {
  return <Suspense fallback={null}><Page  /></Suspense>;
}
