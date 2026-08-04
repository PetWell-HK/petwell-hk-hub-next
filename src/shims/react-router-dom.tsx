"use client";

import NextLink from "next/link";
import {
  useRouter,
  usePathname,
  useParams as useNextParams,
  useSearchParams as useNextSearchParams,
} from "next/navigation";
import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  type AnchorHTMLAttributes,
  type ReactNode,
  type SetStateAction,
} from "react";

type To =
  | string
  | {
      pathname?: string;
      search?: string;
      hash?: string;
    };

function toHref(to: To): string {
  if (typeof to === "string") return to;
  const pathname = to.pathname ?? "";
  const search = to.search
    ? to.search.startsWith("?")
      ? to.search
      : `?${to.search}`
    : "";
  const hash = to.hash
    ? to.hash.startsWith("#")
      ? to.hash
      : `#${to.hash}`
    : "";
  return `${pathname}${search}${hash}`;
}

export type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  to: To;
  replace?: boolean;
  prefetch?: boolean;
  children?: ReactNode;
};

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ to, replace, prefetch, children, onClick, ...rest }, ref) => {
    const href = toHref(to);
    return (
      <NextLink
        ref={ref}
        href={href}
        replace={replace}
        prefetch={prefetch}
        onClick={onClick}
        {...rest}
      >
        {children}
      </NextLink>
    );
  },
);
Link.displayName = "Link";

export function useNavigate() {
  const router = useRouter();
  return useCallback(
    (to: To | number, options?: { replace?: boolean; state?: unknown }) => {
      if (typeof to === "number") {
        if (to < 0) router.back();
        else if (to > 0) router.forward();
        return;
      }
      const href = toHref(to);
      if (options?.replace) router.replace(href);
      else router.push(href);
    },
    [router],
  );
}

export function useLocation() {
  const pathname = usePathname() || "/";
  // Prefer window during client render to avoid forcing Suspense on every consumer.
  const search =
    typeof window !== "undefined"
      ? window.location.search
      : "";
  const hash =
    typeof window !== "undefined" ? window.location.hash : "";
  return useMemo(
    () => ({
      pathname,
      search,
      hash,
      state: null as unknown,
      key: "default",
    }),
    [pathname, search, hash],
  );
}

export function useParams<T extends Record<string, string | string[]> = Record<string, string>>() {
  return (useNextParams() ?? {}) as T;
}

type SetURLSearchParams = (
  nextInit?: SetStateAction<URLSearchParams | Record<string, string> | string | string[][]>,
  navigateOpts?: { replace?: boolean },
) => void;

/** React Router v6-compatible: returns [searchParams, setSearchParams]. */
export function useSearchParams(): [URLSearchParams, SetURLSearchParams] {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const nextParams = useNextSearchParams();

  const searchParams = useMemo(
    () => new URLSearchParams(nextParams?.toString() || ""),
    [nextParams],
  );

  const setSearchParams = useCallback<SetURLSearchParams>(
    (nextInit, navigateOpts) => {
      const current = new URLSearchParams(nextParams?.toString() || "");
      let next: URLSearchParams;

      if (typeof nextInit === "function") {
        next = new URLSearchParams(nextInit(current));
      } else if (nextInit instanceof URLSearchParams) {
        next = new URLSearchParams(nextInit);
      } else if (typeof nextInit === "string") {
        next = new URLSearchParams(nextInit);
      } else if (Array.isArray(nextInit)) {
        next = new URLSearchParams(nextInit);
      } else if (nextInit && typeof nextInit === "object") {
        next = new URLSearchParams(nextInit as Record<string, string>);
      } else {
        next = new URLSearchParams();
      }

      const qs = next.toString();
      const href = qs ? `${pathname}?${qs}` : pathname;
      if (navigateOpts?.replace) router.replace(href);
      else router.push(href);
    },
    [nextParams, pathname, router],
  );

  return [searchParams, setSearchParams];
}

export function Navigate({
  to,
  replace = false,
}: {
  to: To;
  replace?: boolean;
}) {
  const router = useRouter();
  const href = toHref(to);

  useEffect(() => {
    if (replace) router.replace(href);
    else router.push(href);
  }, [href, replace, router]);

  return null;
}

export function Outlet() {
  return null;
}

export function useOutlet() {
  return null;
}

export function BrowserRouter({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}

export function MemoryRouter({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}

export function Routes({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}

export function Route(_props: {
