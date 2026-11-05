package org.katoridao.seetrain.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import org.katoridao.seetrain.data.model.HistoryItem
import org.katoridao.seetrain.data.repo.UploadRepo

data class HistoryUiState(
    val isLoading: Boolean = false,
    val history: List<HistoryItem> = emptyList(),
    val error: String? = null
)

class HistoryViewModel : ViewModel() {

    private val uploadRepo = UploadRepo()

    private val _uiState = MutableStateFlow(HistoryUiState())
    val uiState: StateFlow<HistoryUiState> = _uiState.asStateFlow()

    fun loadHistory() {
        viewModelScope.launch {
            _uiState.value = HistoryUiState(isLoading = true)

            try {
                val response = uploadRepo.getHistory()

                if (!response.isSuccessful) {
                    throw Exception("HTTP ${response.code()}")
                }

                val result = response.body()
                    ?: throw Exception("Empty history response")

                _uiState.value = HistoryUiState(
                    history = result.history
                )

            } catch (error: Exception) {
                _uiState.value = HistoryUiState(
                    error = error.message ?: "Failed to load history"
                )
            }
        }
    }
}