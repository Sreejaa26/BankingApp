import { FunctionalComponent, h } from "preact";
import "ojs/ojbutton";
import { AppRoute, routeTitle } from "./routes";

interface HeaderProps {
  activeRoute: AppRoute;
  onToggleNavigation: () => void;
  onLogout: () => void;
}

export const Header: FunctionalComponent<HeaderProps> = ({
  activeRoute,
  onToggleNavigation,
  onLogout
}) => (
  <header class="app-header">
    <button
      class="menu-toggle"
      type="button"
      aria-label="Open navigation"
      onClick={onToggleNavigation}
    >
      <span />
      <span />
      <span />
    </button>

    <div>
      <p class="page-eyebrow">Personal Banking</p>
      <h1>{routeTitle(activeRoute)}</h1>
    </div>

    <div class="header-actions">
      <div class="customer-summary" aria-label="Signed in customer">
        <span class="customer-avatar">SP</span>
        <span class="customer-copy">
          <strong>Sreeja Pamu</strong>
          <small>Primary customer</small>
        </span>
      </div>
      <oj-button chroming="borderless" onojAction={onLogout}>
        Sign out
      </oj-button>
    </div>
  </header>
);

