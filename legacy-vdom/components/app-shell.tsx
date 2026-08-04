import { ComponentChildren, FunctionalComponent, h } from "preact";
import { useState } from "preact/hooks";
import { Footer } from "./footer";
import { Header } from "./header";
import { AppRoute, NAVIGATION_ITEMS } from "./routes";

interface AppShellProps {
  activeRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  onLogout: () => void;
  children: ComponentChildren;
}

export const AppShell: FunctionalComponent<AppShellProps> = ({
  activeRoute,
  onNavigate,
  onLogout,
  children
}) => {
  const [navigationOpen, setNavigationOpen] = useState(false);

  const selectRoute = (route: AppRoute) => {
    onNavigate(route);
    setNavigationOpen(false);
  };

  return (
    <div class="app-shell">
      <aside
        class={`side-navigation ${navigationOpen ? "is-open" : ""}`}
        aria-label="Banking navigation"
      >
        <div class="brand brand--shell">
          <span class="brand-mark" aria-hidden="true">
            N
          </span>
          <span>
            <strong>Northstar</strong>
            <small>Digital Banking</small>
          </span>
        </div>

        <div class="sidebar-account">
          <span class="sidebar-account__icon">₹</span>
          <div>
            <small>Personal banking</small>
            <strong>Northstar Premier</strong>
          </div>
          <span class="sidebar-account__chevron">⌄</span>
        </div>

        <p class="navigation-label">Workspace</p>
        <nav class="primary-navigation">
          {NAVIGATION_ITEMS.map((item) => (
            <button
              key={item.route}
              type="button"
              class={activeRoute === item.route ? "is-active" : ""}
              aria-current={activeRoute === item.route ? "page" : undefined}
              onClick={() => selectRoute(item.route)}
            >
              <span class="nav-icon" aria-hidden="true">
                {item.shortLabel}
              </span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div class="sidebar-help">
          <span class="sidebar-help__icon">?</span>
          <div>
            <strong>Need help?</strong>
            <small>Chat with us, 24/7</small>
          </div>
          <span class="sidebar-help__arrow">›</span>
        </div>
      </aside>

      {navigationOpen && (
        <button
          class="navigation-scrim"
          aria-label="Close navigation"
          onClick={() => setNavigationOpen(false)}
        />
      )}

      <div class="shell-content">
        <Header
          activeRoute={activeRoute}
          onToggleNavigation={() => setNavigationOpen(true)}
          onLogout={onLogout}
        />
        <main key={activeRoute} class="page-content">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
};
