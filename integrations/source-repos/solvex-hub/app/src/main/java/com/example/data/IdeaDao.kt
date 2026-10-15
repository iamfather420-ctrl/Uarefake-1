package com.example.data

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Dao
interface IdeaDao {
    @Query("SELECT * FROM ideas ORDER BY timestamp DESC")
    fun getAllIdeas(): Flow<List<Idea>>

    @Query("SELECT * FROM ideas WHERE id = :id LIMIT 1")
    suspend fun getIdeaById(id: Int): Idea?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertIdea(idea: Idea): Long

    @Update
    suspend fun updateIdea(idea: Idea)

    @Delete
    suspend fun deleteIdea(idea: Idea)

    @Query("DELETE FROM ideas")
    suspend fun clearAllIdeas()

    @Query("SELECT COUNT(*) FROM ideas")
    suspend fun getCount(): Int
}
