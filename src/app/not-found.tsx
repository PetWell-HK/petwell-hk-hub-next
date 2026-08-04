import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "找不到頁面 | PetWell HK",
  robots: { index: false, follow: false },
};

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">找不到此頁面</p>
        <Link href="/" className="text-primary underline hover:opacity-80">
          返回首頁
        </Link>
      </div>
    </div>
  );
}
