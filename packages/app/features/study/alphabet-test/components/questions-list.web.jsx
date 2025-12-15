import React from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { QuestionCard } from '../../flashcard-test/components/question-card.web'

/**
 * QuestionsList: Danh sách câu hỏi
 */
export function QuestionsList({
  questions,
  selectedAnswers,
  showResults,
  disabled,
  onAnswerSelect,
}) {
  return (
    <ScrollView 
      style={styles.list}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={true}
    >
      {questions.map((question, index) => (
        <View key={question.id} style={styles.item}>
          <View style={styles.questionNumber}>
            <Text style={styles.questionNumberText}>Câu {index + 1}</Text>
          </View>
          <QuestionCard
            question={question.question}
            options={question.options}
            correctAnswerId={question.correctAnswerId}
            imageUrl={question.imageUrl}
            onAnswerSelect={(answerId, isCorrect) => 
              onAnswerSelect(question.id, answerId, isCorrect)
            }
            showResult={showResults}
            disabled={disabled}
            selectedAnswerId={selectedAnswers[question.id]}
          />
        </View>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  list: {
    width: '100%',
    flex: 1,
  },
  listContent: {
    gap: 24,
    paddingBottom: 16,
  },
  item: {
    width: '100%',
    gap: 12,
  },
  questionNumber: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F1BE4B',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  questionNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
  },
})

