const express = require("express");

const { getJob } = require("../services/jobStore");
const { createSignedUrl } = require("../services/fileService");

const router = express.Router();

// Get job by ID
router.get("/:id", async (req, res) => {
  try {
    const job = await getJob(req.params.id);

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    const videoUrl = await createSignedUrl(job.videoPath);
    const infographicUrl = await createSignedUrl(job.infographicPath);

    return res.status(200).json({
      jobId: job.jobId,
      status: job.status,
      message: job.message,
      videoUrl,
      infographicUrl,
      error: job.error,
    });
  } catch (error) {
    console.error("Get job error:", error.message);

    return res.status(500).json({
      message: "Failed to get job",
      error: error.message,
    });
  }
});

module.exports = router;
