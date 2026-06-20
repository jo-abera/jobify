/**
 * Resume file text extraction.
 *
 * Converts uploaded PDF, DOCX, or TXT buffers into plain text for the OpenAI
 * scorer in src/ai/resume.js. Uses in-memory buffers only (no temp files).
 */

/**
 * Normalizes whitespace and enforces minimum extractable content.
 * @param {string} text
 * @returns {string}
 */

const pdfParseMod = require("pdf-parse");
// pdf-parse v2 exports a `PDFParse` class; older versions export a function.
// We'll detect the shape at runtime and use the appropriate API.
const mammoth = require("mammoth");

/** Cap length sent to GPT to control token usage and latency. */
const MAX_TEXT_LENGTH = 15000;

const SUPPORTED_EXTENSIONS = ["pdf", "docx", "txt"];

function normalizedText(text) {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length < 50) {
    throw new Error(
      "Could not extract enough text from the file. Try a text-based PDF or paste your resume instead.",
    );
  }
  return cleaned.length > MAX_TEXT_LENGTH
    ? cleaned.slice(0, MAX_TEXT_LENGTH)
    : cleaned;
}

/**
 * @param {Buffer} buffer - File contents from multer memory storage
 * @param {string} mimetype - MIME type from the client
 * @param {string} originalname - Original filename (used for extension fallback)
 * @returns {Promise<string>} Plain-text resume content
 */

async function extractResumeText(buffer, mimetype, originalname) {
  const ext = String(originalname || "")
    .toLowerCase()
    .split(".")
    .pop();

  if (!SUPPORTED_EXTENSIONS.includes(ext)) {
    throw new Error("Only PDF, DOCX, and TXT files are supported.");
  }

  let text = "";
  if (ext === "txt" || mimetype === "text/plain") {
    text = buffer.toString("utf-8");
  } else if (ext === "pdf" || mimetype === "application/pdf") {
    // Handle different pdf-parse versions:
    // v1: module is a function `pdf(buffer)` -> returns { text }
    // v2: module exports { PDFParse } class -> use parser.getText()
    if (typeof pdfParseMod === "function") {
      const parsed = await pdfParseMod(buffer);
      text = parsed?.text || "";
    } else if (pdfParseMod && typeof pdfParseMod.PDFParse === "function") {
      const parser = new pdfParseMod.PDFParse({ data: buffer });
      const parsed = await parser.getText();
      text = parsed?.text || "";
      if (typeof parser.destroy === "function") {
        try {
          await parser.destroy();
        } catch (e) {
          // ignore destroy errors
        }
      }
    } else if (pdfParseMod && typeof pdfParseMod.default === "function") {
      const parsed = await pdfParseMod.default(buffer);
      text = parsed?.text || "";
    } else {
      throw new Error("Unsupported pdf-parse module shape");
    }
  } else if (
    ext === "docx" ||
    mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({ buffer });
    text = result.value || "";
  }

  return normalizedText(text);
}

module.exports = { extractResumeText, MAX_TEXT_LENGTH, SUPPORTED_EXTENSIONS };
