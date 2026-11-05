const fs = require("fs/promises");
const path = require("path");
const { execFile } = require("child_process");
const { promisify } = require("util");

const sharp = require("sharp");
const ffmpegPath = require("ffmpeg-static");

const { generateSpeech } = require("./elevenLabsService");
const { ensureSectionIllustrations } = require("./visualAssetService");

const execFileAsync = promisify(execFile);

const VIDEO_WIDTH = 1920;
const VIDEO_HEIGHT = 1080;
const VIDEO_FPS = 30;

function escapeXml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function wrapText(text, maxLength = 55) {
  const words = String(text || "").split(/\s+/);
  const lines = [];
  let currentLine = "";

  for (const word of words) {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;

    if (nextLine.length > maxLength && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = nextLine;
    }
  }

  if (currentLine) lines.push(currentLine);

  return lines;
}

function buildSlideSvg(section, index, total) {
  const heading = wrapText(section.heading || `Section ${index + 1}`, 38);

  const points = (section.keyPoints || []).slice(0, 4);

  let currentY = 180;

  const headingSvg = heading
    .map((line) => {
      const element = `
      <text x="110" y="${currentY}"
        font-size="64"
        font-weight="bold"
        fill="#ffffff">
        ${escapeXml(line)}
      </text>
    `;

      currentY += 82;
      return element;
    })
    .join("");

  currentY += 50;

  const pointsSvg = points
    .map((point, i) => {
      const lines = wrapText(point, 55);

      const lineSvg = lines
        .map((line) => {
          const element = `
        <text x="160" y="${currentY}"
          font-size="34"
          fill="#f1f5f9">
          ${escapeXml(line)}
        </text>
      `;

          currentY += 48;
          return element;
        })
        .join("");

      currentY += 35;

      return `
      <circle cx="125" cy="${currentY - lines.length * 48 - 5}"
        r="9" fill="#38bdf8"/>
      ${lineSvg}
    `;
    })
    .join("");

  return `
    <svg width="${VIDEO_WIDTH}" height="${VIDEO_HEIGHT}"
      xmlns="http://www.w3.org/2000/svg">

      <defs>
        <linearGradient id="shade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#020617" stop-opacity="0.92"/>
          <stop offset="100%" stop-color="#020617" stop-opacity="0.30"/>
        </linearGradient>
      </defs>

      <rect width="100%" height="100%" fill="url(#shade)"/>

      ${headingSvg}
      ${pointsSvg}

      <text x="110" y="1010"
        font-size="24"
        fill="#cbd5e1">
        SEETRAIN • SECTION ${index + 1} / ${total}
      </text>
    </svg>
  `;
}

async function createSectionVideo(slidePath, audioPath, outputPath) {
  const args = [
    "-y",

    "-loop",
    "1",
    "-framerate",
    String(VIDEO_FPS),
    "-i",
    slidePath,

    "-i",
    audioPath,

    "-map",
    "0:v:0",
    "-map",
    "1:a:0",

    "-c:v",
    "libx264",
    "-preset",
    "medium",
    "-tune",
    "stillimage",
    "-pix_fmt",
    "yuv420p",

    "-c:a",
    "aac",
    "-b:a",
    "192k",

    "-r",
    String(VIDEO_FPS),
    "-shortest",

    "-movflags",
    "+faststart",
    outputPath,
  ];

  await execFileAsync(ffmpegPath, args, {
    maxBuffer: 10 * 1024 * 1024,
  });
}

