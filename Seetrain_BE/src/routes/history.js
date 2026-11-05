const express = require("express");
const supabase = require("../config/supabase");
const { createSignedUrl } = require("../services/fileService");

const router = express.Router();

// get history
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("status", "completed")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    const history = await Promise.all(
      data.map(async (job) => {
        const videoUrl = await createSignedUrl(job.video_path);
        const infographicUrl = await createSignedUrl(job.infographic_path);

        return {
          jobId: job.id,
          status: job.status,
          originalName: job.original_name,
          videoUrl,
          infographicUrl,
          createdAt: job.created_at,
        };
      }),
    );

    return res.status(200).json({
      total: history.length,
      history,
    });
  } catch (error) {
    console.error("Get history error:", error.message);

    return res.status(500).json({
      message: "Failed to get history",
      error: error.message,
    });
  }
});

module.exports = router;
