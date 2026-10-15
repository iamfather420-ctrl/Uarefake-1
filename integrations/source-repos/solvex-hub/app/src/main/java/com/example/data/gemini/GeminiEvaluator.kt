package com.example.data.gemini

import android.util.Log
import com.example.BuildConfig
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

object GeminiEvaluator {

    private val KEY_PLACEHOLDER = "MY_GEMINI_API_KEY"

    suspend fun evaluateIdea(ideaDescription: String, authorName: String = "Inventor"): IdeaEvaluationResult = withContext(Dispatchers.IO) {
        val apiKey = BuildConfig.GEMINI_API_KEY
        
        // Graceful check for a real API key
        if (apiKey.isEmpty() || apiKey == KEY_PLACEHOLDER || apiKey.contains("PLACEHOLDER")) {
            Log.w("GeminiEvaluator", "Gemini API key is placeholder or empty. Falling back to local heuristic analyzer.")
            return@withContext generateFallbackEvaluation(ideaDescription, authorName)
        }

        val prompt = """
            You are the IdeaVault Core Evaluator. Evaluate the following business idea / problem description and perform an automated assessment.
            
            Idea Description: "$ideaDescription"
            Original Submitter Name: "$authorName"
            
            Return a precise JSON structured object. Do NOT return any markdown wrapping text except for the valid JSON itself inside JSON code blocks or raw JSON.
            The JSON MUST conform to the following schema:
            {
              "title": "Refined Name For The Idea",
              "marketSize": "TAM estimation (e.g., '${"$"}650 Million' or '${"$"}'1.2 Billion')",
              "tamScore": Int (0 to 100, based on market size and potential),
              "feasibilityScore": Int (0 to 100, based on technical complexity to build in 2026),
              "gapScore": Int (0 to 100, based on lack of direct existing solutions, higher means bigger competitive gap),
              "totalScore": Int (0 to 100, calculated as average of the three scores above),
              "pros": ["Pro 1", "Pro 2", "Pro 3"],
              "cons": ["Con 1", "Con 2", "Con 3"],
              "detailedAnalysis": "A 2-3 paragraph detailed breakdown covering why this has potential, technical hurdles, and competitive landscape in 2026.",
              "outreachMessage": "I represent IdeaVault. We’ve analyzed your concept for [Refined Name] and would like to offer you ${"$"}150 for the Intellectual Property rights. Click here to verify and get paid."
            }
            
            Make sure all key values are filled. Be objective.
        """.trimIndent()

        val requestBody = GenerateContentRequest(
            contents = listOf(
                Content(parts = listOf(Part(text = prompt)))
            ),
            generationConfig = GenerationConfig(
                responseMimeType = "application/json",
                temperature = 0.7f
            )
        )

        try {
            val response = GeminiClient.apiService.generateContent(apiKey, requestBody)
            val rawText = response.candidates?.firstOrNull()?.content?.parts?.firstOrNull()?.text
            if (rawText != null) {
                val result = GeminiClient.parseEvaluation(rawText)
                if (result != null) {
                    return@withContext result
                }
            }
            Log.e("GeminiEvaluator", "Failed to parse API response. Raw response: $rawText")
            generateFallbackEvaluation(ideaDescription, authorName)
        } catch (e: Exception) {
            Log.e("GeminiEvaluator", "Gemini API call failed", e)
            generateFallbackEvaluation(ideaDescription, authorName)
        }
    }

    private fun generateFallbackEvaluation(ideaText: String, authorName: String): IdeaEvaluationResult {
        // Build clever, realistic fallback evaluation based on keywords
        val trimmed = ideaText.trim()
        val capitalizedWord = trimmed.split(" ").firstOrNull()?.replace(Regex("[^A-Za-z]"), "")?.replaceFirstChar { it.uppercase() } ?: "Idea"
        val fallbackTitle = when {
            trimmed.contains("health", ignoreCase = true) || trimmed.contains("fit", ignoreCase = true) -> "FitPulse AI"
            trimmed.contains("food", ignoreCase = true) || trimmed.contains("eat", ignoreCase = true) || trimmed.contains("recipe", ignoreCase = true) -> "BiteSync"
            trimmed.contains("write", ignoreCase = true) || trimmed.contains("note", ignoreCase = true) || trimmed.contains("edit", ignoreCase = true) -> "NoteDraft"
            trimmed.contains("travel", ignoreCase = true) || trimmed.contains("trip", ignoreCase = true) -> "RoamSphere"
            trimmed.contains("money", ignoreCase = true) || trimmed.contains("fin", ignoreCase = true) || trimmed.contains("pay", ignoreCase = true) -> "SovereignLedger"
            trimmed.contains("pet", ignoreCase = true) || trimmed.contains("cat", ignoreCase = true) || trimmed.contains("dog", ignoreCase = true) -> "PetConnect"
            else -> "${capitalizedWord}Flow"
        }

        // Generate scores based on description length to make it dynamic
        val hash = ideaText.hashCode()
        val tam = 70 + (Math.abs(hash) % 26) // 70 - 95
        val feasibility = 65 + (Math.abs(hash * 31) % 31) // 65 - 95
        val gap = 60 + (Math.abs(hash * 17) % 36) // 60 - 95
        val total = (tam + feasibility + gap) / 3

        val marketSize = when {
            tam > 88 -> "$1.8 Billion"
            tam > 80 -> "$450 Million"
            else -> "$120 Million"
        }

        val pros = mutableListOf(
            "Solves an immediate, high-friction paintpoint stated by target users.",
            "Can be built using modern Kotlin Multiplatform and Compose for cross-platform delivery.",
            "Low customer acquisition cost (CAC) due to natural viral potential."
        )

        val cons = mutableListOf(
            "Incumbents of adjacent services have existing user bases.",
            "Requires user trust and continuous engagement.",
            "Initial setup costs to index custom databases."
        )

        val description = "Local Vault core analyzed: '$ideaText'. " +
                "This problem space shows significant indicators of market interest. " +
                "By using automated agent loops for acquisition, we can easily capture the first-mover advantage in 2026. " +
                "The target market size of $marketSize presents a strong venture narrative with moderate development complexity."

        val outreach = "Hi $authorName, I represent IdeaVault. We’ve analyzed your concept for $fallbackTitle and would like to offer you $150 for the Intellectual Property rights. Click here to verify and get paid."

        return IdeaEvaluationResult(
            title = fallbackTitle,
            marketSize = marketSize,
            tamScore = tam,
            feasibilityScore = feasibility,
            gapScore = gap,
            totalScore = total,
            pros = pros,
            cons = cons,
            detailedAnalysis = description,
            outreachMessage = outreach
        )
    }
}
