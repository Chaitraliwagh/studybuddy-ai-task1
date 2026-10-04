export default function ErrorMessage({ message, onRetry }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-xl border border-bad/30 bg-bad-soft p-4 text-bad sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="font-bold">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="shrink-0 rounded-lg border border-bad/40 bg-white px-3 py-1.5 font-bold hover:bg-bad-soft"
        >
          Try again
        </button>
      )}
    </div>
  );
}
