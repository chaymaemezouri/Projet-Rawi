export function Mark({
  tone = "dark",
  className = "h-11 w-11",
}: {
  tone?: "dark" | "light";
  className?: string;
}) {
  const tile = tone === "dark" ? "#702230" : "#F5EBDD";
  const seed = tone === "dark" ? "#F5EBDD" : "#702230";
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect width="64" height="64" rx="18" fill={tile} />
      <path d="M32 12c8 8 12 14 12 21a12 12 0 0 1-24 0c0-7 4-13 12-21Z" fill={seed} />
      <circle cx="32" cy="31" r="3.2" fill="#BE7958" />
      <path d="M18 50h28" stroke="#D7B77C" strokeWidth="1.6" />
    </svg>
  );
}

export function Wordmark() {
  return <img src="/images/rawi-logo.png" alt="RAWI راوي" className="h-[4.5rem] w-auto" />;
}
