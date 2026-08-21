import type { ReactNode } from "react";
import Header from "@/components/Header";

export default function ForumLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <Header />
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
