package org.katoridao.seetrain.data.remote

import okhttp3.MultipartBody
import retrofit2.Response
import retrofit2.http.Multipart
import retrofit2.http.POST
import retrofit2.http.Part
import retrofit2.http.GET
import retrofit2.http.Path
import org.katoridao.seetrain.data.remote.HistoryResponse

interface ApiService {

    @Multipart
    @POST("upload")
    suspend fun uploadDocument(
        @Part file: MultipartBody.Part
    ): Response<UploadResponse>

    @GET("jobs/{id}")
    suspend fun getJob(
        @Path("id") jobId: String
    ): Response<JobResponse>

    @GET("history")
    suspend fun getHistory(): Response<HistoryResponse>

}