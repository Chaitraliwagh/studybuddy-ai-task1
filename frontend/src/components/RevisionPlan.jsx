import SimpleMarkdown from "./SimpleMarkdown";

// Splits the model's text at "## " headings so each session becomes its own card.
function splitSections(text) {
  const sections = [];
  let current = null;
  for (const line of text.split("\n")) {
    if (/^\s*#{1,6}\s+/.test(line)) {
      current = { title: line.replace(/^\s*#{1,6}\s+/, "").trim(), body: [] };
      sections.push(current);
    } else if (current) {
      current.body.push(line);
    } else if (line.trim()) {
      current = { title: "", body: [line] };
      sections.push(current);
    }
  }
  return sections;
}

export default function RevisionPlan({ text }) {
  const sections = splitSections(text);
  return (
    <div className="grid gap-3">
      {sections.map((s, i) => (
        <section key={i} className="rounded-xl border border-line bg-white p-4">
          {s.title && <h4 className="mb-2 text-lg font-bold">{s.title.replace(/\*\*/g, "")}</h4>}
          <SimpleMarkdown text={s.body.join("\n")} />
        </section>
      ))}
    </div>
  );
}
