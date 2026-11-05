package org.katoridao.seetrain.data.repo

import okhttp3.MultipartBody
import org.katoridao.seetrain.data.remote.RetrofitClient

class UploadRepo {
    private val apiService = RetrofitClient.apiService

    suspend fun uploadDocument(file: MultipartBody.Part) =
        apiService.uploadDocument(file)

    suspend fun getJob(jobId: String) =
        apiService.getJob(jobId)

    suspend fun getHistory() =
        apiService.getHistory()
}