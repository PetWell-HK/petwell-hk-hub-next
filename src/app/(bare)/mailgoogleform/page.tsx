import { Suspense } from "react";
import Page from "@/views/MailGoogleForm";

export default function RoutePage() {
  return <Suspense fallback={null}><Page  /></Suspense>;
}
