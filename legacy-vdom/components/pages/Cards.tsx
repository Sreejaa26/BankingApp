import { FunctionalComponent, h } from "preact";
import { PagePlaceholder } from "./PagePlaceholder";

export const Cards: FunctionalComponent = () => (
  <PagePlaceholder
    eyebrow="Card controls"
    title="Cards"
    description="Manage limits, freeze cards, update usage controls, and view card activity."
    action="Manage cards"
    endpoint="GET /api/cards"
    highlights={[
      { label: "Available credit", value: "₹1,76,400" },
      { label: "Current spend", value: "₹23,600" },
      { label: "Active cards", value: "2" }
    ]}
  />
);

