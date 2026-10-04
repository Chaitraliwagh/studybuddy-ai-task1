import { useEffect, useRef, useState } from "react";
import {
  MIN_NOTES,
  createRevisionPlan,
  explainSimply,
  generateQuiz,
  getHealth,
  summarize,
} from "./lib/api";
import { SAMPLE_NOTES } from "./lib/sampleNotes";
import ChatBox from "./components/ChatBox";
import ErrorMessage from "./components/ErrorMessage";
import FeatureCard from "./components/FeatureCard";
import { BookIcon, ChatIcon, PlanIcon, QuizIcon, SimpleIcon, SummaryIcon } from "./components/Icons";
import LoadingSpinner from "./components/LoadingSpinner";
import NotesEditor from "./components/NotesEditor";
import QuizCard from "./components/QuizCard";
import RevisionPlan from "./components/RevisionPlan";
import SimpleMarkdown from "./components/SimpleMarkdown";

const STORAGE_KEY = "studybuddy.notes";

const TOOLS = {
  ask: { title: "Ask AI", description: "Ask questions about your notes", icon: <ChatIcon /> },
  explain: {
    title: "Explain Simply",
    description: "Beginner-friendly rewrite",
    icon: <SimpleIcon />,
    run: explainSimply,
    loadingLabel: "Rewriting your notes in simple words…",
  },
  summary: {
    title: "Summarize",
    description: "Short summary of the key points",
    icon: <SummaryIcon />,
    run: summarize,
    loadingLabel: "Summarizing your notes…",
  },
  quiz: {
    title: "Generate Quiz",
    description: "5 multiple-choice questions",
    icon: <QuizIcon />,
    run: (notes) => generateQuiz(notes, 5),
    loadingLabel: "Writing quiz questions… this one can take a little longer.",
  },
  revision: {
    title: "Create Revision Plan",
    description: "Study sessions based on your notes",
    icon: <PlanIcon />,
    run: createRevisionPlan,
    loadingLabel: "Planning your revision sessions…",
  },
};

