package org.katoridao.seetrain.viewmodel

import android.app.Application
import android.net.Uri
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.toRequestBody
import org.katoridao.seetrain.data.repo.DocumentRepo
import org.katoridao.seetrain.data.repo.UploadRepo

data class UploadUiState(
    val status: String = "idle",
    val message: String = "",
    val jobId: String? = null,
    val videoUrl: String? = null,
    val infographicUrl: String? = null,
    val error: String? = null
)

class UploadViewModel(application: Application) :
    AndroidViewModel(application) {

    private val documentRepo = DocumentRepo(application)
    private val uploadRepo = UploadRepo()

    private val _uiState = MutableStateFlow(UploadUiState())
    val uiState: StateFlow<UploadUiState> = _uiState.asStateFlow()

    fun uploadDocument(uri: Uri) {
        viewModelScope.launch {
            try {
                _uiState.value = UploadUiState(
                    status = "uploading",
                    message = "Uploading document..."
                )

                val document = documentRepo.getDocumentInfo(uri)
                    ?: throw Exception("Cannot read document information")

                val contentResolver =
                    getApplication<Application>().contentResolver

                val bytes = contentResolver.openInputStream(uri)?.use {
                    it.readBytes()
                } ?: throw Exception("Cannot open document")

                val mimeType = document.mimeType
                    ?: "application/octet-stream"

                val requestBody = bytes.toRequestBody(
                    mimeType.toMediaTypeOrNull()
                )

                val filePart = MultipartBody.Part.createFormData(
                    "file",
                    document.name,
                    requestBody
                )

                val response = uploadRepo.uploadDocument(filePart)

                if (!response.isSuccessful) {
                    throw Exception("Upload failed: HTTP ${response.code()}")
                }

                val job = response.body()
                    ?: throw Exception("Empty upload response")

                _uiState.value = UploadUiState(
                    status = job.status,
                    message = job.message,
                    jobId = job.jobId
                )

                pollJob(job.jobId)

            } catch (error: Exception) {
                _uiState.value = UploadUiState(
                    status = "failed",
                    message = "Upload failed",
                    error = error.message
                )
            }
        }
    }

    private suspend fun pollJob(jobId: String) {
        while (true) {
            delay(3000)

            val response = uploadRepo.getJob(jobId)

            if (!response.isSuccessful) {
                throw Exception("Cannot get job status: HTTP ${response.code()}")
            }

            val job = response.body()
                ?: throw Exception("Empty job response")

            _uiState.value = UploadUiState(
                status = job.status,
                message = job.message ?: "",
                jobId = job.jobId,
                videoUrl = job.videoUrl,
                infographicUrl = job.infographicUrl,
                error = job.error
            )

            if (job.status == "completed" || job.status == "failed") {
                break
            }
        }
    }

    fun resetState() {
        _uiState.value = UploadUiState()
    }
}