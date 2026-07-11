import type { ComponentType, CSSProperties, MouseEventHandler, PropsWithChildren } from "react";
import { createContext, useContext, useMemo } from "react";
import {
  Link as ReactRouterLink,
  Navigate as ReactRouterNavigate,
  Outlet as ReactRouterOutlet,
  useLocation,
  useNavigate as useReactRouterNavigate,
} from "react-router-dom";

type HeadConfig = {
  meta?: Array<Record<string, string>>;
  links?: Array<Record<string, string>>;
};

type RouteOptions = {
  component?: ComponentType<Record<string, unknown>>;
  head?: () => HeadConfig;
  shellComponent?: ComponentType<PropsWithChildren>;
  notFoundComponent?: ComponentType<Record<string, unknown>>;
  errorComponent?: ComponentType<Record<string, unknown>>;
  validateSearch?: (search: Record<string, unknown>) => Record<string, unknown>;
};

type CompatRoute<TContext = unknown> = {
  path: string;
  options: RouteOptions;
  useRouteContext: () => TContext;
};

const RouteContext = createContext<unknown>(null);

export function RouteContextProvider({ children, value }: PropsWithChildren<{ value: unknown }>) {
  return <RouteContext.Provider value={value}>{children}</RouteContext.Provider>;
}

export function createFileRoute(path: string) {
  return (options: RouteOptions): CompatRoute => ({
    path,
    options,
    useRouteContext: () => useContext(RouteContext),
  });
}

export function createRootRouteWithContext<TContext>() {
  return (options: RouteOptions): CompatRoute<TContext> => ({
    path: "__root__",
    options,
    useRouteContext: () => useContext(RouteContext) as TContext,
  });
}

type NavigateTarget =
  | string
  | {
      to: string;
      search?: Record<string, unknown>;
    };

function buildPath(target: NavigateTarget) {
  if (typeof target === "string") {
    return target;
  }

  const params = new URLSearchParams();
  if (target.search) {
    for (const [key, value] of Object.entries(target.search)) {
      if (value == null || value === "") continue;
      params.set(key, String(value));
    }
  }

  const query = params.toString();
  return query ? `${target.to}?${query}` : target.to;
}

export function Link({
  to,
  children,
  ...props
}: PropsWithChildren<{
  to: string;
  className?: string;
  style?: CSSProperties;
  title?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}>) {
  return (
    <ReactRouterLink to={to} {...props}>
      {children}
    </ReactRouterLink>
  );
}

export function Navigate({ to }: { to: string }) {
  return <ReactRouterNavigate to={to} replace />;
}

export function Outlet() {
  return <ReactRouterOutlet />;
}

export function useNavigate() {
  const navigate = useReactRouterNavigate();

  return (target: NavigateTarget) => {
    navigate(buildPath(target));
  };
}

export function useSearch() {
  const { search } = useLocation();

  return useMemo(() => {
    const params = new URLSearchParams(search);
    const data: Record<string, string> = {};
    for (const [key, value] of params.entries()) {
      data[key] = value;
    }
    return data;
  }, [search]);
}

export function useRouterState<T>({
  select,
}: {
  select: (routerState: { location: { pathname: string; search: string } }) => T;
}) {
  const location = useLocation();
  return select({
    location: {
      pathname: location.pathname,
      search: location.search,
    },
  });
}

export function useRouter() {
  return {
    invalidate: () => window.location.reload(),
  };
}

export function HeadContent() {
  return null;
}

export function Scripts() {
  return null;
}
