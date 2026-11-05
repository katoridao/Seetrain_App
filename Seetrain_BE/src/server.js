require("dotenv").config();

const express = require("express");
const cors = require("cors");

const uploadRouter = require("./routes/upload");
const jobsRouter = require("./routes/jobs");
const historyRouter = require("./routes/history");
const didRouter = require("./routes/did");

const supabase = require("./config/supabase");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/upload", uploadRouter);
app.use("/jobs", jobsRouter);
app.use("/history", historyRouter);
app.use("/did", didRouter);

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "SeeTrain API is running",
  });
});

app.get("/test-supabase", async (req, res) => {
  try {
    const { error } = await supabase.from("jobs").select("id").limit(1);

    if (error) throw error;

    return res.status(200).json({
      status: "connected",
      message: "Supabase connection successful",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`SeeTrain API running on port ${PORT}`);
  });
}

module.exports = app;
