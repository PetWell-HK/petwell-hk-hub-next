import type { ReactNode } from "react";

/** Auth, NFC tags, and hop pages — no site chrome. */
export default function BareLayout({ children }: { children: ReactNode }) {
  return children;
}
