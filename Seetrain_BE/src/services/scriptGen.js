const ai = require("../config/gemini");

async function genTrainingScript(extractedText) {
  if (!extractedText || !extractedText.trim()) {
    throw new Error("Document content is empty");
  }

  const prompt = `
You are a professional training content creator.

Read the document below and create a training video script.

Requirements:
- The video must be no longer than 5 minutes.
- Use clear and simple language.
- Keep all important information accurate.
- Organize the content into logical scenes.
- Each scene must have narration and visualDescription.
- The narration will be converted into speech using Text-to-Speech.
- Do not invent facts that are not in the document.

Return valid JSON only, using this structure:

{
  "title": "Video title",
  "summary": "Short video summary",
  "scenes": [
    {
      "sceneNumber": 1,
      "heading": "Scene heading",
      "narration": "Text to be spoken",
      "visualDescription": "Description of what should appear on screen",
      "durationSeconds": 30
    }
  ]
}

DOCUMENT CONTENT:

${extractedText}
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.8-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      temperature: 0.4,
    },
  });

  const script = JSON.parse(response.text);

  if (!script.title || !Array.isArray(script.scenes)) {
    throw new Error("Invalid script gen by Gemini");
  }

  return script;
}

module.exports = {
  genTrainingScript,
};
