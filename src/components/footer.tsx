import { FunctionalComponent, h } from "preact";

export const Footer: FunctionalComponent = () => (
  <footer class="app-footer">
    <span>© 2026 Northstar Bank</span>
    <span>Secure session · 256-bit encryption</span>
    <nav aria-label="Legal links">
      <a href="#/privacy">Privacy</a>
      <a href="#/support">Support</a>
    </nav>
  </footer>
);

