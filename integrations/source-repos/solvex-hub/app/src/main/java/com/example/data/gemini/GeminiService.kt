package com.example.data.gemini

import android.util.Log
import com.example.BuildConfig
import com.squareup.moshi.Moshi
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory
import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.moshi.MoshiConverterFactory
import retrofit2.http.Body
import retrofit2.http.POST
import retrofit2.http.Query
import java.util.concurrent.TimeUnit

interface GeminiApiService {
    @POST("v1beta/models/gemini-3.5-flash:generateContent")
    suspend fun generateContent(
        @Query("key") apiKey: String,
        @Body request: GenerateContentRequest
    ): GenerateContentResponse
}

object GeminiClient {
    private const val BASE_URL = "https://generativelanguage.googleapis.com/"

    private val moshi = Moshi.Builder()
        .addLast(KotlinJsonAdapterFactory())
        .build()

    private val okHttpClient = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .build()

    private val retrofit = Retrofit.Builder()
        .baseUrl(BASE_URL)
        .client(okHttpClient)
        .addConverterFactory(MoshiConverterFactory.create(moshi))
        .build()

    val apiService: GeminiApiService = retrofit.create(GeminiApiService::class.java)

    // Moshi parsing helper for evaluations
    fun parseEvaluation(jsonString: String): IdeaEvaluationResult? {
        return try {
            val adapter = moshi.adapter(IdeaEvaluationResult::class.java)
            // Sometimes Gemini puts markdown wrapper ```json ... ```, strip it
            val cleanJson = jsonString
                .trim()
                .removePrefix("```json")
                .removePrefix("```")
                .removeSuffix("```")
                .trim()
            adapter.fromJson(cleanJson)
        } catch (e: Exception) {
            Log.e("GeminiClient", "Json parsing failed", e)
            null
        }
    }

    // Moshi parsing helper for evaluation arrays
    fun parseEvaluationArray(jsonString: String): List<IdeaEvaluationResult>? {
        return try {
            val type = com.squareup.moshi.Types.newParameterizedType(List::class.java, IdeaEvaluationResult::class.java)
            val adapter = moshi.adapter<List<IdeaEvaluationResult>>(type)
            val cleanJson = jsonString
                .trim()
                .removePrefix("```json")
                .removePrefix("```")
                .removeSuffix("```")
                .trim()
            adapter.fromJson(cleanJson)
        } catch (e: Exception) {
            Log.e("GeminiClient", "Json array parsing failed", e)
            null
        }
    }
}
