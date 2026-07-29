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

export const Dashboard: FunctionalComponent<DashboardProps> = ({
  onNavigate
}) => (
  <div class="dashboard-page page-stack">
    <section class="welcome-banner">
      <div>
        <p class="page-eyebrow">Tuesday, 28 July</p>
        <h2>Good morning, Sreeja.</h2>
        <p>Here is what is happening with your money today.</p>
      </div>
      <oj-button
        chroming="callToAction"
        onojAction={() => onNavigate("transfer")}
      >
        Make a transfer
      </oj-button>
    </section>

    <section class="metric-grid" aria-label="Account summary">
      <article class="metric-card metric-card--primary">
        <span>Total balance</span>
        <strong>₹4,82,650.20</strong>
        <small>Across 3 accounts</small>
        <div class="trend trend--light">↑ 4.8% this month</div>
      </article>
      <article class="metric-card">
        <span>Monthly income</span>
        <strong>₹1,04,500</strong>
        <small>July 2026</small>
        <div class="trend">↑ ₹8,200 vs June</div>
      </article>
      <article class="metric-card">
        <span>Monthly spending</span>
        <strong>₹48,730</strong>
        <small>46% of income</small>
        <div class="progress-track">
          <span style={{ width: "46%" }} />
        </div>
      </article>
    </section>
    <section class="chart-grid" aria-label="Financial charts">
      <article class="surface-card chart-card">
        <div class="card-heading">
          <div>
            <p class="page-eyebrow">Six-month overview</p>
            <h3>Cash flow</h3>
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
          <button class="text-button" onClick={() => onNavigate("accounts")}>
            View all
          </button>
        </div>
        <div class="account-list">
          <div class="account-row">
            <span class="account-icon">SA</span>
            <div><strong>Everyday Savings</strong><small>•• 4721</small></div>
            <strong>₹2,84,100.20</strong>
          </div>
          <div class="account-row">
            <span class="account-icon account-icon--gold">CA</span>
            <div><strong>Current Account</strong><small>•• 8490</small></div>
            <strong>₹1,52,550.00</strong>
          </div>
          <div class="account-row">
            <span class="account-icon account-icon--green">FD</span>
            <div><strong>Fixed Deposit</strong><small>•• 1337</small></div>
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
          <button
            class="text-button"
            onClick={() => onNavigate("transactions")}
          >
            View all
          </button>
        </div>
        <div class="transaction-list">
          {transactions.map((transaction) => (
            <div class="transaction-row" key={transaction.name}>
              <span class="transaction-icon">{transaction.icon}</span>
              <div>
                <strong>{transaction.name}</strong>
                <small>{transaction.date}</small>
              </div>
              <strong
                class={transaction.amount.startsWith("+") ? "amount-positive" : ""}
              >
                {transaction.amount}
              </strong>
            </div>
          ))}
        </div>
      </article>
    </section>
  </div>
);

