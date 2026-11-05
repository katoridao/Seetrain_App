const puppeteer = require("puppeteer");
const fs = require("fs/promises");
const path = require("path");

const { genInfographicData } = require("./infographicGen");
const { genInfographicHTML } = require("./infographicTemplate");
const { generateTopicIllustration } = require("./stabilityImageService");
const { ensureSectionIllustrations } = require("./visualAssetService");

async function attachIllustration(prompt, outputPath) {
  try {
    await generateTopicIllustration(prompt, outputPath);

    const imageBuffer = await fs.readFile(outputPath);

    return `data:image/png;base64,${imageBuffer.toString("base64")}`;
  } catch (error) {
    console.warn(
      `Skipping illustration ${path.basename(outputPath)}:`,
      error.message,
    );

    return null;
  }
}

async function generateInfographic(trainingContent, jobId) {
  let browser;
  let heroPath = null;

  const outputDir = path.join(process.cwd(), "uploads", "infographics");

  const outputPath = path.join(outputDir, `${jobId}.png`);

  try {
    const infographicData = genInfographicData(trainingContent);

    if (!infographicData.sections.length) {
      throw new Error("No infographic sections found");
    }

    await fs.mkdir(outputDir, { recursive: true });

    // 1. Generate hero illustration.
    console.log("Generating hero illustration...");

    heroPath = path.join(outputDir, `${jobId}-hero.png`);

    infographicData.heroImageDataUrl = await attachIllustration(
      infographicData.imagePrompt,
      heroPath,
    );

    // 2. Get shared section illustrations.
    const assets = await ensureSectionIllustrations(trainingContent, jobId);

    // 3. Attach shared images to infographic data.
    for (let index = 0; index < infographicData.sections.length; index++) {
      const section = infographicData.sections[index];
      const asset = assets[index];

      if (!asset) {
        section.imageDataUrl = null;
        continue;
      }

      const imageBuffer = await fs.readFile(asset.imagePath);

      section.imageDataUrl = `data:image/png;base64,${imageBuffer.toString("base64")}`;
    }

    // 4. Generate HTML.
    const html = genInfographicHTML(infographicData);

    // 5. Launch Puppeteer.
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    await page.setViewport({
      width: 1000,
      height: 1250,
      deviceScaleFactor: 2,
    });

    // 6. Render HTML.
    await page.setContent(html, {
      waitUntil: "load",
    });

    await page.evaluate(async () => {
      await document.fonts.ready;

      await Promise.all(
        Array.from(document.images).map((image) => {
          if (image.complete) return Promise.resolve();

          return new Promise((resolve) => {
            image.onload = resolve;
            image.onerror = resolve;
          });
        }),
      );
    });

    // 7. Export PNG.
    await page.screenshot({
      path: outputPath,
      type: "png",
      fullPage: true,
    });

    const stats = await fs.stat(outputPath);

    if (stats.size === 0) {
      throw new Error("Generated infographic is empty");
    }

    console.log(`Infographic generated: ${outputPath}`);

    return outputPath;
  } catch (error) {
    await fs.rm(outputPath, { force: true }).catch(() => {});

    console.error("Infographic generation error:", error.message);

    throw error;
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }

    // Only remove the hero image.
    // Section images are shared with video generation.
    if (heroPath) {
      await fs.rm(heroPath, { force: true }).catch(() => {});
    }
  }
}

module.exports = {
  generateInfographic,
  genInfographic: generateInfographic,
};
