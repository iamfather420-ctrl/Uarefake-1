package com.example.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "ideas")
data class Idea(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val title: String,
    val source: String, // "r/problems", "r/startupideas", "Twitter/X", "User Submission"
    val originalText: String,
    val author: String,
    val timestamp: Long = System.currentTimeMillis(),
    val tamScore: Int = 0,
    val feasibilityScore: Int = 0,
    val gapScore: Int = 0,
    val totalScore: Int = 0,
    val marketSize: String = "N/A",
    val analysisDetails: String = "",
    val outreachMessage: String = "",
    val status: String = "Scouted", // "Scouted", "Evaluating", "Outreach Sent", "Accepted", "Signed Contract", "Payout Completed", "Secured Vault"
    val valuation: Double = 150.00,
    val isBookmarked: Boolean = false
)
