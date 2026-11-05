const fs = require("fs/promises");
const path = require("path");

const API_URL = "https://api.elevenlabs.io/v1/text-to-speech";

const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "JBFqnCBsd6RMkjVDRZzb";

const MODEL_ID = process.env.ELEVENLABS_MODEL_ID || "eleven_multilingual_v2";

async function generateSpeech(text, outputPath) {
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    throw new Error("Missing ELEVENLABS_API_KEY");
  }

  if (!text || typeof text !== "string" || !text.trim()) {
    throw new Error("Narration text is empty");
  }

  // Multilingual v2 has a 5,000 character input limit.
  if (text.length > 5000) {
    throw new Error(
      `Narration is too long: ${text.length} characters. Maximum is 5000.`,
    );
  }

  try {
    const response = await fetch(
      `${API_URL}/${VOICE_ID}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text: text.trim(),
          model_id: MODEL_ID,
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs error ${response.status}: ${errorText}`);
    }

    const audioBuffer = Buffer.from(await response.arrayBuffer());

    if (!audioBuffer.length) {
      throw new Error("ElevenLabs returned empty audio");
    }

    await fs.mkdir(path.dirname(outputPath), {
      recursive: true,
    });

    await fs.writeFile(outputPath, audioBuffer);

    console.log(`Speech generated: ${outputPath}`);

    return outputPath;
  } catch (error) {
    await fs.rm(outputPath, { force: true }).catch(() => {});
    throw error;
  }
}

module.exports = {
  generateSpeech,
};
