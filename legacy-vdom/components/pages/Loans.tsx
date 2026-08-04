import { FunctionalComponent, h } from "preact";
import { PagePlaceholder } from "./PagePlaceholder";

export const Loans: FunctionalComponent = () => (
  <PagePlaceholder
    eyebrow="Borrowing"
    title="Loans"
    description="Track repayments, view loan details, and explore eligible offers."
    action="Explore offers"
    endpoint="GET /api/loans"
    highlights={[
      { label: "Outstanding", value: "₹8,42,000" },
      { label: "Next EMI", value: "₹24,600" },
      { label: "Due date", value: "05 Aug" }
    ]}
  />
);

