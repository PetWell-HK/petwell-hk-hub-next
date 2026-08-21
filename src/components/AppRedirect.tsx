"use client";

import { useEffect } from "react";
import { useAppNavigate } from "@/hooks/useAppNavigate";

export default function AppRedirect({
  href,
  replace = true,
}: {
  href: string;
  replace?: boolean;
}) {
  const navigate = useAppNavigate();

  useEffect(() => {
    navigate(href, { replace });
  }, [href, navigate, replace]);

  return null;
}
