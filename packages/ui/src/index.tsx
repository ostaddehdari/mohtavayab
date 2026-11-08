import type { ComponentPropsWithoutRef, ReactNode } from 'react';

function classes(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(' ');
}

export function Surface({
  children,
  className,
  ...props
}: ComponentPropsWithoutRef<'section'> & { children: ReactNode }) {
  return (
    <section className={classes('ui-surface', className)} {...props}>
      {children}
    </section>
  );
}

export function StatusBadge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'positive' | 'warning' | 'danger' | 'info' | 'neutral';
}) {
  return <span className={classes('ui-badge', `ui-badge--${tone}`)}>{children}</span>;
}

export function MetricCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <article className="ui-metric-card">
      <span>{label}</span>
      <strong dir="auto">{value}</strong>
      <small>{hint}</small>
    </article>
  );
}

export function Skeleton({ label = 'در حال بارگذاری' }: { label?: string }) {
  return <span className="ui-skeleton" role="status" aria-label={label} />;
}
