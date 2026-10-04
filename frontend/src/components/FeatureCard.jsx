export default function FeatureCard({ title, description, icon, active, disabled, loading, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={[
        "flex h-full flex-col items-start gap-2 rounded-2xl border p-4 text-left shadow-sm transition-colors",
        active ? "border-brand bg-brand-soft" : "border-line bg-white hover:border-brand/60",
        disabled ? "cursor-not-allowed opacity-55 hover:border-line" : "",
      ].join(" ")}
    >
      <span className={active ? "text-brand" : "text-ink"}>{icon}</span>
      <span className="text-lg font-bold">{title}</span>
      <span className="text-sm text-muted">{loading ? "Working on it…" : description}</span>
    </button>
  );
}
