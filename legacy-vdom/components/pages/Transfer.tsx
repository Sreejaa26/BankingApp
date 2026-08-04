import { FunctionalComponent, h } from "preact";
import { PagePlaceholder } from "./PagePlaceholder";

export const Transfer: FunctionalComponent = () => (
  <PagePlaceholder
    eyebrow="Move money"
    title="Transfer Money"
    description="Make secure transfers between your accounts or to a beneficiary."
    action="New transfer"
    endpoint="POST /api/transactions/transfer"
    highlights={[
      { label: "Daily limit", value: "₹5,00,000" },
      { label: "Available today", value: "₹5,00,000" },
      { label: "Scheduled", value: "2" }
    ]}
  />
);

