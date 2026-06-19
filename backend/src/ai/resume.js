/**
 * OpenAI resume–job matcher.
 *
 * Sends resume + job description to GPT-4o with a strict JSON-only prompt.
 * Response is parsed and returned to resume.controller for the frontend UI.
 * Requires OPENAI_API_KEY in backend/.env.
 */