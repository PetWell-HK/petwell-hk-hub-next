import type { ReactNode } from "react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

export default function ChromeLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <div className="min-h-[calc(100dvh-var(--header-height))]">{children}</div>
      <Footer />
    </>
  );
}
