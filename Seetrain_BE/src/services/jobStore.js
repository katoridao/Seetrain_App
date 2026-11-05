const { randomUUID } = require("crypto");
const path = require("path");

const supabase = require("../config/supabase");

const BUCKET_NAME = "seetrain-files";

// create new job
async function createJob(file) {
  const jobId = randomUUID();

  // unique file path
  const extension = path.extname(file.originalname).toLowerCase();
  const documentPath = `documents/${jobId}/${randomUUID()}${extension}`;

  // upload
  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(documentPath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Document upload failed: ${uploadError.message}`);
  }

  // job record
  const { data, error } = await supabase
    .from("jobs")
    .insert({
      id: jobId,
      status: "uploaded",
      message: "Document uploaded successfully",

      original_name: file.originalname,
      mime_type: file.mimetype,
      file_size: file.size,

      document_path: documentPath,
    })
    .select()
    .single();

  if (error) {
    await supabase.storage.from(BUCKET_NAME).remove([documentPath]);

    throw new Error(`Job creation failed: ${error.message}`);
  }

  return {
    jobId: data.id,
    status: data.status,
    message: data.message,
  };
}

// get job by id
async function getJob(jobId) {
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", jobId)
    .maybeSingle();

  if (error) {
    throw new Error(`Get job failed: ${error.message}`);
  }

  if (!data) return null;

  return {
    jobId: data.id,
    status: data.status,
    message: data.message,
    originalName: data.original_name,
    mimeType: data.mime_type,
    size: data.file_size,
    documentPath: data.document_path,
    videoPath: data.video_path,
    infographicPath: data.infographic_path,
    extractedText: data.extracted_text,
    error: data.error,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

// update
async function updateJob(jobId, updates) {
  const columnMap = {
    status: "status",
    message: "message",
    videoPath: "video_path",
    infographicPath: "infographic_path",
    extractedText: "extracted_text",
    script: "script",
    error: "error",
  };

  const updateData = {};

  for (const [key, value] of Object.entries(updates)) {
    if (columnMap[key]) {
      updateData[columnMap[key]] = value;
    }
  }

  updateData.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("jobs")
    .update(updateData)
    .eq("id", jobId)
    .select()
    .maybeSingle();

  if (error) {
    throw new Error(`Job update failed: ${error.message}`);
  }

  if (!data) return null;

  return {
    jobId: data.id,
    status: data.status,
    message: data.message,
  };
}

module.exports = {
  createJob,
  getJob,
  updateJob,
};
