import type { ReactNode } from "react";

export function SectionHeading({
  kicker,
  title,
  text,
  as = "h2",
}: {
  kicker?: string;
  title: string;
  text?: string;
  as?: "h1" | "h2";
}) {
  const Title = as;
  return (
    <div className="max-w-2xl">
      {kicker ? <p className="kicker">{kicker}</p> : null}
      <Title className={`${kicker ? "mt-3" : ""} text-4xl leading-[1.05] text-ink md:text-5xl`}>{title}</Title>
      {text ? <p className="mt-4 text-base leading-7 text-muted">{text}</p> : null}
    </div>
  );
}

export function LoadingState({ label }: { label: string }) {
  return (
    <p role="status" className="py-8 text-sm text-muted">
      {label}
    </p>
  );
}

export function EmptyState({ title, text, action }: { title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-line bg-paper/70 px-6 py-10">
      <p className="font-serif text-2xl text-ink">{title}</p>
      {text ? <p className="mt-2 max-w-xl text-sm leading-6 text-muted">{text}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function ErrorState({ label }: { label: string }) {
  return (
    <p role="alert" className="rounded-2xl border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
      {label}
    </p>
  );
}
