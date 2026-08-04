import { h } from "preact";
import { useEffect, useState } from "preact/hooks";
import { registerCustomElement } from "ojs/ojvcomponent";
import Context = require("ojs/ojcontext");
import { AppShell } from "./app-shell";
import { Login } from "./pages/Login";
import { Register, RegistrationDetails } from "./pages/Register";
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

type AuthView = "login" | "register";

const authViewFromHash = (): AuthView =>
  window.location.hash === "#/register" ? "register" : "login";

export const App = registerCustomElement("app-root", () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authView, setAuthView] = useState<AuthView>(authViewFromHash);
  const [activeRoute, setActiveRoute] = useState<AppRoute>(() =>
    routeFromHash(window.location.hash)
  );

  useEffect(() => {
    Context.getPageContext()
      .getBusyContext()
      .applicationBootstrapComplete();
  }, []);

  useEffect(() => {
    const syncHash = () => {
      setAuthView(authViewFromHash());
      setActiveRoute(routeFromHash(window.location.hash));
    };
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
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

  const handleRegister = async (_details: RegistrationDetails) => {
    // Replace this demo boundary with POST /api/auth/register.
    await Promise.resolve();
    setIsAuthenticated(true);
    navigate("dashboard");
  };

  const showRegister = () => {
    setAuthView("register");
    window.location.hash = "#/register";
  };

  const showLogin = () => {
    setAuthView("login");
    window.location.hash = "";
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAuthView("login");
    window.location.hash = "";
  };

  if (!isAuthenticated) {
    return authView === "register" ? (
      <Register onRegister={handleRegister} onShowLogin={showLogin} />
    ) : (
      <Login onLogin={handleLogin} onShowRegister={showRegister} />
    );
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

function renderPage(route: AppRoute, navigate: (route: AppRoute) => void) {
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
