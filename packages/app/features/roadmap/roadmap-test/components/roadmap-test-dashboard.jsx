import React, { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { RoadmapTestAnswer } from './roadmap-test-answer'

const QUESTIONS_PER_PAGE = 8

export function RoadmapTestDashboard({
  totalQuestions = 8,
  timeRemaining = '08 : 00',
  answers = {},
  onAnswerSelect,
  onSubmit,
  currentQuestion = 1,
  onQuestionSelect,
}) {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(totalQuestions / QUESTIONS_PER_PAGE)
  const startQuestion = (currentPage - 1) * QUESTIONS_PER_PAGE + 1
  const endQuestion = Math.min(currentPage * QUESTIONS_PER_PAGE, totalQuestions)
  const questionsOnPage = Array.from({ length: endQuestion - startQuestion + 1 }, (_, i) => startQuestion + i)

  const handleAnswerSelect = (questionNum, answerIndex) => {
    if (onAnswerSelect) {
      onAnswerSelect(questionNum, answerIndex)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  return (
    <View style={styles.container}>
      {/* Timer */}
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>{timeRemaining}</Text>
      </View>

      {/* Questions Grid */}
      <View style={styles.questionsContainer}>
        {questionsOnPage.map((questionNum) => (
          <Pressable
            key={questionNum}
            onPress={() => onQuestionSelect && onQuestionSelect(questionNum)}
            style={[
              styles.questionRow,
              currentQuestion === questionNum && styles.questionRowActive,
            ]}
          >
            <Text style={styles.questionLabel}>({questionNum})</Text>
            <RoadmapTestAnswer
              selectedAnswer={answers[questionNum]}
              onAnswerSelect={(answerIndex) => handleAnswerSelect(questionNum, answerIndex)}
              containerStyle={styles.answerButtonsRow}
              buttonSize={40}
              gap={12}
            />
          </Pressable>
        ))}
      </View>

      {/* Navigation and Submit */}
      <View style={styles.bottomSection}>
        {totalPages > 1 && (
          <View style={styles.pageIndicatorContainer}>
            {currentPage > 1 && (
              <Pressable onPress={handlePrevPage} style={styles.arrowButton}>
                <Text style={styles.arrowText}>←</Text>
              </Pressable>
            )}
            <Text style={styles.pageIndicator}>
              ({currentPage})
            </Text>
            {currentPage < totalPages && (
              <Pressable onPress={handleNextPage} style={styles.arrowButton}>
                <Text style={styles.arrowText}>→</Text>
              </Pressable>
            )}
          </View>
        )}
        <Pressable onPress={onSubmit} style={({ pressed }) => [styles.submitButton, pressed && styles.submitButtonPressed]}>
          <Text style={styles.submitButtonText}>Nộp Bài</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0DD',
    paddingVertical: 20,
    paddingHorizontal: 24,
    gap: 24,
    maxWidth: 600,
    alignSelf: 'center',
    borderRadius: 30,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
    // Inner shadow for web
    ...(typeof window !== 'undefined' && {
      boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1), 0 -4px 8px rgba(0, 0, 0, 0.15)',
    }),
  },
  timerContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  timerText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
  },
  questionsContainer: {
    gap: 16,
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  questionRowActive: {
    backgroundColor: '#FFE7A5',
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  questionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
    minWidth: 40,
  },
  answerButtonsRow: {
    flex: 1,
  },
  bottomSection: {
    alignItems: 'center',
    gap: 12,
    paddingTop: 8,
  },
  pageIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pageIndicator: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
  },
  arrowButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  arrowText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
  },
  submitButton: {
    backgroundColor: '#E8B4B8',
    minWidth: 200,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  submitButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Epilogue, sans-serif',
  },
})

