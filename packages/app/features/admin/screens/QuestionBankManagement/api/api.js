import { apiClient } from '../../../../../provider/api/client'
import { handleApiError } from '../../../api'

/**
 * Mock data cho Question Bank Management
 * TODO: Thay thế bằng API calls thực tế
 * - mockQuestionTypes: danh sách loại câu hỏi (QuestionType)
 * - mockQuestions: danh sách câu hỏi, mỗi câu hỏi gắn với một QuestionTypeId
 *
 * Skill enum:
 * 1 - Listening (Nghe)
 * 2 - Reading (Đọc)
 * 3 - Writing (Viết)
 */

export const mockQuestionTypes = [
  {
    questionTypeId: 'b1H7qK9sD6',
    code: 'REA_TOP',
    name: 'Reading - Identify Topic',
    description: 'Đọc các câu mô tả và chọn chủ đề liên quan',
    skill: 2,
    isActive: 1,
  },
  {
    questionTypeId: 'j9L3zX1yA4',
    code: 'LIS_LOC',
    name: 'Listening - Identify Location',
    description: 'Nghe hội thoại và đoán xem đang ở đâu',
    skill: 1,
    isActive: 1,
  },
  {
    questionTypeId: 'm5Nb4Dv2c5',
    code: 'LIS_IMG',
    name: 'Listening - Select Picture',
    description: 'Nghe tình huống và chọn bức tranh mô tả đúng nhất',
    skill: 1,
    isActive: 1,
  },
  {
    questionTypeId: 'w5Tp9k3nL7',
    code: 'WRI_TOPIK',
    name: 'Writing - TOPIK Essay',
    description: 'Viết bài luận theo chủ đề TOPIK, yêu cầu số chữ nhất định',
    skill: 3,
    isActive: 1,
  },
  {
    questionTypeId: 'z8J6fR4wQ7',
    code: 'REA_COR',
    name: 'Reading - Match Content',
    description: 'Đọc đoạn văn và chọn câu có nội dung đúng với đoạn văn',
    skill: 2,
    isActive: 1,
  },
]

export const mockQuestions = [
  {
    id: '1',
    questionTypeId: 'b1H7qK9sD6',
    content: '다음 중 \"안녕하세요\"의 의미는 무엇입니까?',
    examType: 'TOPIK I',
    difficulty: 'easy',
    type: 'multiple-choice',
    skill: 'reading',
    skillEnum: 2,
    answers: [
      { content: 'Hello', isCorrect: true },
      { content: 'Goodbye', isCorrect: false },
      { content: 'Thank you', isCorrect: false },
      { content: 'Sorry', isCorrect: false },
    ],
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    questionTypeId: 'z8J6fR4wQ7',
    content:
      '다음 문장을 읽고 빈칸에 들어갈 알맞은 단어를 고르세요: \"저는 한국어를 _____ 공부하고 있습니다.\"',
    examType: 'TOPIK II',
    difficulty: 'medium',
    type: 'fill-blank',
    skill: 'reading',
    skillEnum: 2,
    answers: [
      { content: '열심히', isCorrect: true },
      { content: '느리게', isCorrect: false },
      { content: '가끔', isCorrect: false },
      { content: '아직', isCorrect: false },
    ],
    createdAt: '2024-01-16T14:20:00Z',
    updatedAt: '2024-01-16T14:20:00Z',
  },
  {
    id: '3',
    questionTypeId: 'j9L3zX1yA4',
    content: '다음 대화를 듣고 질문에 답하세요: \"오늘 날씨가 어때요?\" - \"날씨가 매우 좋아요.\"',
    examType: 'KLPT',
    difficulty: 'easy',
    type: 'multiple-choice',
    skill: 'listening',
    skillEnum: 1,
    answers: [
      { content: '날씨가 좋다', isCorrect: true },
      { content: '날씨가 나쁘다', isCorrect: false },
      { content: '날씨를 모른다', isCorrect: false },
    ],
    createdAt: '2024-01-17T09:15:00Z',
    updatedAt: '2024-01-17T09:15:00Z',
  },
  {
    id: '4',
    questionTypeId: 'w5Tp9k3nL7',
    content: '다음 문장의 문법이 올바른지 판단하세요: \"나는 어제 학교에 갔어요.\"',
    examType: 'EPS-TOPIK',
    difficulty: 'hard',
    type: 'true-false',
    skill: 'writing',
    skillEnum: 3,
    answers: [
      { content: '올바름', isCorrect: true },
      { content: '틀림', isCorrect: false },
    ],
    createdAt: '2024-01-18T16:45:00Z',
    updatedAt: '2024-01-18T16:45:00Z',
  },
  {
    id: '5',
    questionTypeId: 'm5Nb4Dv2c5',
    content:
      '다음 단어들을 듣고, 그림과 가장 잘 어울리는 것을 고르세요: \"저는\", \"한국어\", \"배우고\", \"있습니다\"',
    examType: 'TOPIK II',
    difficulty: 'medium',
    type: 'matching',
    skill: 'listening',
    skillEnum: 1,
    answers: [
      { content: '저는 한국어를 배우고 있습니다', isCorrect: true },
      { content: '저는 배우고 한국어를 있습니다', isCorrect: false },
      { content: '한국어를 저는 배우고 있습니다', isCorrect: false },
    ],
    createdAt: '2024-01-19T11:30:00Z',
    updatedAt: '2024-01-19T11:30:00Z',
  },
]

/**
 * Fetch all question types
 * @returns {Promise<Array>} Array of question types
 */
export async function fetchQuestionTypes() {
  try {
    // TODO: Replace with actual API call
    // const response = await apiClient.get('/api/admin/question-types')
    // return response.data
    return mockQuestionTypes
  } catch (error) {
    handleApiError(error, 'Không thể tải danh sách loại câu hỏi')
  }
}

/**
 * Fetch all questions
 * @param {Object} filters - Filter options (questionTypeId, skill, etc.)
 * @returns {Promise<Array>} Array of questions
 */
export async function fetchQuestions(filters = {}) {
  try {
    // TODO: Replace with actual API call
    // const response = await apiClient.get('/api/admin/questions', { params: filters })
    // return response.data
    let result = mockQuestions
    if (filters.questionTypeId) {
      result = result.filter((q) => q.questionTypeId === filters.questionTypeId)
    }
    if (filters.skill) {
      result = result.filter((q) => q.skill === filters.skill)
    }
    return result
  } catch (error) {
    handleApiError(error, 'Không thể tải danh sách câu hỏi')
  }
}

