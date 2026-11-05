require("dotenv").config();

const MODEL = "openai/gpt-oss-20b";
const API_URL = "https://api.groq.com/openai/v1/chat/completions";

const schema = {
  type: "object",
  properties: {
    title: { type: "string" },
    summary: { type: "string" },
    learningObjectives: {
      type: "array",
      items: { type: "string" },
    },
    sections: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "integer" },
          heading: { type: "string" },
          keyPoints: {
            type: "array",
            items: { type: "string" },
          },
          visualConcept: {
            type: "object",
            properties: {
              subject: { type: "string" },
              action: { type: "string" },
              environment: { type: "string" },
            },
            required: ["subject", "action", "environment"],
            additionalProperties: false,
          },
          narration: { type: "string" },
        },
        required: ["id", "heading", "keyPoints", "visualConcept", "narration"],
        additionalProperties: false,
      },
    },
  },
  required: ["title", "summary", "learningObjectives", "sections"],
  additionalProperties: false,
};

// Temporary test document
const documentText = `
Cybersecurity Basics: How to Stay Safe Online

Cybersecurity protects computers, networks and personal information
from digital attacks.

Password Security:
Use strong and unique passwords for every account.
Avoid using personal information in passwords.
A password manager can help store complex passwords safely.

Phishing Attacks:
Phishing is a type of attack where criminals use fake emails,
messages or websites to steal sensitive information.
Never click suspicious links or provide passwords through
untrusted websites.

Two-Factor Authentication:
Two-factor authentication adds another layer of protection.
It requires a second verification method, such as an
authentication app or a one-time code.

Safe Browsing:
Check website addresses before entering personal information.
Look for HTTPS and avoid downloading files from unknown sources.

Data Protection:
Back up important files regularly.
Keep software updated and use trusted security tools.
Avoid sharing sensitive information on public networks.
`;

async function testGroq() {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("Missing GROQ_API_KEY in .env");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);
  const startTime = Date.now();

  try {
    console.log(`Testing Groq model: ${MODEL}`);

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "system",
            content: `
You are an AI training content planner.

Analyze the provided document and organize it into
a clear educational training structure.

Rules:
- Only use information supported by the document.
- Do not invent facts.
- Identify the main topic and learning objectives.
- Divide the content into 3 to 6 meaningful sections.
- Keep key points concise and accurate.
- Write natural English narration for each section.
- Each visualConcept must describe a distinct illustration.
- Avoid repeating the same visual subject or scene.
- Prefer visual metaphors, objects and actions.
- Do not use generic scenes of people sitting at computers
  unless the section genuinely requires them.
- Return content in English.
            `,
          },
          {
            role: "user",
            content: `Analyze this document:\n\n${documentText}`,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "training_content",
            strict: true,
            schema,
          },
        },
        reasoning_effort: "low",
        max_completion_tokens: 6000,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        `Groq API error ${response.status}: ${
          result.error?.message || JSON.stringify(result)
        }`,
      );
    }

    const content = result.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Groq returned empty content");
    }

    const trainingContent = JSON.parse(content);

    console.log("\n========== GROQ RESULT ==========\n");
    console.log(JSON.stringify(trainingContent, null, 2));

    console.log("\n========== TEST INFO ==========");
    console.log("Model:", result.model);
    console.log("Time:", `${((Date.now() - startTime) / 1000).toFixed(2)}s`);
    console.log("Sections:", trainingContent.sections.length);
    console.log("Tokens:", result.usage?.total_tokens ?? "Unavailable");

    console.log("\nGroq test completed successfully!");
  } catch (error) {
    if (error.name === "AbortError") {
      console.error("Request timed out after 60 seconds.");
    } else {
      console.error("Groq test failed:", error.message);
    }
  } finally {
    clearTimeout(timeout);
  }
}

testGroq();
