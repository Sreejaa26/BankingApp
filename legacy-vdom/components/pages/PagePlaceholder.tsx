import { FunctionalComponent, h } from "preact";
import "ojs/ojbutton";

interface PagePlaceholderProps {
  eyebrow: string;
  title: string;
  description: string;
  action: string;
  endpoint: string;
  highlights: Array<{ label: string; value: string }>;
}

interface WorkspaceItem {
  icon: string;
  name: string;
  meta: string;
  value: string;
  status?: string;
  positive?: boolean;
  progress?: number;
}

interface WorkspaceContent {
  primaryEyebrow: string;
  primaryTitle: string;
  secondaryEyebrow: string;
  secondaryTitle: string;
  secondaryCopy: string;
  items: WorkspaceItem[];
  secondaryItems: WorkspaceItem[];
}

const workspaceContent: Record<string, WorkspaceContent> = {
  Accounts: {
    primaryEyebrow: "Portfolio",
    primaryTitle: "Your accounts",
    secondaryEyebrow: "Monthly snapshot",
    secondaryTitle: "Balance distribution",
    secondaryCopy: "Your savings account holds most of your available balance.",
    items: [
      { icon: "SA", name: "Savings account", meta: "•••• 4821 · Primary", value: "₹3,24,850", status: "Active" },
      { icon: "CA", name: "Current account", meta: "•••• 7634 · Business", value: "₹1,11,800", status: "Active" },
      { icon: "FD", name: "Fixed deposit", meta: "Matures 18 Mar 2027", value: "₹46,000", status: "6.8% p.a." }
    ],
    secondaryItems: [
      { icon: "01", name: "Savings", meta: "67% of portfolio", value: "₹3.25L", progress: 67 },
      { icon: "02", name: "Current", meta: "23% of portfolio", value: "₹1.12L", progress: 23 },
      { icon: "03", name: "Deposits", meta: "10% of portfolio", value: "₹46K", progress: 10 }
    ]
  },
  Transactions: {
    primaryEyebrow: "Latest activity",
    primaryTitle: "Recent transactions",
    secondaryEyebrow: "Spending overview",
    secondaryTitle: "Top categories",
    secondaryCopy: "Essentials and monthly bills account for most of this month’s spend.",
    items: [
      { icon: "UP", name: "UPI · Fresh Basket", meta: "Today, 10:42 AM", value: "−₹1,840", status: "Completed" },
      { icon: "IN", name: "Salary credit", meta: "28 Jul, 9:05 AM", value: "+₹82,500", status: "Received", positive: true },
      { icon: "EB", name: "Electricity bill", meta: "27 Jul, 6:30 PM", value: "−₹3,260", status: "Auto-paid" },
      { icon: "TR", name: "Transfer to Ananya", meta: "26 Jul, 2:14 PM", value: "−₹12,000", status: "Completed" }
    ],
    secondaryItems: [
      { icon: "01", name: "Bills & utilities", meta: "8 payments", value: "₹18,400", progress: 72 },
      { icon: "02", name: "Shopping", meta: "11 payments", value: "₹14,260", progress: 56 },
      { icon: "03", name: "Food & dining", meta: "9 payments", value: "₹9,870", progress: 39 }
    ]
  },
  Beneficiaries: {
    primaryEyebrow: "Trusted contacts",
    primaryTitle: "Recently paid",
    secondaryEyebrow: "Beneficiary status",
    secondaryTitle: "Your payment network",
    secondaryCopy: "All recently used beneficiaries have completed bank verification.",
    items: [
      { icon: "AS", name: "Ananya Sharma", meta: "HDFC Bank · •••• 2046", value: "₹12,000", status: "Paid 26 Jul" },
      { icon: "RM", name: "Rohan Mehta", meta: "ICICI Bank · •••• 9183", value: "₹8,500", status: "Paid 19 Jul" },
      { icon: "SP", name: "Sreeja Pamu", meta: "Northstar Bank · •••• 5502", value: "₹25,000", status: "Paid 12 Jul" }
    ],
    secondaryItems: [
      { icon: "✓", name: "Verified", meta: "Ready for instant payment", value: "11", progress: 92 },
      { icon: "⌛", name: "Pending approval", meta: "Available after cooling period", value: "1", progress: 8 }
    ]
  },
  "Transfer Money": {
    primaryEyebrow: "Quick transfer",
    primaryTitle: "Start a secure payment",
    secondaryEyebrow: "Upcoming",
    secondaryTitle: "Scheduled transfers",
    secondaryCopy: "Review scheduled payments before they are processed.",
    items: [
      { icon: "1", name: "Choose an account", meta: "Savings account · ₹3,24,850 available", value: "From", status: "Selected" },
      { icon: "2", name: "Select beneficiary", meta: "Choose from 12 verified contacts", value: "To", status: "Required" },
      { icon: "3", name: "Enter transfer details", meta: "Amount, purpose and payment date", value: "₹0", status: "Next step" }
    ],
    secondaryItems: [
      { icon: "AS", name: "Ananya Sharma", meta: "02 Aug · Monthly rent", value: "₹22,000", status: "Scheduled" },
      { icon: "MF", name: "Mutual Fund SIP", meta: "05 Aug · Auto transfer", value: "₹10,000", status: "Scheduled" }
    ]
  },
  Loans: {
    primaryEyebrow: "Repayment overview",
    primaryTitle: "Active loans",
    secondaryEyebrow: "Next payment",
    secondaryTitle: "Upcoming EMI",
    secondaryCopy: "Your next instalment is scheduled for automatic payment from Savings •••• 4821.",
    items: [
      { icon: "HL", name: "Home loan", meta: "Loan •••• 8401 · 7.9% p.a.", value: "₹7,64,000", status: "62% repaid", progress: 62 },
      { icon: "PL", name: "Personal loan", meta: "Loan •••• 1178 · 10.4% p.a.", value: "₹78,000", status: "74% repaid", progress: 74 }
    ],
    secondaryItems: [
      { icon: "05", name: "Home loan EMI", meta: "Due 05 Aug 2026", value: "₹18,400", status: "Auto-pay on" },
      { icon: "08", name: "Personal loan EMI", meta: "Due 08 Aug 2026", value: "₹6,200", status: "Auto-pay on" }
    ]
  },
  Cards: {
    primaryEyebrow: "Wallet",
    primaryTitle: "Your cards",
    secondaryEyebrow: "Credit usage",
    secondaryTitle: "Limit overview",
    secondaryCopy: "You have used 12% of your total credit limit this billing cycle.",
    items: [
      { icon: "VI", name: "Northstar Signature", meta: "Visa · •••• 4902", value: "₹1,76,400", status: "Available" },
      { icon: "MC", name: "Northstar Debit", meta: "Mastercard · •••• 8214", value: "₹3,24,850", status: "Active" }
    ],
    secondaryItems: [
      { icon: "₹", name: "Current spend", meta: "Statement closes 12 Aug", value: "₹23,600", progress: 12 },
      { icon: "L", name: "Total limit", meta: "Across active credit cards", value: "₹2,00,000", progress: 100 }
    ]
  },
  Notifications: {
    primaryEyebrow: "Inbox",
    primaryTitle: "Recent notifications",
    secondaryEyebrow: "Preferences",
    secondaryTitle: "Alert summary",
    secondaryCopy: "Critical security and transaction alerts are enabled on all registered channels.",
    items: [
      { icon: "₹", name: "Salary received", meta: "₹82,500 credited to Savings •••• 4821", value: "28 Jul", status: "New", positive: true },
      { icon: "UP", name: "UPI payment successful", meta: "₹1,840 paid to Fresh Basket", value: "Today", status: "New" },
      { icon: "EM", name: "EMI reminder", meta: "Home loan EMI is due on 05 Aug", value: "27 Jul", status: "New" },
      { icon: "✓", name: "Profile verification complete", meta: "Your annual KYC review was approved", value: "24 Jul", status: "Read" }
    ],
    secondaryItems: [
      { icon: "01", name: "Transaction alerts", meta: "Email, SMS and push", value: "On", progress: 100 },
      { icon: "02", name: "Security alerts", meta: "SMS and push", value: "On", progress: 100 },
      { icon: "03", name: "Product updates", meta: "Email only", value: "On", progress: 100 }
    ]
  },
  "Admin Dashboard": {
    primaryEyebrow: "Operations queue",
    primaryTitle: "Items requiring attention",
    secondaryEyebrow: "Platform overview",
    secondaryTitle: "Service status",
    secondaryCopy: "Core banking services are operating within their normal thresholds.",
    items: [
      { icon: "KY", name: "KYC reviews", meta: "12 applications awaiting verification", value: "12", status: "High priority" },
      { icon: "TR", name: "Transfer reviews", meta: "7 payments flagged for review", value: "7", status: "Review" },
      { icon: "AC", name: "Account approvals", meta: "5 new customer applications", value: "5", status: "Pending" }
    ],
    secondaryItems: [
      { icon: "API", name: "Banking API", meta: "42 ms average response", value: "99.99%", status: "Operational", progress: 100 },
      { icon: "UPI", name: "Payments network", meta: "68 ms average response", value: "99.98%", status: "Operational", progress: 100 },
      { icon: "ID", name: "Identity service", meta: "51 ms average response", value: "99.99%", status: "Operational", progress: 100 }
    ]
  }
};

