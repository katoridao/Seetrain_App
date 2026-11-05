package org.katoridao.seetrain.data.remote

data class UploadResponse(
    val jobId: String,
    val status: String,
    val message: String
)