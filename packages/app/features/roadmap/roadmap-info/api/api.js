// Mock data for TOPIK levels
export const TOPIK_LEVELS = [
  {
    level: 1,
    label: 'TOPIK 1',
    questions: 8,
    timePerQuestion: 60, // seconds (1 phút)
  },
  {
    level: 2,
    label: 'TOPIK 2',
    questions: 20,
    timePerQuestion: 55, // seconds
  },
  {
    level: 3,
    label: 'TOPIK 3',
    questions: 30,
    timePerQuestion: 50, // seconds
  },
  {
    level: 4,
    label: 'TOPIK 4',
    questions: 40,
    timePerQuestion: 45, // seconds
  },
  {
    level: 5,
    label: 'TOPIK 5',
    questions: 50,
    timePerQuestion: 40, // seconds
  },
  {
    level: 6,
    label: 'TOPIK 6',
    questions: 60,
    timePerQuestion: 35, // seconds
  },
]

// Calculate total time in seconds
export const getTotalTime = (level) => {
  const levelData = TOPIK_LEVELS.find((l) => l.level === level)
  if (!levelData) return 0
  return levelData.questions * levelData.timePerQuestion
}

// Format time as "X phút Y giây"
export const formatTime = (totalSeconds) => {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes} phút ${seconds} giây`
}

// Get level data by level number
export const getLevelData = (level) => {
  return TOPIK_LEVELS.find((l) => l.level === level) || TOPIK_LEVELS[0]
}