const WorkspaceList: FunctionalComponent<{ items: WorkspaceItem[] }> = ({ items }) => (
  <div class="workspace-list">
    {items.map((item) => (
      <div class="workspace-row" key={`${item.name}-${item.meta}`}>
        <span class="workspace-row__icon" aria-hidden="true">{item.icon}</span>
        <div class="workspace-row__copy">
          <strong>{item.name}</strong>
          <small>{item.meta}</small>
          {typeof item.progress === "number" && (
            <div class="workspace-progress" aria-label={`${item.name}: ${item.progress}%`}>
              <span style={{ width: `${item.progress}%` }} />
            </div>
          )}
        </div>
        <div class="workspace-row__value">
          <strong class={item.positive ? "amount-positive" : ""}>{item.value}</strong>
          {item.status && <small>{item.status}</small>}
        </div>
      </div>
    ))}
  </div>
);

export const PagePlaceholder: FunctionalComponent<PagePlaceholderProps> = ({
  eyebrow,
  title,
  description,
  action,
  endpoint,
  highlights
}) => {
  const content = workspaceContent[title] || workspaceContent.Accounts;

  return (
    <div class="page-stack">
      <section class="page-introduction">
        <div>
          <p class="page-eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <oj-button chroming="callToAction">{action}</oj-button>
      </section>

      <section class="metric-grid metric-grid--compact" aria-label={`${title} summary`}>
        {highlights.map((highlight, index) => (
          <article class={`metric-card${index === 0 ? " metric-card--primary" : ""}`} key={highlight.label}>
            <span>{highlight.label}</span>
            <strong>{highlight.value}</strong>
            <small>{index === 0 ? "Updated moments ago" : "Current overview"}</small>
          </article>
        ))}
      </section>

      <section class="workspace-grid">
        <article class="surface-card workspace-panel">
          <div class="card-heading">
            <div>
              <p class="page-eyebrow">{content.primaryEyebrow}</p>
              <h3>{content.primaryTitle}</h3>
            </div>
            <button class="text-button" type="button">View all</button>
          </div>
          <WorkspaceList items={content.items} />
        </article>

        <article class="surface-card workspace-panel">
          <div class="card-heading">
            <div>
              <p class="page-eyebrow">{content.secondaryEyebrow}</p>
              <h3>{content.secondaryTitle}</h3>
            </div>
            <span class="status-chip status-chip--positive">Live</span>
          </div>
          <p class="workspace-panel__description">{content.secondaryCopy}</p>
          <WorkspaceList items={content.secondaryItems} />
          <div class="workspace-integration">
            <span aria-hidden="true">◇</span>
            <p>
              <strong>API-ready workspace</strong>
              <small>Connect to <code>{endpoint}</code> when live banking data is available.</small>
            </p>
          </div>
        </article>
      </section>
    </div>
  );
};
