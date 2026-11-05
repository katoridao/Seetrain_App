const fs = require("fs/promises");
const supabase = require("../config/supabase");

const BUCKET_NAME = "seetrain-files";
const URL_EXPIRES_IN = 3600;

// Upload generated video / infographic
async function uploadGeneratedFile(localPath, storagePath, contentType) {
  const fileBuffer = await fs.readFile(localPath);

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(storagePath, fileBuffer, {
      contentType,
      upsert: true,
    });

  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`);
  }

  return storagePath;
}

// Generate signed URL for private files
async function createSignedUrl(filePath) {
  if (!filePath) return null;

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(filePath, URL_EXPIRES_IN);

  if (error) {
    if (error.message === "Object not found") {
      console.warn(`Stored object not found: ${filePath}`);
      return null;
    }

    throw new Error(`Failed to create signed URL: ${error.message}`);
  }

  return data.signedUrl;
}

// Remove generated files when processing fails
async function removeStoredFile(filePath) {
  if (!filePath) return;

  const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath]);

  if (error) {
    console.error(`Failed to remove stored file: ${error.message}`);
  }
}

module.exports = {
  uploadGeneratedFile,
  createSignedUrl,
  removeStoredFile,
};
