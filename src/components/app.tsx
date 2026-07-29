import { h } from "preact";
import { useEffect, useState } from "preact/hooks";
import { registerCustomElement } from "ojs/ojvcomponent";
import Context = require("ojs/ojcontext");
import { AppShell } from "./app-shell";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Accounts } from "./pages/Accounts";
import { Transactions } from "./pages/Transactions";
import { Beneficiaries } from "./pages/Beneficiaries";
import { Transfer } from "./pages/Transfer";
import { Loans } from "./pages/Loans";
import { Cards } from "./pages/Cards";
import { Notifications } from "./pages/Notifications";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AppRoute, routeFromHash } from "./routes";

export const App = registerCustomElement("app-root", () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeRoute, setActiveRoute] = useState<AppRoute>(() =>
    routeFromHash(window.location.hash)
  );

  useEffect(() => {
    Context.getPageContext()
      .getBusyContext()
      .applicationBootstrapComplete();
  }, []);

  useEffect(() => {
    const syncRoute = () => setActiveRoute(routeFromHash(window.location.hash));
    window.addEventListener("hashchange", syncRoute);
    return () => window.removeEventListener("hashchange", syncRoute);
  }, []);

  const navigate = (route: AppRoute) => {
    const nextHash = `#/${route}`;
    if (window.location.hash === nextHash) {
      setActiveRoute(route);
    } else {
      window.location.hash = nextHash;
    }
  };

  const handleLogin = async (_username: string, _password: string) => {
    // Replace this demo boundary with POST /api/auth/login.
    await Promise.resolve();
    setIsAuthenticated(true);
    navigate("dashboard");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    window.location.hash = "";
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <AppShell
      activeRoute={activeRoute}
      onNavigate={navigate}
      onLogout={handleLogout}
    >
      {renderPage(activeRoute, navigate)}
    </AppShell>
  );
});

function renderPage(
  route: AppRoute,
  navigate: (route: AppRoute) => void
) {
  switch (route) {
    case "accounts":
      return <Accounts />;
    case "transactions":
      return <Transactions />;
    case "beneficiaries":
      return <Beneficiaries />;
    case "transfer":
      return <Transfer />;
    case "loans":
      return <Loans />;
    case "cards":
      return <Cards />;
    case "notifications":
      return <Notifications />;
    case "admin":
      return <AdminDashboard />;
    case "dashboard":
    default:
      return <Dashboard onNavigate={navigate} />;
  }
}
