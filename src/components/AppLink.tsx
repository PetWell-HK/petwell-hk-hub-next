"use client";

import NextLink from "next/link";
import {
  type ComponentProps,
  type MouseEvent,
} from "react";
import { documentNavigate, shouldDocumentNavigate } from "@/lib/navigation";

type AppLinkProps = ComponentProps<typeof NextLink>;

export default function AppLink({
  href,
  replace,
  prefetch,
  onClick,
  children,
  ...rest
}: AppLinkProps) {
  const hrefString = typeof href === "string" ? href : href.pathname ?? "";

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (event.button !== 0) return;
    if (!shouldDocumentNavigate(hrefString)) return;
    event.preventDefault();
    documentNavigate(hrefString, Boolean(replace));
  };

  return (
    <NextLink
      href={href}
      replace={replace}
      prefetch={prefetch ?? false}
      onClick={handleClick}
      {...rest}
    >
      {children}
    </NextLink>
  );
}
