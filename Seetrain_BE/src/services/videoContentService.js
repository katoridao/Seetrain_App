function prepareNarration(extractedText) {
  if (typeof extractedText !== "string") {
    throw new Error("Invalid document content");
  }

  const narration = extractedText
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (!narration) {
    throw new Error("Document content is empty");
  }

  const totalWords = narration.split(/\s+/).filter(Boolean).length;

  return {
    text: narration,
    totalWords,
  };
}

module.exports = {
  prepareNarration,
};
