require("dotenv").config();

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "openai/gpt-oss-20b";
const TIMEOUT_MS = 60000;
const MIN_SECTIONS = 3;
const MAX_SECTIONS = 4;

const trainingContentSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    title: { type: "string" },
    summary: { type: "string" },
    learningObjectives: {
      type: "array",
      items: { type: "string" },
    },
    sections: {
      type: "array",
      minItems: MIN_SECTIONS,
      maxItems: MAX_SECTIONS,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          id: { type: "integer" },
          heading: { type: "string" },
          keyPoints: {
            type: "array",
            minItems: 2,
            maxItems: 4,
            items: { type: "string" },
          },
          narration: { type: "string" },
          visualConcept: {
            type: "object",
            additionalProperties: false,
            properties: {
              subject: { type: "string" },
              action: { type: "string" },
              environment: { type: "string" },
            },
            required: ["subject", "action", "environment"],
          },
        },
        required: ["id", "heading", "keyPoints", "narration", "visualConcept"],
      },
    },
  },
  required: ["title", "summary", "learningObjectives", "sections"],
};

function validateTrainingContent(data) {
  if (
    !data ||
    typeof data.title !== "string" ||
    !data.title.trim() ||
    typeof data.summary !== "string" ||
    !Array.isArray(data.learningObjectives) ||
    !Array.isArray(data.sections) ||
    data.sections.length < MIN_SECTIONS ||
    data.sections.length > MAX_SECTIONS
  ) {
    throw new Error("Invalid training content structure");
  }

  for (let index = 0; index < data.sections.length; index++) {
    const section = data.sections[index];

    if (
      !section ||
      typeof section.heading !== "string" ||
      !section.heading.trim() ||
      !Array.isArray(section.keyPoints) ||
      section.keyPoints.length < 2 ||
      section.keyPoints.length > 4 ||
      !section.keyPoints.every(
        (point) => typeof point === "string" && point.trim(),
      ) ||
      typeof section.narration !== "string" ||
      !section.narration.trim() ||
      !section.visualConcept ||
      typeof section.visualConcept.subject !== "string" ||
      !section.visualConcept.subject.trim() ||
      typeof section.visualConcept.action !== "string" ||
      !section.visualConcept.action.trim() ||
      typeof section.visualConcept.environment !== "string" ||
      !section.visualConcept.environment.trim()
    ) {
      throw new Error(`Invalid training section at index ${index}`);
    }
  }

  return data;
}

async function callGroq(extractedText, retryHint = "") {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("Missing GROQ_API_KEY");
  }

  const systemPrompt = `
You are an educational content planner.

Your task is to convert the supplied document into structured
training content for a short educational video and infographic.

IMPORTANT SECTION RULES:
- Generate exactly 3 or 4 sections.
- NEVER generate 5 or more sections.
- NEVER generate fewer than 3 sections.
- Every section must cover a distinct main idea.
- Combine related information instead of creating unnecessary sections.
- Do not create sections just to fill space.

CONTENT RULES:
- Use the document as the primary source.
- Do not invent facts or unsupported claims.
- Preserve the most important information.
- Write clear and concise learning objectives.
- Each section must contain 2 to 4 key points.
- Write natural narration suitable for spoken training videos.
- Keep narration concise, around 40 to 70 words per section.
- Avoid repeating the same information between sections.

VISUAL CONCEPT RULES:
- Give every section a specific and distinct visual concept.
- Describe concrete subjects, actions and environments.
- Make each concept directly represent its section's content.
- Avoid generic illustrations of people sitting at computers.
- Avoid reusing the same subject or visual metaphor.
- Prefer visual storytelling that an AI image generator can understand.

OUTPUT RULES:
- Section IDs must start at 1 and increase sequentially.
- Return only valid JSON matching the requested schema.
- The sections array MUST contain exactly 3 or 4 items.
- Do not include markdown or explanations.
  `.trim();

  const userPrompt = `
Create training content from this document:

${extractedText}

${retryHint}
  `.trim();

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "training_content",
          strict: true,
          schema: trainingContentSchema,
        },
      },
      max_completion_tokens: 6000,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    const errorMessage =
      result.error?.message || `Groq API error: ${response.status}`;

    const error = new Error(errorMessage);
    error.status = response.status;
    throw error;
  }

  const content = result.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("Groq returned empty content");
  }

  return validateTrainingContent(JSON.parse(content));
}

async function generateTrainingContent(extractedText) {
  if (!extractedText || !extractedText.trim()) {
    throw new Error("Document content is empty");
  }

  let lastError;

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      console.log(`Content Planner attempt ${attempt}/2`);

      const retryHint =
        attempt === 2
          ? `
IMPORTANT CORRECTION:
Your previous attempt did not satisfy the required output.
Generate exactly 3 or 4 sections.
Each section must contain 2 to 4 key points.
Follow the JSON schema strictly.
          `.trim()
          : "";

      const content = await callGroq(extractedText, retryHint);

      console.log(
        `Content Planner completed: ${content.sections.length} sections`,
      );

      return content;
    } catch (error) {
      lastError = error;

      console.error(
        `Content Planner attempt ${attempt} failed:`,
        error.message,
      );

      // Authentication and configuration errors cannot be fixed by retrying.
      if ([401, 403].includes(error.status)) {
        break;
      }

      if (attempt < 2) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  }

  console.error("Groq Planner failed:", lastError?.message);

  // Do not silently generate low-quality fallback content.
  throw new Error(
    `Content planning failed: ${lastError?.message || "Unknown error"}`,
  );
}

module.exports = {
  generateTrainingContent,
};
