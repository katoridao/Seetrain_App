const DID_API_URL = "https://api.d-id.com";
const fs = require("fs/promises");

const PRESENTER_ID =
  process.env.DID_PRESENTER_ID || "v2_public_Amber@4HImc8ne63";

function getHeaders() {
  const apiKey = process.env.DID_API_KEY;

  if (!apiKey) {
    throw new Error("Missing DID_API_KEY");
  }

  return {
    Authorization: `Basic ${apiKey}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

async function parseResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const detail =
      data.description ||
      data.message ||
      (typeof data.error === "string" ? data.error : data.error?.message);
    const reason =
      response.status === 402
        ? "D-ID account has insufficient credits or balance"
        : detail || `D-ID API error`;

    const error = new Error(`D-ID API error: HTTP ${response.status} - ${reason}`);
    error.status = response.status;
    error.details = data;
    throw error;
  }

  return data;
}

async function createClip(text) {
  const response = await fetch(`${DID_API_URL}/clips`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      presenter_id: PRESENTER_ID,
      script: {
        type: "text",
        input: text,
      },
      name: "SeeTrain Training Video",
    }),
  });

  const data = await parseResponse(response);

  if (!data.id) {
    throw new Error("D-ID did not return a clip ID");
  }

  return data.id;
}

async function getClip(clipId) {
  const response = await fetch(
    `${DID_API_URL}/clips/${encodeURIComponent(clipId)}`,
    {
      method: "GET",
      headers: getHeaders(),
    },
  );

  return parseResponse(response);
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForClip(clipId, timeoutMs = 15 * 60 * 1000) {
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    const clip = await getClip(clipId);

    if (clip.status === "done" && clip.result_url) {
      return clip.result_url;
    }

    if (
      clip.status === "error" ||
      clip.status === "failed" ||
      clip.status === "rejected" ||
      clip.status === "cancelled" ||
      clip.error
    ) {
      throw new Error(
        clip.error?.message || clip.error || `D-ID clip failed: ${clip.status}`,
      );
    }

    await wait(5000);
  }

  throw new Error(`D-ID clip timed out: ${clipId}`);
}

async function downloadClip(resultUrl, outputPath) {
  const response = await fetch(resultUrl);

  if (!response.ok) {
    throw new Error(`Failed to download D-ID clip: HTTP ${response.status}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());

  if (buffer.length === 0) {
    throw new Error("Downloaded D-ID clip is empty");
  }

  await fs.writeFile(outputPath, buffer);
}

module.exports = {
  createClip,
  waitForClip,
  downloadClip,
};