async function concatenateVideos(videoPaths, outputPath, tempDir) {
  const concatPath = path.join(tempDir, "concat.txt");

  const concatContent = videoPaths
    .map((videoPath) => {
      const normalizedPath = videoPath
        .replace(/\\/g, "/")
        .replace(/'/g, "'\\''");

      return `file '${normalizedPath}'`;
    })
    .join("\n");

  await fs.writeFile(concatPath, concatContent);

  await execFileAsync(
    ffmpegPath,
    [
      "-y",
      "-f",
      "concat",
      "-safe",
      "0",
      "-i",
      concatPath,
      "-c:v",
      "libx264",
      "-preset",
      "medium",
      "-pix_fmt",
      "yuv420p",

      "-c:a",
      "aac",
      "-b:a",
      "192k",
      "-ar",
      "44100",

      "-r",
      String(VIDEO_FPS),
      "-movflags",
      "+faststart",
      outputPath,
    ],
    {
      maxBuffer: 10 * 1024 * 1024,
    },
  );
}

async function generateTrainingVideo(trainingContent, jobId) {
  if (
    !trainingContent ||
    !Array.isArray(trainingContent.sections) ||
    trainingContent.sections.length === 0
  ) {
    throw new Error("Invalid training content");
  }

  if (!ffmpegPath) {
    throw new Error("FFmpeg binary not found");
  }

  const outputDir = path.join(process.cwd(), "uploads", "videos");

  const tempDir = path.join(outputDir, `temp-${jobId}`);

  const outputPath = path.join(outputDir, `${jobId}.mp4`);

  await fs.mkdir(tempDir, { recursive: true });

  const sectionVideos = [];

  try {
    console.log(`Generating training video: ${jobId}`);

    const sections = trainingContent.sections;

    const totalWords = sections.reduce((total, section) => {
      return total + (section.narration || "")
        .trim()
        .split(/\s+/)
        .filter(Boolean).length;
    }, 0);

    console.log(`Total narration words: ${totalWords}`);

    if (totalWords > 625) {
      throw new Error(
        `Narration is too long: ${totalWords} words. Maximum target is 625 words.`,
      );
    }

    const assets = await ensureSectionIllustrations(trainingContent, jobId);

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];

      const narration = section.narration?.trim();

      if (!narration) {
        throw new Error(`Missing narration in section: ${section.heading}`);
      }

      if (narration.length > 5000) {
        throw new Error(
          `Section narration exceeds ElevenLabs limit: ${section.heading}`,
        );
      }

      console.log(
        `Processing video section ${i + 1}/${sections.length}: ${section.heading}`,
      );

      const imagePath = path.join(tempDir, `image-${i}.png`);

      const audioPath = path.join(tempDir, `audio-${i}.mp3`);

      const slidePath = path.join(tempDir, `slide-${i}.png`);

      const sectionVideoPath = path.join(tempDir, `section-${i}.mp4`);

      // 1. Generate a unique illustration.
      const asset = assets[i];

      if (!asset) {
        throw new Error(`Missing illustration for section: ${section.heading}`);
      }

      await fs.copyFile(asset.imagePath, imagePath);

      // 2. Generate narration audio.
      await generateSpeech(narration, audioPath);

      // 3. Add heading and key points to the image.
      const svg = Buffer.from(buildSlideSvg(section, i, sections.length));

      await sharp(imagePath)
        .resize(VIDEO_WIDTH, VIDEO_HEIGHT, {
          fit: "cover",
        })
        .composite([
          {
            input: svg,
            blend: "over",
          },
        ])
        .png()
        .toFile(slidePath);

      // 4. Combine slide and narration.
      await createSectionVideo(slidePath, audioPath, sectionVideoPath);

      sectionVideos.push(sectionVideoPath);
    }

    // 5. Combine all sections into one MP4.
    await concatenateVideos(sectionVideos, outputPath, tempDir);

    const stats = await fs.stat(outputPath);

    if (stats.size === 0) {
      throw new Error("Generated video is empty");
    }

    console.log(`Training video generated: ${outputPath}`);

    return outputPath;
  } catch (error) {
    await fs.rm(outputPath, { force: true }).catch(() => {});
    throw error;
  } finally {
    await fs
      .rm(tempDir, {
        recursive: true,
        force: true,
      })
      .catch(() => {});
  }
}

module.exports = {
  generateTrainingVideo,
};
