// Mock data for TOPIK test questions
// Hiện tại vẫn giữ mock để fallback khi API lỗi

import { apiClient } from '../../../provider/api/client'
import { ENDPOINTS } from '../../../provider/api/endpoints'

export const getTestQuestions = (level = 1) => {
  // Mock questions data for each level
  const mockQuestions = {
    1: Array.from({ length: 8 }, (_, i) => ({
      id: i + 1,
      questionNumber: i + 1,
      type: i % 2 === 0 ? 'audio' : 'text', // Alternate between audio and text
      questionText: i % 2 === 1 ? `Câu hỏi văn bản số ${i + 1}: Chọn đáp án đúng?` : null,
      audioUrl: i % 2 === 0 ? `https://example.com/audio/${i + 1}.mp3` : null,
      options: [
        '매일 일해요.',
        '매일 일해요.',
        '매일 일해요.',
        '매일 일해요.',
      ],
    })),
    2: Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      questionNumber: i + 1,
      type: i % 2 === 0 ? 'audio' : 'text',
      questionText: i % 2 === 1 ? `Câu hỏi văn bản số ${i + 1}: Chọn đáp án đúng?` : null,
      audioUrl: i % 2 === 0 ? `https://example.com/audio/${i + 1}.mp3` : null,
      options: [
        'Đáp án A',
        'Đáp án B',
        'Đáp án C',
        'Đáp án D',
      ],
    })),
    3: Array.from({ length: 30 }, (_, i) => ({
      id: i + 1,
      questionNumber: i + 1,
      type: i % 2 === 0 ? 'audio' : 'text',
      questionText: i % 2 === 1 ? `Câu hỏi văn bản số ${i + 1}: Chọn đáp án đúng?` : null,
      audioUrl: i % 2 === 0 ? `https://example.com/audio/${i + 1}.mp3` : null,
      options: [
        'Đáp án A',
        'Đáp án B',
        'Đáp án C',
        'Đáp án D',
      ],
    })),
    4: Array.from({ length: 40 }, (_, i) => ({
      id: i + 1,
      questionNumber: i + 1,
      type: i % 2 === 0 ? 'audio' : 'text',
      questionText: i % 2 === 1 ? `Câu hỏi văn bản số ${i + 1}: Chọn đáp án đúng?` : null,
      audioUrl: i % 2 === 0 ? `https://example.com/audio/${i + 1}.mp3` : null,
      options: [
        'Đáp án A',
        'Đáp án B',
        'Đáp án C',
        'Đáp án D',
      ],
    })),
    5: Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      questionNumber: i + 1,
      type: i % 2 === 0 ? 'audio' : 'text',
      questionText: i % 2 === 1 ? `Câu hỏi văn bản số ${i + 1}: Chọn đáp án đúng?` : null,
      audioUrl: i % 2 === 0 ? `https://example.com/audio/${i + 1}.mp3` : null,
      options: [
        'Đáp án A',
        'Đáp án B',
        'Đáp án C',
        'Đáp án D',
      ],
    })),
    6: Array.from({ length: 60 }, (_, i) => ({
      id: i + 1,
      questionNumber: i + 1,
      type: i % 2 === 0 ? 'audio' : 'text',
      questionText: i % 2 === 1 ? `Câu hỏi văn bản số ${i + 1}: Chọn đáp án đúng?` : null,
      audioUrl: i % 2 === 0 ? `https://example.com/audio/${i + 1}.mp3` : null,
      options: [
        'Đáp án A',
        'Đáp án B',
        'Đáp án C',
        'Đáp án D',
      ],
    })),
  }

  return mockQuestions[level] || mockQuestions[1]
}

import { getLevelData } from './roadmap-info'

// Get test configuration based on level
export const getTestConfig = (level = 1) => {
  const levelData = getLevelData(level)
  
  return {
    level,
    totalQuestions: levelData.questions,
    timePerQuestion: levelData.timePerQuestion,
    totalTime: levelData.questions * levelData.timePerQuestion, // in seconds
  }
}

// Format time as "MM : SS"
export const formatTime = (totalSeconds) => {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')} : ${String(seconds).padStart(2, '0')}`
}

const DEFAULT_EXAM_ID = 'kjyv9q3dac'

export const startExam = async (examId = DEFAULT_EXAM_ID, isShuffle = true) => {
  const url = ENDPOINTS.USER_EXAM?.TAKE_EXAM
    ? ENDPOINTS.USER_EXAM.TAKE_EXAM(examId, isShuffle)
    : `/UserExam/user/take-exam?examId=${encodeURIComponent(examId)}&isShuffle=${isShuffle}`

  const response = await apiClient.post(url, {})
  return response?.data?.data || null
}

export const mapExamToTestQuestions = (examData) => {
  if (!examData || !examData.part) return []

  const { part } = examData
  const allQuestions = []
  let questionCounter = 1

  const pushQuestionsFromSection = (sectionArray, defaultType) => {
    if (!Array.isArray(sectionArray)) return

    sectionArray.forEach((p) => {
      ;(p.questions || []).forEach((q) => {
        const options = (q.options || []).map((opt) => opt.content)
        const mediaType = (q.mediaType || '').toLowerCase()
        const type =
          mediaType === 'audio' || defaultType === 'audio'
            ? 'audio'
            : 'text'

        allQuestions.push({
          id: q.questionId,
          questionNumber: questionCounter++,
          type,
          questionText: q.content || '',
          audioUrl: q.mediaUrl || null,
          options,
          rawQuestion: q,
        })
      })
    })
  }

  pushQuestionsFromSection(part.listening, 'audio')
  pushQuestionsFromSection(part.reading, 'text')

  return allQuestions
}

/**
 * Lấy lịch sử làm bài của user với phân trang
 * @param {number} pageNumber - Số trang (bắt đầu từ 1)
 * @param {number} pageSize - Số lượng items mỗi trang
 * @returns {Promise<Object>} - Response từ API
 */
export const getExamHistory = async (pageNumber = 1, pageSize = 10) => {
  const url = ENDPOINTS.USER_EXAM?.HISTORY
    ? ENDPOINTS.USER_EXAM.HISTORY
    : '/UserExam/user/history'

  const response = await apiClient.get(url, {
    params: {
      pageNumber,
      pageSize,
    },
  })

  return response?.data || null
}