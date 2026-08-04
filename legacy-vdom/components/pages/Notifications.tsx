import { FunctionalComponent, h } from "preact";
import { PagePlaceholder } from "./PagePlaceholder";

export const Notifications: FunctionalComponent = () => (
  <PagePlaceholder
    eyebrow="Stay informed"
    title="Notifications"
    description="Review security alerts, transaction updates, and account messages."
    action="Notification settings"
    endpoint="GET /api/notifications"
    highlights={[
      { label: "Unread", value: "3" },
      { label: "Security alerts", value: "0" },
      { label: "This week", value: "9" }
    ]}
  />
);

