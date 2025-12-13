// Mock data for TOPIK test questions
// This will be replaced with real API calls later

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

import { getLevelData } from '../../roadmap-info/api/api'

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

