package org.katoridao.seetrain.data.remote

import org.katoridao.seetrain.data.model.HistoryItem

data class HistoryResponse(
    val total: Int,
    val history: List<HistoryItem>
)