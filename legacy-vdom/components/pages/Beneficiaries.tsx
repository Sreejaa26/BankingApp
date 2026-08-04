import { FunctionalComponent, h } from "preact";
import { PagePlaceholder } from "./PagePlaceholder";

export const Beneficiaries: FunctionalComponent = () => (
  <PagePlaceholder
    eyebrow="Payments"
    title="Beneficiaries"
    description="Manage trusted people and businesses you send money to."
    action="Add beneficiary"
    endpoint="GET /api/beneficiaries"
    highlights={[
      { label: "Active", value: "12" },
      { label: "Recently paid", value: "4" },
      { label: "Pending approval", value: "1" }
    ]}
  />
);

