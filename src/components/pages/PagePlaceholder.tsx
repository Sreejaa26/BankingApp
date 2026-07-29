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

export const PagePlaceholder: FunctionalComponent<PagePlaceholderProps> = ({
  eyebrow,
  title,
  description,
  action,
  endpoint,
  highlights
}) => (
  <div class="page-stack">
    <section class="page-introduction">
      <div>
        <p class="page-eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <oj-button chroming="callToAction">{action}</oj-button>
    </section>

    <section class="metric-grid metric-grid--compact">
      {highlights.map((highlight) => (
        <article class="metric-card" key={highlight.label}>
          <span>{highlight.label}</span>
          <strong>{highlight.value}</strong>
          <small>Demo data</small>
        </article>
      ))}
    </section>

    <section class="surface-card empty-state">
      <span class="empty-state__icon" aria-hidden="true">◇</span>
      <h3>{title} workspace</h3>
      <p>
        The responsive page shell is ready. Connect this view to
        <code>{endpoint}</code> when the banking API is available.
      </p>
      <oj-button chroming="outlined">View integration notes</oj-button>
    </section>
  </div>
);

