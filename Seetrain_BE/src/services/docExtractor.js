const pdf = require("pdf-parse");
const mammoth = require("mammoth");
const WordExtractor = require("word-extractor");

const wordExtractor = new WordExtractor();

async function extractDoc(buffer, mimeType, originalName) {
  let text = "";

  const extension = originalName.split(".").pop().toLowerCase();

  try {
    switch (extension) {
      case "pdf": {
        const result = await pdf(buffer);
        text = result.text;
        break;
      }

      case "docx": {
        const result = await mammoth.extractRawText({
          buffer,
        });

        text = result.value;
        break;
      }

      case "doc": {
        const doc = await wordExtractor.extract(buffer);
        text = doc.getBody();
        break;
      }

      case "txt": {
        text = buffer.toString("utf-8");
        break;
      }

      default:
        throw new Error("Unsupported doc format");
    }

    // Clean extracted text
    text = text
      .replace(/\r\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    if (!text) {
      throw new Error("No readable text found in doc");
    }

    return text;
  } catch (error) {
    console.error("Doc extraction error:", error.message);
    throw new Error(`Failed to extract doc: ${error.message}`);
  }
}

module.exports = {
  extractDoc,
};
