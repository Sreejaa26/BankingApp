export type AppRoute =
  | "dashboard"
  | "accounts"
  | "transactions"
  | "beneficiaries"
  | "transfer"
  | "loans"
  | "cards"
  | "notifications"
  | "admin";

export interface NavigationItem {
  route: AppRoute;
  label: string;
  shortLabel: string;
}

export const NAVIGATION_ITEMS: NavigationItem[] = [
  { route: "dashboard", label: "Dashboard", shortLabel: "DB" },
  { route: "accounts", label: "Accounts", shortLabel: "AC" },
  { route: "transactions", label: "Transactions", shortLabel: "TX" },
  { route: "beneficiaries", label: "Beneficiaries", shortLabel: "BE" },
  { route: "transfer", label: "Transfer Money", shortLabel: "TR" },
  { route: "loans", label: "Loans", shortLabel: "LN" },
  { route: "cards", label: "Cards", shortLabel: "CD" },
  { route: "notifications", label: "Notifications", shortLabel: "NT" },
  { route: "admin", label: "Admin Dashboard", shortLabel: "AD" }
];

const VALID_ROUTES = new Set<AppRoute>(
  NAVIGATION_ITEMS.map((item) => item.route)
);

export function routeFromHash(hash: string): AppRoute {
  const candidate = hash.replace(/^#\/?/, "").split("/")[0] as AppRoute;
  return VALID_ROUTES.has(candidate) ? candidate : "dashboard";
}

export function routeTitle(route: AppRoute): string {
  return (
    NAVIGATION_ITEMS.find((item) => item.route === route)?.label ?? "Dashboard"
  );
}

