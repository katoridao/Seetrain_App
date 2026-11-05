
package org.katoridao.seetrain.data.repo

import android.content.Context
import android.net.Uri
import android.provider.OpenableColumns
import org.katoridao.seetrain.data.model.DocumentInfo

class DocumentRepo(
    private val context: Context
) {

    fun getDocumentInfo(uri: Uri): DocumentInfo? {

        val contentResolver = context.contentResolver

        val mimeType = contentResolver.getType(uri)

        var name = "Unknown"
        var size = 0L

        contentResolver.query(
            uri,
            null,
            null,
            null,
            null
        )?.use { cursor ->

            if (cursor.moveToFirst()) {

                val nameIndex = cursor.getColumnIndex(
                    OpenableColumns.DISPLAY_NAME
                )

                val sizeIndex = cursor.getColumnIndex(
                    OpenableColumns.SIZE
                )

                if (nameIndex >= 0) {
                    name = cursor.getString(nameIndex)
                }

                if (sizeIndex >= 0 && !cursor.isNull(sizeIndex)) {
                    size = cursor.getLong(sizeIndex)
                }
            }
        }

        return DocumentInfo(
            uri = uri,
            name = name,
            mimeType = mimeType,
            size = size
        )
    }
}
