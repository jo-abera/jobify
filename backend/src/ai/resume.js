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

/*                   USING OPEN AI**********************
/**
const OpenAI = require("openai");
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
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
  return JSON.parse(text.replace(/```(?:json)?/g, "").trim());
}

module.exports = { scoreResume };

 */




/*
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

async function scoreResume(resume, jobDescription) {
  const prompt = `You are a resume scorer. Compare this resume to the job description.
  Return ONLY a JSON object like this, no markdown, no explanation:
  {
    "score": 78,
    "missingKeywords": ["Docker", "AWS"],
    "matchedKeywords": ["React", "Node.js"],
    "summary": "Strong frontend match but missing cloud experience"
  }
  Resume: ${resume}
  Job Description: ${jobDescription}`;

  const response = await model.generateContent(prompt);
  const text = response.response.text();

  // Strip markdown fences if model wraps response in ```json blocks
  return JSON.parse(text.replace(/```(?:json)?/g, "").trim());
}

module.exports = { scoreResume };
*/


const Groq = require("groq-sdk");

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function scoreResume(resume, jobDescription) {
  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 500,
    messages: [
      {
        role: "user",
        content: `You are a resume scorer. Compare this resume to the job description.
        Return ONLY a JSON object, no markdown, no explanation:
        {
          "score": 78,
          "missingKeywords": ["Docker", "AWS"],
          "matchedKeywords": ["React", "Node.js"],
          "summary": "Strong frontend match but missing cloud experience"
        }
        Resume: ${resume}
        Job Description: ${jobDescription}`,
      },
    ],
  });

  const text = response.choices[0].message.content;
  return JSON.parse(text.replace(/```(?:json)?/g, "").trim());
}

module.exports = { scoreResume };