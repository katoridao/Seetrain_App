const express = require("express");
const multer = require("multer");

const { createJob } = require("../services/jobStore");
const { processDocExtraction } = require("../services/docProcessor");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file type"));
    }
  },
});

router.post("/", (req, res) => {
  upload.single("file")(req, res, async (uploadError) => {
    if (uploadError) {
      return res.status(400).json({
        message: uploadError.message,
      });
    }

    try {
      if (!req.file) {
        return res.status(400).json({
          message: "No file uploaded",
        });
      }

      const job = await createJob(req.file);

      processDocExtraction(job.jobId, req.file).catch((error) => {
        console.error("Background processing error:", error);
      });

      return res.status(202).json({
        jobId: job.jobId,
        status: job.status,
        message: job.message,
      });
    } catch (error) {
      console.error("Upload error:", error.message);

      return res.status(500).json({
        message: "Failed to upload document",
        error: error.message,
      });
    }
  });
});

module.exports = router;
