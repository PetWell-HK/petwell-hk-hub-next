import { Suspense } from "react";
import Page from "@/views/MyReviews";

export default function RoutePage() {
  return <Suspense fallback={null}><Page  /></Suspense>;
}
