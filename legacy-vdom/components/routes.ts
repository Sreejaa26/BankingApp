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
  { route: "dashboard", label: "Dashboard", shortLabel: "⌂" },
  { route: "accounts", label: "Accounts", shortLabel: "▤" },
  { route: "transactions", label: "Transactions", shortLabel: "↕" },
  { route: "beneficiaries", label: "Beneficiaries", shortLabel: "◎" },
  { route: "transfer", label: "Transfer Money", shortLabel: "↗" },
  { route: "loans", label: "Loans", shortLabel: "◇" },
  { route: "cards", label: "Cards", shortLabel: "▱" },
  // { route: "notifications", label: "Notifications", shortLabel: "◌" },
  { route: "admin", label: "Admin Dashboard", shortLabel: "⌘" }
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
