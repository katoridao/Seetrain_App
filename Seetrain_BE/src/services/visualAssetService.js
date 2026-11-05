const fs = require("fs/promises");
const path = require("path");

const { generateTopicIllustration } = require("./stabilityImageService");

function buildSectionPrompt(section) {
  const concept = section.visualConcept || {};

  const subject =
    typeof concept === "string" ? concept : concept.subject || section.heading;

  const action = typeof concept === "object" ? concept.action || "" : "";

  const environment =
    typeof concept === "object" ? concept.environment || "" : "";

  return `
    Create a professional educational illustration.

    Topic: ${section.heading}
    Main subject: ${subject}
    Action: ${action}
    Environment: ${environment}

    Visual requirements:
    - Modern digital illustration
    - Clear visual storytelling
    - Visually distinct from other educational topics
    - Professional training video style
    - Landscape 16:9 composition
    - No text, letters, numbers, captions or watermarks
    - Avoid generic people sitting at computers
  `.trim();
}

async function ensureSectionIllustrations(trainingContent, jobId) {
  if (!trainingContent?.sections?.length) {
    throw new Error("No training sections available");
  }

  const assetDir = path.join(process.cwd(), "uploads", "assets", jobId);

  await fs.mkdir(assetDir, { recursive: true });

  const assets = [];

  for (let index = 0; index < trainingContent.sections.length; index++) {
    const section = trainingContent.sections[index];

    const imagePath = path.join(assetDir, `section-${index + 1}.png`);

    try {
      await fs.access(imagePath);

      console.log(`Reusing illustration: ${section.heading}`);
    } catch {
      console.log(
        `Generating illustration ${index + 1}/${trainingContent.sections.length}: ${section.heading}`,
      );

      await generateTopicIllustration(
        buildSectionPrompt(section),
        imagePath,
        "16:9",
      );
    }

    assets.push({
      sectionIndex: index,
      heading: section.heading,
      imagePath,
    });
  }

  return assets;
}

module.exports = {
  ensureSectionIllustrations,
};
