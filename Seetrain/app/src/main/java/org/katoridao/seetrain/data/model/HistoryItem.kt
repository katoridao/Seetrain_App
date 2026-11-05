package org.katoridao.seetrain.data.model

data class HistoryItem(
    val jobId: String,
    val status: String,
    val originalName: String,
    val videoUrl: String?,
    val infographicUrl: String?,
    val createdAt: String
)