function loadSavedNotes() {
  try {
    return localStorage.getItem(STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

function storeNotes(value) {
  try {
    if (value) localStorage.setItem(STORAGE_KEY, value);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage can be blocked; the app still works for this session */
  }
}

function HealthPill() {
  const [state, setState] = useState({ kind: "checking" });

  useEffect(() => {
    let cancelled = false;
    getHealth()
      .then((h) => {
        if (cancelled) return;
        if (!h.ollama_reachable) setState({ kind: "warn", text: "Ollama isn't running" });
        else if (!h.model_installed) setState({ kind: "warn", text: `Model ${h.model} not installed` });
        else setState({ kind: "ok", text: `${h.model} ready` });
      })
      .catch(() => !cancelled && setState({ kind: "warn", text: "Backend not reachable" }));
    return () => {
      cancelled = true;
    };
  }, []);

  const styles = {
    checking: "border-line bg-white text-muted",
    ok: "border-good/40 bg-good-soft text-good",
    warn: "border-bad/40 bg-bad-soft text-bad",
  }[state.kind];

  return (
    <p className={`rounded-full border px-3 py-1 text-sm font-bold ${styles}`} role="status">
      {state.kind === "checking" ? "Checking AI…" : state.text}
    </p>
  );
}

export default function App() {
  const initial = loadSavedNotes();
  const [draft, setDraft] = useState(initial);
  const [savedNotes, setSavedNotes] = useState(initial);
  const [active, setActive] = useState("ask");
  const [results, setResults] = useState({});
  const [status, setStatus] = useState({});
  const [notesVersion, setNotesVersion] = useState(0);
  const versionRef = useRef(0);
  const panelRef = useRef(null);

  const hasNotes = savedNotes.length >= MIN_NOTES;

  function resetForNewNotes(value) {
    versionRef.current += 1; // answers for the old notes are ignored if they arrive late
    setNotesVersion(versionRef.current);
    setSavedNotes(value);
    storeNotes(value);
    setResults({});
    setStatus({});
  }

  function saveNotes() {
    const value = draft.trim();
    if (value.length < MIN_NOTES) return;
    setDraft(value);
    resetForNewNotes(value);
  }

  function clearNotes() {
    setDraft("");
    resetForNewNotes("");
  }

  async function run(tool) {
    const version = versionRef.current;
    setStatus((s) => ({ ...s, [tool]: { loading: true, error: "" } }));
    try {
      const data = await TOOLS[tool].run(savedNotes);
      if (version !== versionRef.current) return;
      setResults((r) => ({ ...r, [tool]: { data, id: Date.now() } }));
      setStatus((s) => ({ ...s, [tool]: { loading: false, error: "" } }));
    } catch (err) {
      if (version !== versionRef.current) return;
      setStatus((s) => ({ ...s, [tool]: { loading: false, error: err.message } }));
    }
  }

  function selectTool(tool) {
    setActive(tool);
    if (tool !== "ask" && !results[tool] && !status[tool]?.loading) run(tool);
    requestAnimationFrame(() =>
      panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    );
  }

  const current = status[active] || {};
  const result = results[active];
  const tool = TOOLS[active];

  function renderResult() {
    if (active === "quiz") return <QuizCard key={result.id} questions={result.data.questions} />;
    if (active === "revision") return <RevisionPlan text={result.data.result} />;
    return (
      <div className="rounded-xl border border-line bg-white p-4 sm:p-5">
        <SimpleMarkdown text={result.data.result} />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand text-white">
              <BookIcon />
            </span>
            <div>
              <h1 className="text-2xl font-bold leading-tight">StudyBuddy AI</h1>
              <p className="text-muted">Your personal AI study companion</p>
            </div>
          </div>
          <HealthPill />
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        <NotesEditor
          draft={draft}
          onChange={setDraft}
          onSave={saveNotes}
          onClear={clearNotes}
          onLoadSample={() => setDraft(SAMPLE_NOTES)}
          savedNotes={savedNotes}
        />

        <section aria-labelledby="tools-heading">
          <h2 id="tools-heading" className="mb-3 text-xl font-bold">
            What do you want to do?
          </h2>
          {!hasNotes && (
            <p className="mb-3 rounded-xl border border-line bg-white p-3 text-muted">
              Paste your notes above and click <strong>Save notes</strong> to unlock these tools.
            </p>
          )}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {Object.entries(TOOLS).map(([key, t]) => (
              <FeatureCard
                key={key}
                title={t.title}
                description={t.description}
                icon={t.icon}
                active={active === key}
                disabled={!hasNotes}
                loading={status[key]?.loading}
                onClick={() => selectTool(key)}
              />
            ))}
          </div>
        </section>

        <section
          ref={panelRef}
          aria-labelledby="panel-heading"
          className="scroll-mt-4 rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 id="panel-heading" className="text-xl font-bold">
              {tool.title}
            </h2>
            {active !== "ask" && result && !current.loading && (
              <button
                type="button"
                onClick={() => run(active)}
                className="rounded-lg border border-line px-3 py-1.5 font-bold text-brand hover:bg-brand-soft"
              >
                Generate again
              </button>
            )}
          </div>

          {!hasNotes ? (
            <p className="text-muted">
              Nothing to show yet. Click “Try sample notes” above to see how StudyBuddy works, or paste your own.
            </p>
          ) : active === "ask" ? (
            <ChatBox key={notesVersion} notes={savedNotes} />
          ) : (
            <div className="space-y-4">
              {current.loading && <LoadingSpinner label={tool.loadingLabel} />}
              <ErrorMessage message={current.error} onRetry={() => run(active)} />
              {!current.loading && !current.error && result && renderResult()}
            </div>
          )}
        </section>
      </main>

      <footer className="mx-auto max-w-5xl px-4 pb-10 text-sm text-muted sm:px-6">
        <p>
          Runs on a Gemma model on your own computer through Ollama. Small models can make mistakes, so check
          important facts against your textbook.
        </p>
      </footer>
    </div>
  );
}
