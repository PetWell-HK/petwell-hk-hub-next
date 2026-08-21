import { Suspense } from "react";
import Page from "@/views/PetTag";

export default function RoutePage() {
  return <Suspense fallback={null}><Page  /></Suspense>;
}
