const fs = require("fs/promises");
const path = require("path");

const STABILITY_API_URL =
  "https://api.stability.ai/v2beta/stable-image/generate/core";

async function generateTopicIllustration(
  prompt,
  outputPath,
  aspectRatio = "5:4",
) {
  const apiKey = process.env.STABILITY_API_KEY;

  if (!apiKey) {
    throw new Error("Missing STABILITY_API_KEY");
  }

  const formData = new FormData();

  formData.append("prompt", prompt);
  formData.append("aspect_ratio", aspectRatio);
  formData.append("output_format", "png");
  formData.append("style_preset", "digital-art");

  formData.append(
    "negative_prompt",
    "text, letters, words, numbers, watermark, logo, captions, blurry image, low quality, distorted objects",
  );

  const response = await fetch(STABILITY_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "image/*",
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Stability AI error: HTTP ${response.status} - ${errorText}`,
    );
  }

  const contentType = response.headers.get("content-type") || "";

  if (!contentType.startsWith("image/")) {
    throw new Error(`Unexpected Stability AI response: ${contentType}`);
  }

  const imageBuffer = Buffer.from(await response.arrayBuffer());

  if (imageBuffer.length === 0) {
    throw new Error("Stability AI returned an empty image");
  }

  await fs.mkdir(path.dirname(outputPath), {
    recursive: true,
  });

  await fs.writeFile(outputPath, imageBuffer);

  console.log(`AI illustration generated: ${outputPath}`);

  return outputPath;
}

module.exports = {
  generateTopicIllustration,
};
