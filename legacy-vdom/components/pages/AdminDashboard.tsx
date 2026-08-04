import { FunctionalComponent, h } from "preact";
import { PagePlaceholder } from "./PagePlaceholder";

export const AdminDashboard: FunctionalComponent = () => (
  <PagePlaceholder
    eyebrow="Operations"
    title="Admin Dashboard"
    description="Monitor customer activity, approvals, service health, and operational risk."
    action="Review approvals"
    endpoint="GET /api/admin/overview"
    highlights={[
      { label: "Active customers", value: "18,420" },
      { label: "Pending reviews", value: "24" },
      { label: "Service health", value: "99.99%" }
    ]}
  />
);

