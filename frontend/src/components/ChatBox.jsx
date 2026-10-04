import { useEffect, useRef, useState } from "react";
import { askQuestion } from "../lib/api";
import ErrorMessage from "./ErrorMessage";
import LoadingSpinner from "./LoadingSpinner";
import SimpleMarkdown from "./SimpleMarkdown";

const SUGGESTIONS = ["Explain this in simple words.", "What are the most important points?"];

export default function ChatBox({ notes }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastQuestion, setLastQuestion] = useState("");
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, loading, error]);

  async function send(question, history) {
    setLoading(true);
    setError("");
    setLastQuestion(question);
    try {
      const data = await askQuestion(notes, question, history);
      setMessages((prev) => [...prev, { role: "assistant", content: data.answer }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function submit(text) {
    const question = text.trim();
    if (!question || loading) return;
    const history = messages.slice(-6).map(({ role, content }) => ({ role, content }));
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setInput("");
    send(question, history);
  }

  function retry() {
    // The question is already in the chat, so history is everything before it.
    const history = messages.slice(0, -1).slice(-6).map(({ role, content }) => ({ role, content }));
    send(lastQuestion, history);
  }

  function clearChat() {
    setMessages([]);
    setError("");
    setInput("");
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-muted">Ask anything about your notes. Answers come from your notes only.</p>
        <button
          type="button"
          onClick={clearChat}
          disabled={messages.length === 0 && !error}
          className="shrink-0 rounded-lg border border-line px-3 py-1.5 font-bold text-muted hover:bg-paper disabled:cursor-not-allowed disabled:opacity-50"
        >
          Clear chat
        </button>
      </div>

      <div
        className="flex max-h-[28rem] min-h-40 flex-col gap-3 overflow-y-auto rounded-xl border border-line bg-paper p-3 sm:p-4"
        aria-live="polite"
      >
        {messages.length === 0 && !loading && (
          <div className="m-auto max-w-md text-center text-muted">
            <p className="mb-3">No questions yet. Try one of these:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => submit(s)}
                  className="rounded-full border border-brand/40 bg-white px-3 py-1.5 font-bold text-brand hover:bg-brand-soft"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div
              className={
                m.role === "user"
                  ? "max-w-[85%] rounded-2xl rounded-br-sm bg-brand px-4 py-2 text-white"
                  : "max-w-[92%] rounded-2xl rounded-bl-sm border border-line bg-white px-4 py-3"
              }
            >
              <span className="sr-only">{m.role === "user" ? "You: " : "StudyBuddy: "}</span>
              {m.role === "user" ? <p className="whitespace-pre-wrap">{m.content}</p> : <SimpleMarkdown text={m.content} />}
            </div>
          </div>
        ))}

        {loading && (
          <div className="rounded-2xl border border-line bg-white px-4 py-3">
            <LoadingSpinner label="Reading your notes…" />
          </div>
        )}
        <div ref={endRef} />
      </div>

      <ErrorMessage message={error} onRetry={retry} />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(input);
        }}
        className="flex flex-col gap-2 sm:flex-row"
      >
        <label htmlFor="question" className="sr-only">
          Your question
        </label>
        <input
          id="question"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={1000}
          placeholder="Type your question…"
          className="min-w-0 flex-1 rounded-xl border border-line bg-white px-4 py-2.5 focus:border-brand"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="rounded-xl bg-brand px-5 py-2.5 font-bold text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-muted/40"
        >
          Ask
        </button>
      </form>
    </div>
  );
}
