require("dotenv").config();

const fs = require("fs/promises");
const path = require("path");

const API_URL = "https://api.stability.ai/v2beta/stable-image/generate/core";

const prompt = `
Create a complete, professional educational infographic poster.

TOPIC: CYBERSECURITY BASICS
MAIN TITLE: STAY SAFE ONLINE

Design:
- Portrait orientation, 4:5 ratio.
- Modern educational infographic design.
- Clean white and dark navy blue background.
- Cyan and blue accent colors.
- Clear visual hierarchy.
- Beautiful illustrations and simple security icons.
- Organized sections with separate cards.
- Professional typography.
- High contrast and easy to read.
- Balanced spacing, no clutter.

Include these exact sections and text:

1. COMMON ONLINE THREATS
- Phishing: Fake messages that steal information.
- Malware: Harmful software.
- Weak Passwords: Easy to guess.
- Fake Websites: Imitate trusted services.

2. STRONG PASSWORDS
- Use at least 12 characters.
- Mix uppercase and lowercase letters.
- Include numbers and symbols.
- Never reuse passwords.
- Use a password manager.

3. SAFE BROWSING
- Check website addresses.
- Avoid suspicious links.
- Keep software updated.
- Download from trusted sources.
- Be careful with public Wi-Fi.

4. PROTECT YOUR ACCOUNTS
- Enable Two-Factor Authentication.
- Install security updates.
- Use antivirus software.
- Lock your devices.
- Back up important files.

5. REMEMBER
Stay alert. Think before you click.
Protect your personal information.

IMPORTANT:
- Render the requested English text clearly.
- Do not invent additional text.
- Do not misspell words.
- Every section must be visible.
- Do not crop any part of the poster.
- Make it look like a finished infographic,
  not a photograph of a poster.
`;

async function main() {
  const apiKey = process.env.STABILITY_API_KEY;

  if (!apiKey) {
    throw new Error("Missing STABILITY_API_KEY");
  }

  const formData = new FormData();

  formData.append("prompt", prompt);
  formData.append("aspect_ratio", "4:5");
  formData.append("output_format", "png");
  formData.append("style_preset", "digital-art");
  formData.append(
    "negative_prompt",
    "blurry text, misspelled words, random letters, watermark, logo, low quality",
  );

  console.log("Generating full AI infographic...");

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "image/*",
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Stability API ${response.status}: ${error}`);
  }

  const contentType = response.headers.get("content-type") || "";

  if (!contentType.startsWith("image/")) {
    throw new Error(`Unexpected response: ${contentType}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());

  const outputDir = path.join(process.cwd(), "uploads", "infographics");

  await fs.mkdir(outputDir, { recursive: true });

  const outputPath = path.join(outputDir, "full-ai-cybersecurity.png");

  await fs.writeFile(outputPath, buffer);

  console.log("SUCCESS!");
  console.log("Output:", outputPath);
  console.log("Size:", buffer.length, "bytes");
}

main().catch((error) => {
  console.error("TEST FAILED:", error.message);
  process.exitCode = 1;
});
