import { FunctionalComponent, h } from "preact";
import { PagePlaceholder } from "./PagePlaceholder";

export const Transactions: FunctionalComponent = () => (
  <PagePlaceholder
    eyebrow="Activity"
    title="Transactions"
    description="Search, filter, categorize, and export your complete transaction history."
    action="Download statement"
    endpoint="GET /api/transactions"
    highlights={[
      { label: "This month", value: "₹48,730" },
      { label: "Incoming", value: "₹1,04,500" },
      { label: "Transactions", value: "28" }
    ]}
  />
);

