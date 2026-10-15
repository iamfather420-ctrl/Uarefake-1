package com.example.data.gemini

import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class GenerateContentRequest(
    val contents: List<Content>,
    val generationConfig: GenerationConfig? = null
)

@JsonClass(generateAdapter = true)
data class Content(
    val parts: List<Part>
)

@JsonClass(generateAdapter = true)
data class Part(
    val text: String
)

@JsonClass(generateAdapter = true)
data class GenerationConfig(
    val responseMimeType: String? = null,
    val temperature: Float? = null
)

@JsonClass(generateAdapter = true)
data class GenerateContentResponse(
    val candidates: List<Candidate>?
)

@JsonClass(generateAdapter = true)
data class Candidate(
    val content: Content?
)

@JsonClass(generateAdapter = true)
data class IdeaEvaluationResult(
    val title: String,
    val marketSize: String,
    val tamScore: Int,
    val feasibilityScore: Int,
    val gapScore: Int,
    val totalScore: Int,
    val pros: List<String>,
    val cons: List<String>,
    val detailedAnalysis: String,
    val outreachMessage: String
)
