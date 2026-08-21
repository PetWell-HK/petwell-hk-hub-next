import { Suspense } from "react";
import Page from "@/views/Wishlist";

export default function RoutePage() {
  return <Suspense fallback={null}><Page  /></Suspense>;
}
