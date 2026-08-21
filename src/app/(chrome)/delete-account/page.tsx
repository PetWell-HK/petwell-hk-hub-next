import { Suspense } from "react";
import Page from "@/views/DeleteAccount";

export default function RoutePage() {
  return <Suspense fallback={null}><Page  /></Suspense>;
}
