require("dotenv").config();
const fs = require("fs");

async function testTTS() {
  const response = await fetch(
    "https://api.elevenlabs.io/v1/text-to-speech/JBFqnCBsd6RMkjVDRZzb?output_format=mp3_44100_128",
    {
      method: "POST",
      headers: {
        "xi-api-key": process.env.ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: "Welcome to SeeTrain. Today, we will learn the basics of cybersecurity and how to stay safe online.",
        model_id: "eleven_multilingual_v2",
      }),
    },
  );

  if (!response.ok) {
    throw new Error(
      `ElevenLabs error ${response.status}: ${await response.text()}`,
    );
  }

  const audio = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync("test-output.mp3", audio);

  console.log("TTS successful! Saved test-output.mp3");
}

testTTS().catch(console.error);
