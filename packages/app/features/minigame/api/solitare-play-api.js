/**
 * Mock + Real API for Solitaire game
 *
 * Gameplay rule:
 * - There is NO fixed home column.
 * - Topic cards and vocabulary cards are all normal cards on the board.
 * - A stack is completed when:
 *   + The column contains exactly ONE topic card
 *   + All remaining cards in that column are vocab cards of the same topic
 *   + The number of vocab cards is enough for that topic
 *
 * Therefore:
 * - Topic cards must also be distributed onto the board
 * - Vocab cards must be distributed across columns
 * - We do NOT inject one topic card globally later
 */

import { apiClient } from '../../../provider/api/client'
import { ENDPOINTS } from '../../../provider/api/endpoints'

const MOCK_TOPICS = [
  { id: 'habit', name: '습관' },
  { id: 'family', name: '가족' },
  { id: 'school', name: '학교' },
  { id: 'job', name: '직업' },
  { id: 'hobby', name: '취미' },
  { id: 'life', name: '생활' },
  { id: 'sport', name: '스포츠' },
]

/**
 * Random integer in [min, max]
 */
const randomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Fisher-Yates shuffle
 */
const shuffle = (arr = []) => {
  const next = [...arr]
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

/**
 * Build columns from a flat card list
 * - cards are shuffled globally first
 * - then distributed round-robin so every column has cards
 * - then each column is shuffled again lightly
 */
const buildColumnsFromCards = (cards, columnCount) => {
  const shuffledCards = shuffle(cards)

  const columns = Array.from({ length: Math.max(columnCount, 1) }).map((_, index) => ({
    id: `column-${index}`,
    cards: [],
  }))

  shuffledCards.forEach((card, index) => {
    const colIndex = index % columns.length
    columns[colIndex].cards.push(card)
  })

  return columns.map((col) => ({
    ...col,
    cards: shuffle(col.cards),
  }))
}

/**
 * Mock layout
 * - each topic has:
 *   + 1 topic card
 *   + random vocab cards
 * - all cards are mixed and distributed across columns
 */
export const getMockSolitareLayout = (maxTopics = 7) => {
  const topics = MOCK_TOPICS.slice(0, maxTopics)

  const allCards = []

  topics.forEach((topic, topicIndex) => {
    const vocabCount = randomInt(3, 8)

    // topic card
    allCards.push({
      id: `topic-${topic.id}-${topicIndex}`,
      text: topic.name,
      topicId: topic.id,
      topicName: topic.name,
      imgUrl: null,
      definition: null,
      isTopic: true,
    })

    // vocab cards
    Array.from({ length: vocabCount }).forEach((_, cardIndex) => {
      allCards.push({
        id: `${topic.id}-${topicIndex}-${cardIndex}`,
        text: topic.name,
        topicId: topic.id,
        topicName: topic.name,
        imgUrl: null,
        definition: null,
        isTopic: false,
      })
    })
  })

  return buildColumnsFromCards(allCards, topics.length)
}

/**
 * Get quantity based on difficulty level
 * @param {string} level - 'easy' | 'medium' | 'hard'
 * @returns {number}
 */
const getQuantityByLevel = (level) => {
  const normalizedLevel = String(level || '').toLowerCase()

  const levelMap = {
    easy: 20,
    medium: 30,
    hard: 40,
  }

  return levelMap[normalizedLevel] || 25
}

/**
 * Real API layout
 * Expected API shape:
 * {
 *   isSuccess: boolean,
 *   data: Array<{
 *     topicId: string,
 *     topicName: string,
 *     imgUrl: string,
 *     vocabularies: Array<{
 *       vocabId: string,
 *       text: string,
 *       imgUrl: string,
 *       definition: string
 *     }>
 *   }>
 * }
 *
 * Returned layout shape:
 * Array<{
 *   id: string,
 *   cards: Array<{
 *     id: string,
 *     text: string,
 *     topicId: string,
 *     topicName: string,
 *     imgUrl?: string | null,
 *     definition?: string | null,
 *     isTopic: boolean
 *   }>
 * }>
 */
export const getSolitareLayout = async (level = 'easy') => {
  try {
    const quantity = getQuantityByLevel(level)
    console.log('[Solitaire API] level =', level)
    console.log('[Solitaire API] quantity =', quantity)

    const response = await apiClient.get(ENDPOINTS.MINIGAME.SOLITAIRE, {
      params: { quantity },
    })

    const result = response.data

    const isSuccess = result?.isSuccess ?? result?.statusCode === 200
    const topicsData = result?.data

    if (!isSuccess || !Array.isArray(topicsData)) {
      throw new Error('Invalid API response')
    }

    // unique topics by topicId
    const uniqueTopicsMap = {}
    topicsData.forEach((topic) => {
      if (topic?.topicId && !uniqueTopicsMap[topic.topicId]) {
        uniqueTopicsMap[topic.topicId] = topic
      }
    })

    let selectedTopics = Object.values(uniqueTopicsMap)
    selectedTopics = shuffle(selectedTopics)

    if (selectedTopics.length === 0) {
      throw new Error('No topics returned from API')
    }

    const allCards = []

    selectedTopics.forEach((topic) => {
      // topic card
      allCards.push({
        id: `topic-${topic.topicId}`,
        text: topic.topicName,
        topicId: topic.topicId,
        topicName: topic.topicName,
        imgUrl: topic.imgUrl || null,
        definition: null,
        isTopic: true,
      })

      // vocab cards
      ;(topic.vocabularies || []).forEach((vocab) => {
        if (!vocab?.vocabId || !vocab?.text) return

        allCards.push({
          id: vocab.vocabId,
          text: vocab.text,
          topicId: topic.topicId,
          topicName: topic.topicName,
          imgUrl: vocab.imgUrl || null,
          definition: vocab.definition || null,
          isTopic: false,
        })
      })
    })

    const columnCount = Math.max(selectedTopics.length, 1)
    return buildColumnsFromCards(allCards, columnCount)
  } catch (error) {
    console.error('Failed to load solitaire layout from API:', error)
    return Promise.resolve(getMockSolitareLayout(7))
  }
}