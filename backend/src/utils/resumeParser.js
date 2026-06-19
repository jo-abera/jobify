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

const pdfParse = require("pdf-parse");
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


async function extractResumeText(buffer, mimetype, originalname){
    const ext = originalname.toLowerCase().split('.').pop()

    if(!SUPPORTED_EXTENSIONS.includes(ext)){
        throw new Error('Only PDF, DOCX, and TXT files are supported.')
    }

let text = ''
if(ext === 'txt' || mimetype === 'text/plain'){
    text = buffer.toString('utf-8')
}else if(ext === ' pdf'  || mimetype === 'application/pdf'){
    const parsed = await pdfParse(buffer)
    text = parsed.text || ''
}else if(
    ext === 'dox' ||
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
){
    const result = await mammoth.extractRawText({buffer})
    text = result.value || ''
}

return normalizedText(text)

}

module.exports = {extractResumeText, MAX_TEXT_LENGTH, SUPPORTED_EXTENSIONS}