import { FunctionalComponent, h } from "preact";
import "ojs/ojbutton";
import { AppRoute } from "../routes";
import { CashFlowChart } from "../charts/CashFlowChart";
import { SpendingBreakdownChart } from "../charts/SpendingBreakdownChart";

interface DashboardProps {
  onNavigate: (route: AppRoute) => void;
}

const transactions = [
  { name: "Fresh Market", date: "Today, 10:42 AM", amount: "− ₹1,240", icon: "FM" },
  { name: "Salary credit", date: "Yesterday", amount: "+ ₹82,500", icon: "SC" },
  { name: "Northstar Utilities", date: "26 Jul 2026", amount: "− ₹3,860", icon: "NU" }
];

export const Dashboard: FunctionalComponent<DashboardProps> = ({ onNavigate }) => (
  <div class="dashboard-page page-stack">
    <section class="welcome-banner dashboard-hero">
      <div>
        <p class="page-eyebrow">Thursday, 30 July</p>
        <h2>Good morning, Sreeja.</h2>
        <p>Your finances are looking healthy. Here’s today’s overview.</p>
      </div>
      <div class="hero-actions">
        <button class="secondary-action" onClick={() => onNavigate("transactions")}>
          Download Mini statement
        </button>
        <oj-button chroming="callToAction" onojAction={() => onNavigate("transfer")}>
          <span class="button-icon">↗</span> Make a transfer
        </oj-button>
      </div>
    </section>

    <section class="metric-grid" aria-label="Account summary">
      <article class="metric-card metric-card--primary">
        <div class="metric-card__top">
          <span>Total balance</span>
          <span class="metric-icon">₹</span>
        </div>
        <strong>₹4,82,650.20</strong>
        <small>Across 3 accounts</small>
        <div class="balance-card__footer">
          <div class="mini-sparkline" aria-hidden="true">
            <i /><i /><i /><i /><i /><i />
          </div>
          <span class="trend trend--light">↑ 4.8%</span>
        </div>
      </article>
      <article class="metric-card">
        <div class="metric-card__top">
          <span>Monthly income</span>
          <span class="metric-icon metric-icon--green">↓</span>
        </div>
        <strong>₹1,04,500</strong>
        <small>July 2026</small>
        <div class="trend">↑ ₹8,200 vs June</div>
      </article>
      <article class="metric-card">
        <div class="metric-card__top">
          <span>Monthly spending</span>
          <span class="metric-icon metric-icon--gold">↗</span>
        </div>
        <strong>₹48,730</strong>
        <small>46% of monthly income</small>
        <div class="progress-track"><span style={{ width: "46%" }} /></div>
      </article>
    </section>

    <section class="quick-action-bar" aria-label="Quick actions">
      <div class="quick-action-intro">
        <p class="page-eyebrow">Quick actions</p>
        <strong>What would you like to do?</strong>
      </div>
      <button onClick={() => onNavigate("transfer")}><span>↗</span> Send money</button>
      <button onClick={() => onNavigate("beneficiaries")}><span>＋</span> Add beneficiary</button>
      <button onClick={() => onNavigate("cards")}><span>▱</span> Manage cards</button>
      <button onClick={() => onNavigate("loans")}><span>◇</span> View loans</button>
    </section>

    <section class="chart-grid" aria-label="Financial charts">
      <article class="surface-card chart-card">
        <div class="card-heading">
          <div>
            <p class="page-eyebrow">Six-month overview</p>
            <h3>Cash flow</h3>
          </div>
          <div class="chart-heading-actions">
            <span class="status-chip status-chip--positive">● Healthy</span>
            <button class="period-select">Last 6 months⌄</button>
          </div>
        </div>
        <CashFlowChart />
      </article>

      <article class="surface-card chart-card">
        <div class="card-heading">
          <div>
            <p class="page-eyebrow">July spending</p>
            <h3>Spending breakdown</h3>
          </div>
          <button class="card-menu" aria-label="Spending options">•••</button>
        </div>
        <SpendingBreakdownChart />
      </article>
    </section>

    <section class="dashboard-grid">
      <article class="surface-card">
        <div class="card-heading">
          <div>
            <p class="page-eyebrow">Portfolio</p>
            <h3>Your accounts</h3>
          </div>
          <button class="text-button" onClick={() => onNavigate("accounts")}>View all →</button>
        </div>
        <div class="account-list">
          <div class="account-row">
            <span class="account-icon">SA</span>
            <div><strong>Everyday Savings</strong><small>•• 4721 · Savings</small></div>
            <strong>₹2,84,100.20</strong>
          </div>
          <div class="account-row">
            <span class="account-icon account-icon--gold">CA</span>
            <div><strong>Current Account</strong><small>•• 8490 · Current</small></div>
            <strong>₹1,52,550.00</strong>
          </div>
          <div class="account-row">
            <span class="account-icon account-icon--green">FD</span>
            <div><strong>Fixed Deposit</strong><small>•• 1337 · Deposit</small></div>
            <strong>₹46,000.00</strong>
          </div>
        </div>
      </article>

      <article class="surface-card">
        <div class="card-heading">
          <div>
            <p class="page-eyebrow">Latest activity</p>
            <h3>Recent transactions</h3>
          </div>
          <button class="text-button" onClick={() => onNavigate("transactions")}>View all →</button>
        </div>
        <div class="transaction-list">
          {transactions.map((transaction) => (
            <div class="transaction-row" key={transaction.name}>
              <span class="transaction-icon">{transaction.icon}</span>
              <div><strong>{transaction.name}</strong><small>{transaction.date}</small></div>
              <strong class={transaction.amount.startsWith("+") ? "amount-positive" : ""}>
                {transaction.amount}
              </strong>
            </div>
          ))}
        </div>
      </article>
    </section>
  </div>
);
