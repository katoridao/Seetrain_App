package org.katoridao.seetrain.data.remote

data class JobResponse(
    val jobId: String,
    val status: String,
    val message: String?,
    val videoUrl: String?,
    val infographicUrl: String?,
    val error: String?
)