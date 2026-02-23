/**
 * Mock API cho game Solitaire.
 *
 *  - Mỗi "topic" là một cột.
 *  - Tối đa 7 topic.
 *  - Số lượng card trong từng cột được random, KHÔNG cố định theo hàng.
 *  - Mỗi card hiện tại dùng cùng một text mock "습관" cho đơn giản.
 */

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
 * Tạo random integer trong khoảng [min, max]
 */
const randomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Mock layout cho solitaire:
 *  - Các card của mọi topic sẽ được TRỘN với nhau,
 *    không còn kiểu "1 cột = 1 chủ đề" nữa.
 *  - Vẫn random tổng số card, sau đó chia đều lần lượt vào các cột.
 *
 * @param {number} [maxTopics=7] - số topic tối đa (cột tối đa)
 * @returns {Array<{
 *  id: string;
 *  cards: Array<{ id: string; text: string; topicId: string }>;
 * }>}
 */
export const getMockSolitareLayout = (maxTopics = 7) => {
  const topics = MOCK_TOPICS.slice(0, maxTopics)

  // Tạo toàn bộ card cho tất cả topic
  const allCards = []

  topics.forEach((topic, topicIndex) => {
    const cardCount = randomInt(3, 8)
    Array.from({ length: cardCount }).forEach((_, cardIndex) => {
      allCards.push({
        id: `${topic.id}-${topicIndex}-${cardIndex}`,
        text: topic.name, // tạm thời dùng tên topic làm text mock
        topicId: topic.id,
      })
    })
  })

  // Trộn ngẫu nhiên toàn bộ card
  for (let i = allCards.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = allCards[i]
    allCards[i] = allCards[j]
    allCards[j] = temp
  }

  // Khởi tạo cột rỗng
  const columnCount = topics.length
  const columns = Array.from({ length: columnCount }).map((_, index) => ({
    id: `column-${index}`,
    cards: [],
  }))

  // Chia lần lượt card vào từng cột (round-robin)
  allCards.forEach((card, index) => {
    const colIndex = index % columnCount
    columns[colIndex].cards.push(card)
  })

  return columns
}

/**
 * Get quantity based on difficulty level
 * @param {string} level - 'Easy', 'Medium', 'Hard'
 * @returns {number} quantity
 */
const getQuantityByLevel = (level) => {
  const levelMap = {
    Easy: 25,
    Medium: 30,
    Hard: 35,
  }
  return levelMap[level] || 25
}

/**
 * Main API function - calls real API
 * API response format:
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
 * @param {string} level - 'Easy', 'Medium', 'Hard'
 * @returns {Promise<Array>} Promise resolves to columns array
 */
import { apiClient } from '../../../provider/api/client'
import { ENDPOINTS } from '../../../provider/api/endpoints'

export const getSolitareLayout = async (level = 'Easy') => {
  try {
    const quantity = getQuantityByLevel(level)
    const response = await apiClient.get(ENDPOINTS.MINIGAME.SOLITAIRE, {
      params: { quantity },
    })

    const result = response.data

    if (!result.isSuccess || !result.data) {
      throw new Error('Invalid API response')
    }

    // Lọc topic theo unique topicId, giới hạn tối đa 7 topic
    const uniqueTopicsMap = {}
    result.data.forEach((topic) => {
      if (!uniqueTopicsMap[topic.topicId]) {
        uniqueTopicsMap[topic.topicId] = topic
      }
    })
    let uniqueTopics = Object.values(uniqueTopicsMap)
    // Shuffle topics để random
    uniqueTopics = uniqueTopics.sort(() => Math.random() - 0.5)
    // Giới hạn tối đa 7 topic
    const selectedTopics = uniqueTopics.slice(0, 7)

    // Flatten all vocabularies from selected topics into cards
    const allCards = []
    selectedTopics.forEach((topic) => {
      topic.vocabularies.forEach((vocab) => {
        allCards.push({
          id: vocab.vocabId,
          text: vocab.text,
          topicId: topic.topicId,
          topicName: topic.topicName,
          imgUrl: vocab.imgUrl,
          definition: vocab.definition,
        })
      })
    })

    // Shuffle cards randomly
    for (let i = allCards.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1))
      const temp = allCards[i]
      allCards[i] = allCards[j]
      allCards[j] = temp
    }

    // Create columns (7 columns)
    const columnCount = 7
    const columns = Array.from({ length: columnCount }).map((_, index) => ({
      id: `column-${index}`,
      cards: [],
    }))

    // Distribute cards randomly into columns (not round-robin, but random distribution)
    // This creates columns with varying numbers of cards
    allCards.forEach((card) => {
      // Randomly assign to a column
      const randomColIndex = Math.floor(Math.random() * columnCount)
      columns[randomColIndex].cards.push(card)
    })

    // Sort cards within each column to ensure proper stacking
    columns.forEach((col) => {
      // Shuffle cards within column for more randomness
      for (let i = col.cards.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1))
        const temp = col.cards[i]
        col.cards[i] = col.cards[j]
        col.cards[j] = temp
      }
    })

    return columns
  } catch (error) {
    console.error('Failed to load solitaire layout from API:', error)
    // Fallback to mock data
    return Promise.resolve(getMockSolitareLayout(7))
  }
}


