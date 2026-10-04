import { useState } from "react";

const LETTERS = ["A", "B", "C", "D"];

export default function QuizCard({ questions }) {
  const [picked, setPicked] = useState({}); // { questionIndex: optionIndex }

  const answered = Object.keys(picked).length;
  const score = questions.reduce((sum, q, i) => sum + (picked[i] === q.answer_index ? 1 : 0), 0);
  const finished = answered === questions.length;

  return (
    <div className="space-y-5">
      {questions.map((q, qi) => {
        const choice = picked[qi];
        const done = choice !== undefined;
        return (
          <fieldset key={qi} className="rounded-xl border border-line bg-white p-4">
            <legend className="px-1 font-bold">
              Question {qi + 1} of {questions.length}
            </legend>
            <p className="mb-3 text-lg">{q.question}</p>
            <div className="grid gap-2">
              {q.options.map((option, oi) => {
                const isCorrect = oi === q.answer_index;
                const isChosen = oi === choice;
                let style = "border-line bg-white hover:border-brand/60";
                if (done && isCorrect) style = "border-good bg-good-soft";
                else if (done && isChosen) style = "border-bad bg-bad-soft";
                return (
                  <button
                    key={oi}
                    type="button"
                    disabled={done}
                    onClick={() => setPicked((p) => ({ ...p, [qi]: oi }))}
                    className={`flex items-start gap-3 rounded-lg border px-3 py-2 text-left disabled:cursor-default ${style}`}
                  >
                    <span className="font-bold">{LETTERS[oi]}</span>
                    <span className="flex-1">{option}</span>
                    {done && isCorrect && <span className="font-bold text-good">Correct</span>}
                    {done && isChosen && !isCorrect && <span className="font-bold text-bad">Your answer</span>}
                  </button>
                );
              })}
            </div>
            {done && (
              <p className="mt-3 rounded-lg bg-paper p-3" aria-live="polite">
                <span className="font-bold">{choice === q.answer_index ? "Right. " : "Not quite. "}</span>
                {q.explanation}
              </p>
            )}
          </fieldset>
        );
      })}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-brand-soft p-4" aria-live="polite">
        <p className="font-bold">
          {finished
            ? `You scored ${score} out of ${questions.length}.`
            : `${answered} of ${questions.length} answered`}
        </p>
        {answered > 0 && (
          <button
            type="button"
            onClick={() => setPicked({})}
            className="rounded-lg border border-brand/40 bg-white px-3 py-1.5 font-bold text-brand hover:bg-white/70"
          >
            Retry this quiz
          </button>
        )}
      </div>
    </div>
  );
}
