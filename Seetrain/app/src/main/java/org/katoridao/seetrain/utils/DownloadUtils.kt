package org.katoridao.seetrain.utils

import android.app.DownloadManager
import android.content.Context
import android.net.Uri
import android.os.Environment
import android.widget.Toast

object DownloadUtils {
    fun downloadFile(
        context: Context,
        url: String?,
        titleName: String,
        defaultExtension: String = ".mp4"
    ) {
        if (url.isNullOrBlank()) {
            Toast.makeText(context, "File URL is not available", Toast.LENGTH_SHORT).show()
            return
        }

        try {
            val uri = Uri.parse(url)

            val extension = when {
                url.contains(".mp4", ignoreCase = true) -> ".mp4"
                url.contains(".png", ignoreCase = true) -> ".png"
                url.contains(".jpg", ignoreCase = true) || url.contains(".jpeg", ignoreCase = true) -> ".jpg"
                else -> defaultExtension
            }

            val sanitizedTitle = titleName.trim().replace(Regex("[^a-zA-Z0-9_-]"), "_")
            val fileName = if (sanitizedTitle.endsWith(extension, ignoreCase = true)) {
                sanitizedTitle
            } else {
                "${sanitizedTitle}_${System.currentTimeMillis() % 10000}$extension"
            }

            val request = DownloadManager.Request(uri).apply {
                setTitle("Seetrain - $fileName")
                setDescription("Downloading training media...")
                setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, fileName)
                setAllowedOverMetered(true)
                setAllowedOverRoaming(true)
            }

            val downloadManager = context.getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
            downloadManager.enqueue(request)

            Toast.makeText(
                context,
                "Starting download: $fileName",
                Toast.LENGTH_SHORT
            ).show()

        } catch (e: Exception) {
            Toast.makeText(
                context,
                "Download error: ${e.message}",
                Toast.LENGTH_LONG
            ).show()
        }
    }
}
