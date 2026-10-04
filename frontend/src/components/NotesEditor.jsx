import { MAX_NOTES, MIN_NOTES } from "../lib/api";

export default function NotesEditor({ draft, onChange, onSave, onClear, onLoadSample, savedNotes }) {
  const length = draft.length;
  const trimmedLength = draft.trim().length;
  const tooShort = trimmedLength < MIN_NOTES;
  const unsaved = draft.trim() !== savedNotes;

  return (
    <section aria-labelledby="notes-heading" className="rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="notes-heading" className="text-xl font-bold">
          Your study notes
        </h2>
        <button
          type="button"
          onClick={onLoadSample}
          className="rounded-lg px-2 py-1 font-bold text-brand underline-offset-4 hover:underline"
        >
          Try sample notes
        </button>
      </div>

      <label htmlFor="notes" className="sr-only">
        Paste your study notes
      </label>
      <textarea
        id="notes"
        value={draft}
        onChange={(e) => onChange(e.target.value)}
        maxLength={MAX_NOTES}
        rows={10}
        placeholder="Paste the chapter or notes you want to understand. For example: “Operating systems manage computer hardware and software resources…”"
        className="ruled min-h-64 w-full resize-y rounded-xl border border-line px-4 py-2 text-base text-ink placeholder:text-muted/80 focus:border-brand"
      />

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted" aria-live="polite">
          {length.toLocaleString()} / {MAX_NOTES.toLocaleString()} characters
          {draft.length > 0 && tooShort && ` · add at least ${MIN_NOTES} characters to save`}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClear}
            disabled={length === 0 && !savedNotes}
            className="rounded-xl border border-line bg-white px-4 py-2 font-bold text-muted hover:bg-paper disabled:cursor-not-allowed disabled:opacity-50"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={tooShort || !unsaved}
            className="rounded-xl bg-brand px-5 py-2 font-bold text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-muted/40"
          >
            {savedNotes && !unsaved ? "Notes saved" : "Save notes"}
          </button>
        </div>
      </div>
    </section>
  );
}
