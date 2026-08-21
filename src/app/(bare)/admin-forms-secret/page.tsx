import { Suspense } from "react";
import Page from "@/views/AdminForms";

export default function RoutePage() {
  return <Suspense fallback={null}><Page  /></Suspense>;
}
