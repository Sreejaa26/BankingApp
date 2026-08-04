import { FunctionalComponent, h } from "preact";
import { Dashboard } from "../pages/Dashboard";

// Kept for compatibility with the Oracle JET basic VDOM template.
// App routing is owned by components/app.tsx.
export const Content: FunctionalComponent = () => (
  <Dashboard onNavigate={() => undefined} />
);

