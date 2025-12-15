import React from 'react'
import { View, StyleSheet } from 'react-native'
import { LoadingWithContainer } from '../../../../../../components/Loading'
import {
  TestProgressHeader,
  QuestionsList,
  SubmitButton,
  ScoreResult,
} from '../index'

/**
 * AlphabetTestMain (Web): Nội dung chính của trang kiểm tra chữ cái Hàn Quốc trên web
 */
export function AlphabetTestMain({
  questions,
  selectedAnswers,
  showResults,
  score,
  isSubmitted,
  progress,
  onClose,
  onBackPress,
  onAnswerSelect,
  onSubmit,
}) {
  if (questions.length === 0) {
    return (
      <LoadingWithContainer
        size={48}
        color="#F1BE4B"
        shadowColor="#F1BE4B50"
        text="Đang tải câu hỏi..."
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      />
    )
  }

  return (
    <>
      {/* Header với progress và close button */}
      <TestProgressHeader
        answered={Object.keys(selectedAnswers).length}
        total={questions.length}
        progress={progress}
        onClose={onClose}
      />

      {/* Questions List */}
      <QuestionsList
        questions={questions}
        selectedAnswers={selectedAnswers}
        showResults={isSubmitted}
        disabled={isSubmitted}
        onAnswerSelect={onAnswerSelect}
      />

      {/* Submit Button hoặc Score */}
      {!isSubmitted ? (
        <SubmitButton
          disabled={Object.keys(selectedAnswers).length < questions.length}
          onPress={onSubmit}
        />
      ) : (
        <ScoreResult
          score={score}
          total={questions.length}
          onFinish={onBackPress}
        />
      )}
    </>
  )
}

const styles = StyleSheet.create({})

