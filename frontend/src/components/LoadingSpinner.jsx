export default function LoadingSpinner({ label = "Working on it…" }) {
  return (
    <div className="flex items-center gap-3 text-muted" role="status" aria-live="polite">
      <span
        className="h-5 w-5 animate-spin rounded-full border-[3px] border-brand-soft border-t-brand"
        aria-hidden="true"
      />
      <span>{label}</span>
    </div>
  );
}
