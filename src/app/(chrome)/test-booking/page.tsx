import { Suspense } from "react";
import Page from "@/views/TestBooking";

export default function RoutePage() {
  return <Suspense fallback={null}><Page  /></Suspense>;
}
