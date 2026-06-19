/**
 * OpenAI resume–job matcher.
 *
 * Sends resume + job description to GPT-4o with a strict JSON-only prompt.
 * Response is parsed and returned to resume.controller for the frontend UI.
 * Requires OPENAI_API_KEY in backend/.env.
 */

/**
 * @param {string} resume - Plain-text resume content from the user
 * @param {string} jobDescription - Job.description from Prisma
 * @returns {{ score: number, matchedKeywords: string[], missingKeywords: string[], summary: string }}
 */

const OpenAI = require("openai");
const client = new OpenAI({ apikey: process.env.OPENAI_API_KEY });

async function scoreResume(resume, jobDescription) {
  const response = await client.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 500,
    messages: [
      {
        role: "user",
        content: `You are a resume scorer. Compare this resume to the job description.
        Return ONLY a JSON object like this:
        {
        "scorer": 78,
        "missingKeywords":["Docker", AWS],
        "matchedKeywords": ["React","Node.js"],
        "summary":"Strong frontend match but missing cloud expriance"
        }
        Resume: ${resume}
        Job Description: ${jobDescription}
        
        
        `,
      },
    ],
  });

  const text = response.choices[0].message.content;

  // Strip markdown fences if the model wraps JSON in ```json blocks.
  return JSON.parse(text.replace(/```json```/g, "").trim());
}
