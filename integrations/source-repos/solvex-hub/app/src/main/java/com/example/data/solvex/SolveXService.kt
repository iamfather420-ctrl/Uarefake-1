package com.example.data.solvex

import android.util.Log
import com.example.BuildConfig
import com.squareup.moshi.Moshi
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory
import okhttp3.OkHttpClient
import okhttp3.ResponseBody
import retrofit2.Retrofit
import retrofit2.converter.moshi.MoshiConverterFactory
import retrofit2.http.*
import java.util.concurrent.TimeUnit

// --- Data Classes ---

data class SolveXJob(
    val id: Int,
    val title: String,
    val description: String,
    val budget: String = "$150",
    val board: String, // "upwork", "fiverr", "freelancer", "peopleperhour", "toptal"
    val status: String = "Open",
    val duration: String = "1 week",
    val clientCountry: String = "United States"
)

data class SolveXJobsResponse(
    val status: String,
    val data: List<SolveXJob>?,
    val pagination: SolveXPagination? = null
)

data class SolveXPagination(
    val total: Int = 0,
    val limit: Int = 20,
    val offset: Int = 0
)

data class SolveXJobDetailResponse(
    val status: String,
    val data: SolveXJobDetail?
)

data class SolveXJobDetail(
    val id: Int,
    val title: String,
    val description: String,
    val budget: String = "$150",
    val board: String,
    val status: String = "Open",
    val duration: String = "1 week",
    val clientCountry: String = "United States",
    val solutions: List<SolveXSolutionSummary>? = null
)

data class SolveXSolutionSummary(
    val id: Int,
    val summary: String,
    val timestamp: String
)

data class SubmitSolutionRequest(
    val encrypted_content: String,
    val decryption_key: String,
    val summary: String
)

data class SubmitSolutionResponse(
    val status: String,
    val data: SolveXSolutionResult?
)

data class SolveXSolutionResult(
    val id: Int,
    val jobId: Int,
    val summary: String,
    val timestamp: String,
    val status: String = "Submitted"
)

// --- Retrofit Interface ---

interface SolveXApi {
    @GET("api/v1/jobs")
    suspend fun listJobs(
        @Query("limit") limit: Int = 20,
        @Query("offset") offset: Int = 0
    ): SolveXJobsResponse

    @GET("api/v1/jobs/board/{board}")
    suspend fun listJobsByBoard(
        @Path("board") board: String,
        @Query("limit") limit: Int = 20,
        @Query("offset") offset: Int = 0
    ): SolveXJobsResponse

    @GET("api/v1/jobs/{jobId}")
    suspend fun getJobDetails(
        @Path("jobId") jobId: Int
    ): SolveXJobDetailResponse

    @POST("api/v1/jobs/{jobId}/solutions")
    suspend fun submitSolution(
        @Path("jobId") jobId: Int,
        @Header("x-api-key") apiKey: String,
        @Body request: SubmitSolutionRequest
    ): SubmitSolutionResponse
}

// --- Client Singleton ---

object SolveXClient {
    // Ported from provided OpenAPI servers block
    private const val BASE_URL = "https://3000-iunfgria2p75jjrrchoa7-55e66d0c.us1.manus.computer/"

    private val moshi = Moshi.Builder()
        .addLast(KotlinJsonAdapterFactory())
        .build()

    private val okHttpClient = OkHttpClient.Builder()
        .connectTimeout(2, TimeUnit.SECONDS)
        .readTimeout(2, TimeUnit.SECONDS)
        .writeTimeout(2, TimeUnit.SECONDS)
        .build()

    private val retrofit = Retrofit.Builder()
        .baseUrl(BASE_URL)
        .client(okHttpClient)
        .addConverterFactory(MoshiConverterFactory.create(moshi))
        .build()

    val api: SolveXApi = retrofit.create(SolveXApi::class.java)

    // Robust offline fallback data so the app never crashes and handles playground environment limitations
    val fallbackJobs = listOf(
        SolveXJob(
            id = 1001,
            title = "Need Microbilling/SaaS Billing System for High-Volume API",
            description = "We are releasing an AI image generator API and need a microbilling system. Ideally, it issues single-use authorization passes that expire. It should only charge users for the actual seconds or minutes spent running requests on our secure AWS backend. Needs to integrate cleanly into React or mobile clients.",
            budget = "$1,850",
            board = "upwork",
            duration = "2 weeks",
            clientCountry = "United Kingdom"
        ),
        SolveXJob(
            id = 1002,
            title = "AI Grams Calculator from Recipe Screenshots / Camera feeds",
            description = "Looking for a fitness mobile app feature: users can point their camera at some food or take a screenshot of a cooking recipe. The system must parse food elements, cross-reference density standards, and compute the absolute weight in grams automatically. On-device processing is a major plus.",
            budget = "$920",
            board = "fiverr",
            duration = "1 week",
            clientCountry = "Germany"
        ),
        SolveXJob(
            id = 1003,
            title = "Privacy-First Multi-Calendar Scheduling Coordinator",
            description = "Our executive team wants a secure tool to schedule meetings with outer clients. But we CANNOT reveal the description, details, or participants of our Google and Outlook calendar items. We need a zero-knowledge scheduling poll matching available spots without exposing sensitive descriptions.",
            budget = "$1,450",
            board = "toptal",
            duration = "3 weeks",
            clientCountry = "Switzerland"
        ),
        SolveXJob(
            id = 1004,
            title = "On-Device Receipt/Expense extraction and tax ledger tracking",
            description = "Build a background service for Android that monitors screen screenshots/receipts, parses business expense items, and automatically registers tax write-offs. Since it handles personal financial transactions, all processing MUST stay secure on-device or fully encrypted under user control.",
            budget = "$2,100",
            board = "freelancer",
            duration = "1 month",
            clientCountry = "Canada"
        ),
        SolveXJob(
            id = 1005,
            title = "Secure Escrow Freelance Wallet for Crypto/ACH Clearing",
            description = "Need a gateway system that bridges Upwork/Fiverr with personal broker accounts (PayPal/ACH) to ensure zero broker freeze risk. The system must accept client royalties, verify completion metrics, and release escrow automatically based on encrypted key criteria. Low-code integration is ideal.",
            budget = "$750",
            board = "peopleperhour",
            duration = "5 days",
            clientCountry = "United States"
        )
    )
}
