package com.example.data

import kotlinx.coroutines.flow.Flow

class IdeaRepository(private val ideaDao: IdeaDao) {
    val allIdeas: Flow<List<Idea>> = ideaDao.getAllIdeas()

    suspend fun getIdeaById(id: Int): Idea? = ideaDao.getIdeaById(id)

    suspend fun insert(idea: Idea): Long = ideaDao.insertIdea(idea)

    suspend fun update(idea: Idea) = ideaDao.updateIdea(idea)

    suspend fun delete(idea: Idea) = ideaDao.deleteIdea(idea)

    suspend fun clear() = ideaDao.clearAllIdeas()

    suspend fun getCount(): Int = ideaDao.getCount()
}
