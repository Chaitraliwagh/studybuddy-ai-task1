// Tiny renderer for the formatting our prompts ask for: ## headings, - bullets, **bold**.
// It builds React elements (never raw HTML), so model output can't inject markup.
function inline(text) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") && part.length > 4 ? (
      <strong key={i}>{part.slice(2, -2)}</strong>
    ) : (
      part
    )
  );
}

export default function SimpleMarkdown({ text }) {
  const blocks = [];
  let bullets = [];
  const flush = () => {
    if (bullets.length) {
      blocks.push({ type: "ul", items: bullets });
      bullets = [];
    }
  };

  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim();
    const bullet = line.match(/^(?:[-*•]|\d+[.)])\s+(.*)$/);
    const heading = line.match(/^#{1,6}\s+(.*)$/);
    if (bullet) bullets.push(bullet[1]);
    else {
      flush();
      if (heading) blocks.push({ type: "h", text: heading[1] });
      else if (line) blocks.push({ type: "p", text: line });
    }
  }
  flush();

  return (
    <div className="space-y-3 leading-relaxed">
      {blocks.map((b, i) => {
        if (b.type === "h")
          return (
            <h4 key={i} className="pt-2 text-lg font-bold">
              {inline(b.text)}
            </h4>
          );
        if (b.type === "ul")
          return (
            <ul key={i} className="list-disc space-y-1.5 pl-6 marker:text-brand">
              {b.items.map((item, j) => (
                <li key={j}>{inline(item)}</li>
              ))}
            </ul>
          );
        return <p key={i}>{inline(b.text)}</p>;
      })}
    </div>
  );
}
