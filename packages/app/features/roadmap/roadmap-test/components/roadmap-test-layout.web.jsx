import React, { useState, useEffect } from 'react'
import { StyleSheet, View, Image } from 'react-native'
import { RoadmapTestQuestion } from './roadmap-test-question'
import { RoadmapTestDashboard } from './roadmap-test-dashboard'
import { RoadmapTestButton } from './roadmap-test-button'
import { getTestQuestions, getTestConfig, formatTime } from '../api/api'
import CarrotImage from '../../../../../assets/carrot.png'

const normalizeImageSource = (src) => {
  if (!src) return null
  if (typeof src === 'number' || src.uri) return src
  if (typeof src === 'object' && src.src) return { uri: src.src }
  if (typeof src === 'string') return { uri: src }
  return src
}

export function RoadmapTestLayout({ level = 1 }) {
  const [currentQuestion, setCurrentQuestion] = useState(1)
  const [answers, setAnswers] = useState({})
  const [timeRemaining, setTimeRemaining] = useState('08 : 00')
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(0)
  const [questions, setQuestions] = useState([])
  const [totalQuestions, setTotalQuestions] = useState(8)

  // Load test data based on level
  useEffect(() => {
    const testConfig = getTestConfig(level)
    const testQuestions = getTestQuestions(level)
    
    setTotalQuestions(testConfig.totalQuestions)
    setQuestions(testQuestions)
    
    // Calculate initial time
    const totalSeconds = testConfig.totalTime
    setTimeRemainingSeconds(totalSeconds)
    setTimeRemaining(formatTime(totalSeconds))
  }, [level])

  // Countdown timer
  useEffect(() => {
    if (timeRemainingSeconds <= 0) {
      return
    }

    const timer = setInterval(() => {
      setTimeRemainingSeconds((prev) => {
        if (prev <= 1) {
          // Time's up - auto submit or show alert
          handleSubmit()
          return 0
        }
        const newSeconds = prev - 1
        setTimeRemaining(formatTime(newSeconds))
        return newSeconds
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeRemainingSeconds])

  // Handle answer selection from question component
  const handleQuestionAnswerSelect = (answerIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion]: answerIndex,
    }))
  }

  // Handle answer selection from dashboard component
  const handleDashboardAnswerSelect = (questionNum, answerIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [questionNum]: answerIndex,
    }))
  }

  // Handle question selection from dashboard
  const handleQuestionSelect = (questionNum) => {
    setCurrentQuestion(questionNum)
  }

  // Navigate to next question
  const handleNextQuestion = () => {
    if (currentQuestion < totalQuestions) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  // Navigate to previous question
  const handlePrevQuestion = () => {
    if (currentQuestion > 1) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  // Handle submit
  const handleSubmit = () => {
    console.log('Submitted answers:', answers)
    // TODO: Implement submit logic
    // Stop timer when submitting
    setTimeRemainingSeconds(0)
  }

  const currentQuestionData = questions.find((q) => q.questionNumber === currentQuestion) || questions[0]

  return (
    <View style={styles.container}>
      <View style={styles.contentRow}>
        {/* Left: Question */}
        <View style={styles.questionContainer}>
          {currentQuestionData && (
            <RoadmapTestQuestion
              questionNumber={currentQuestionData.questionNumber}
              type={currentQuestionData.type}
              questionText={currentQuestionData.questionText}
              audioUrl={currentQuestionData.audioUrl}
              options={currentQuestionData.options}
              selectedAnswer={answers[currentQuestion]}
              onAnswerSelect={handleQuestionAnswerSelect}
            />
          )}
          
          {/* Navigation Buttons */}
          <View style={styles.navigationButtons}>
            {currentQuestion > 1 ? (
              <RoadmapTestButton
                title="← Trở lại"
                onPress={handlePrevQuestion}
                style={styles.navButtonLeft}
              />
            ) : (
              <View style={styles.navButtonLeft} />
            )}
            {currentQuestion < totalQuestions && (
              <RoadmapTestButton
                title="Câu tiếp theo →"
                onPress={handleNextQuestion}
                style={styles.navButtonRight}
              />
            )}
          </View>
        </View>

        {/* Right: Dashboard */}
        <View style={styles.dashboardContainer}>
          <RoadmapTestDashboard
            totalQuestions={totalQuestions}
            timeRemaining={timeRemaining}
            answers={answers}
            onAnswerSelect={handleDashboardAnswerSelect}
            onSubmit={handleSubmit}
            currentQuestion={currentQuestion}
            onQuestionSelect={handleQuestionSelect}
          />
        </View>
      </View>
      <Image source={normalizeImageSource(CarrotImage)} style={styles.carrot} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0DD',
    padding: 24,
    position: 'relative',
  },
  contentRow: {
    flexDirection: 'row',
    gap: 24,
    alignItems: 'flex-start',
  },
  questionContainer: {
    flex: 1,
    gap: 16,
    top: 30,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 24,
    marginTop: 8,
  },
  navButtonLeft: {
    alignSelf: 'flex-start',
    minWidth: 120,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  navButtonRight: {
    alignSelf: 'flex-end',
    minWidth: 120,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  dashboardContainer: {
    width: 400,
  },
  carrot: {
    position: 'absolute',
    top: 10,
    right: 350,
    width: 200,
    height: 100,
    zIndex: 10,
    resizeMode: 'contain',
  },
})

