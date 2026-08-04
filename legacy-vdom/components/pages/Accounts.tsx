import { FunctionalComponent, h } from "preact";
import { PagePlaceholder } from "./PagePlaceholder";

export const Accounts: FunctionalComponent = () => (
  <PagePlaceholder
    eyebrow="Your money"
    title="Accounts"
    description="Review balances, account details, statements, and interest earned."
    action="Open an account"
    endpoint="GET /api/accounts"
    highlights={[
      { label: "Total balance", value: "₹4,82,650" },
      { label: "Available now", value: "₹4,36,650" },
      { label: "Active accounts", value: "3" }
    ]}
  />
);

