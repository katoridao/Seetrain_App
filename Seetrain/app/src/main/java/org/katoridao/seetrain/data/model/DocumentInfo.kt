package org.katoridao.seetrain.data.model

import android.net.Uri

data class DocumentInfo(
    val uri: Uri,
    val name: String,
    val mimeType: String?,
    val size: Long
)