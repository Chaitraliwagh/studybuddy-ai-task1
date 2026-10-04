// All backend calls live here. The address comes from VITE_API_URL (see .env.example).
const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");

export const MIN_NOTES = 20;
export const MAX_NOTES = 12000; // keep in sync with MAX_NOTES_CHARS in backend/.env

function errorText(data, status) {
  const detail = data && data.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail.length > 0) {
    return String(detail[0].msg || "Invalid input").replace(/^Value error, /, "");
  }
  return `Something went wrong (error ${status}).`;
}

async function request(path, options) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, options);
  } catch {
    throw new Error(
      `Can't reach the StudyBuddy backend at ${API_URL}. Make sure it is running (see the README).`
    );
  }
  let data = null;
  try {
    data = await response.json();
  } catch {
    /* body was not JSON */
  }
  if (!response.ok) throw new Error(errorText(data, response.status));
  return data;
}

function post(path, body) {
  return request(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export const getHealth = () => request("/api/health");
export const askQuestion = (notes, question, history) =>
  post("/api/ask", { notes, question, history });
export const summarize = (notes) => post("/api/summarize", { notes });
export const explainSimply = (notes) => post("/api/explain", { notes });
export const generateQuiz = (notes, numQuestions = 5) =>
  post("/api/quiz", { notes, num_questions: numQuestions });
export const createRevisionPlan = (notes) => post("/api/revision", { notes });
