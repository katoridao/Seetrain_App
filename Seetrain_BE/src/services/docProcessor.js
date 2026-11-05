const path = require("path");
const fs = require("fs/promises");

const { extractDoc } = require("./docExtractor");
const { updateJob } = require("./jobStore");

const { generateTrainingContent } = require("./contentPlanner");
const { generateTrainingVideo } = require("./videoGenerator");
const { generateInfographic } = require("./infographicService");

const { uploadGeneratedFile, removeStoredFile } = require("./fileService");

async function processDocExtraction(jobId, file) {
  let videoStoragePath = null;
  let infographicStoragePath = null;

  let videoLocalPath = null;
  let infographicLocalPath = null;

  let completed = false;

  try {
    // 1. Extract document
    await updateJob(jobId, {
      status: "extracting",
      message: "Extracting document content...",
    });

    const extractedText = await extractDoc(
      file.buffer,
      file.mimetype,
      file.originalname,
    );

    if (!extractedText || !extractedText.trim()) {
      throw new Error("No text found in document");
    }

    await updateJob(jobId, {
      status: "extracted",
      message: "Document extraction completed",
      extractedText,
    });

    // 2. Generate structured training content
    await updateJob(jobId, {
      status: "planning",
      message: "AI is analyzing and organizing document content...",
    });

    const trainingContent = await generateTrainingContent(extractedText);

    if (!trainingContent?.sections?.length) {
      throw new Error("Training content has no sections");
    }

    // 3. Generate shared illustrations first.
    // This ensures both outputs use the same images.
    await updateJob(jobId, {
      status: "generating",
      message: "AI is generating educational illustrations...",
    });

    // 4. Generate video
    await updateJob(jobId, {
      status: "generating",
      message: "Generating narrated training video...",
    });

    videoLocalPath = await generateTrainingVideo(trainingContent, jobId);

    if (!videoLocalPath) {
      throw new Error("Video generation returned no output");
    }

    // 5. Upload video
    videoStoragePath = `videos/${jobId}/training.mp4`;

    await uploadGeneratedFile(videoLocalPath, videoStoragePath, "video/mp4");

    await updateJob(jobId, {
      videoPath: videoStoragePath,
      message: "Training video generated",
    });

    // 6. Generate infographic
    await updateJob(jobId, {
      status: "generating",
      message: "Generating training infographic...",
    });

    infographicLocalPath = await generateInfographic(trainingContent, jobId);

    if (!infographicLocalPath) {
      throw new Error("Infographic generation returned no output");
    }

    // 7. Upload infographic
    infographicStoragePath = `infographics/${jobId}.png`;

    await uploadGeneratedFile(
      infographicLocalPath,
      infographicStoragePath,
      "image/png",
    );

    // 8. Both outputs must exist before completing
    await updateJob(jobId, {
      infographicPath: infographicStoragePath,
      status: "completed",
      message: "Video and infographic generated successfully",
      error: null,
    });

    completed = true;

    console.log(`Job completed successfully: ${jobId}`);
  } catch (error) {
    console.error(`Document processing failed (${jobId}):`, error.message);

    // Remove incomplete outputs from Supabase
    if (videoStoragePath) {
      await removeStoredFile(videoStoragePath).catch(() => {});
    }

    if (infographicStoragePath) {
      await removeStoredFile(infographicStoragePath).catch(() => {});
    }

    await updateJob(jobId, {
      status: "failed",
      message: "Document processing failed",
      error: error.message,
      videoPath: null,
      infographicPath: null,
    }).catch((updateError) => {
      console.error("Failed to update job:", updateError.message);
    });
  } finally {
    // Remove local generated outputs
    if (videoLocalPath) {
      await fs.rm(videoLocalPath, { force: true }).catch(() => {});
    }

    if (infographicLocalPath) {
      await fs.rm(infographicLocalPath, { force: true }).catch(() => {});
    }

    // Only remove shared illustrations after successful completion.
    // Keep them if generation fails so they can be reused for retry.
    if (completed) {
      await fs
        .rm(path.join(process.cwd(), "uploads", "assets", jobId), {
          recursive: true,
          force: true,
        })
        .catch(() => {});
    }
  }
}

module.exports = {
  processDocExtraction,
};
