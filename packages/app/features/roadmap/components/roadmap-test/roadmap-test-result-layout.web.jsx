import React from 'react'
import { StyleSheet, View, Text, ScrollView, Pressable, Platform } from 'react-native'
import { useRouter } from 'solito/navigation'
import { Navbar } from '../../../../../components/navbar'
import { RoadmapTestButton } from './roadmap-test-button'
import ArrowIcon from '../../../../../assets/icon/icon-mainflow/arrow.svg'
import { NavigationPill } from '../../../../../components/navigation-pill'

const SectionScoreCard = ({
  label,
  score,
  maxScore,
  correctAnswers,
  totalQuestions,
  onViewDetail,
  isGraded = true,
}) => {
  const isWriting = label === 'Viết'
  const showPendingMessage = isWriting && !isGraded

  return (
    <View style={styles.sectionCard}>
      {/* Row 1: label (left) + correct (right) */}
      <View style={styles.sectionTopRow}>
        <Text style={styles.sectionLabel}>{label}</Text>
        {showPendingMessage ? (
          <Text style={styles.pendingText}>Đang chấm điểm...</Text>
        ) : (
          <Text style={styles.sectionDetailText}>
            {correctAnswers} / {totalQuestions} câu đúng
          </Text>
        )}
      </View>

      {/* Row 2: score (left) + view detail (right) */}
      <View style={styles.sectionBottomRow}>
        {showPendingMessage ? (
          <Text style={styles.pendingScoreText}>Chưa có điểm</Text>
        ) : (
          <Text style={styles.sectionScoreText}>
            {score} / {maxScore} điểm
          </Text>
        )}
        {!!onViewDetail && (
          <Pressable
            onPress={onViewDetail}
            disabled={showPendingMessage}
            style={({ pressed }) => [
              styles.detailLink,
              pressed && styles.detailLinkPressed,
              showPendingMessage && styles.detailLinkDisabled,
            ]}
            hitSlop={6}
          >
            <Text
              style={[
                styles.detailLinkText,
                showPendingMessage && styles.detailLinkTextDisabled,
              ]}
            >
              {showPendingMessage ? 'Đang chấm...' : 'Xem chi tiết'}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  )
}

export function RoadmapTestResultLayout({
  userExamId,
  resultData,
  isLoading,
  error,
  isGraded = false,
}) {
  const router = useRouter()

  if (isLoading) {
    return (
      <View style={styles.wrapper}>
        <Navbar />
        <View style={styles.centerContent}>
          <Text style={styles.loadingText}>Đang tải kết quả...</Text>
        </View>
      </View>
    )
  }

  if (error || !resultData) {
    return (
      <View style={styles.wrapper}>
        <Navbar />
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{error || 'Không thể tải kết quả bài thi.'}</Text>
          <RoadmapTestButton
            title="Quay lại"
            onPress={() => router.back()}
            style={styles.backButton}
          />
        </View>
      </View>
    )
  }

  const { userName, examTitle, listening, reading, writing, totalScore } = resultData
  const toDetail = (sectionKey) =>
    `/roadmap/test/result/detail?userExamId=${encodeURIComponent(userExamId || '')}&section=${encodeURIComponent(
      sectionKey
    )}`

  return (
    <View style={styles.wrapper}>
      <Navbar />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.backButtonContainer}>
            <NavigationPill
              label="Quay lại"
              to={undefined}
              icon={ArrowIcon}
              onPress={() => router.push('/roadmap/info')}
              textStyle={{ fontWeight: '700' }}
              iconStyle={{ transform: [{ scaleX: -1 }] }}
            />
          </View>

          <Text style={styles.title}>Kết quả bài thi</Text>
          {userName && (
            <Text style={styles.subtitle}>
              Thí sinh: {userName}
            </Text>
          )}
          {examTitle && (
            <Text style={styles.examTitle}>{examTitle}</Text>
          )}

          <View style={styles.totalScoreBox}>
            <Text style={styles.totalScoreLabel}>Tổng điểm</Text>
            <Text style={styles.totalScoreValue}>{totalScore ?? 0}</Text>
          </View>

          <View style={styles.sectionsRow}>
            {listening && (
              <SectionScoreCard
                label="Nghe"
                score={listening.score}
                maxScore={listening.maxScore}
                correctAnswers={listening.correctAnswers}
                totalQuestions={listening.totalQuestions}
                onViewDetail={() => router.push(toDetail('listening'))}
              />
            )}
            {reading && (
              <SectionScoreCard
                label="Đọc"
                score={reading.score}
                maxScore={reading.maxScore}
                correctAnswers={reading.correctAnswers}
                totalQuestions={reading.totalQuestions}
                onViewDetail={() => router.push(toDetail('reading'))}
              />
            )}
            {writing && (
              <SectionScoreCard
                label="Viết"
                score={writing.score}
                maxScore={writing.maxScore}
                correctAnswers={writing.correctAnswers}
                totalQuestions={writing.totalQuestions}
                onViewDetail={() => router.push(toDetail('writing'))}
                isGraded={isGraded}
              />
            )}
          </View>

          <View style={styles.actionsRow}>
            <RoadmapTestButton
              title="Về trang lộ trình"
              onPress={() => router.push('/roadmap/info')}
              style={[styles.actionButton, styles.actionButtonSecondary]}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#FFEFE1',
    minHeight: '100vh',
  },
  scrollContent: {
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    paddingBottom: 80,
  },
  backButtonContainer: {
    alignSelf: 'flex-start',
    marginBottom: 0,
  },
  content: {
    width: '100%',
    maxWidth: 600,
    backgroundColor: '#FDF7EC',
    borderRadius: 24,
    padding: 32,
    gap: 24,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#5F5F5F',
    fontFamily: 'Epilogue, sans-serif',
  },
  errorText: {
    fontSize: 16,
    color: '#C62828',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
  },
  backButton: {
    minWidth: 140,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#5F5F5F',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
  },
  examTitle: {
    fontSize: 14,
    color: '#8E8E8E',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
  },
  totalScoreBox: {
    backgroundColor: '#FFF2CC',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFC56E',
  },
  totalScoreLabel: {
    fontSize: 14,
    color: '#5F5F5F',
    fontFamily: 'Epilogue, sans-serif',
    marginBottom: 4,
  },
  totalScoreValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
  },
  sectionsRow: {
    gap: 16,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FFE0B3',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
  },
  sectionTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  sectionScoreText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2E7D32',
    fontFamily: 'Epilogue, sans-serif',
  },
  sectionDetailText: {
    fontSize: 14,
    color: '#5F5F5F',
    fontFamily: 'Epilogue, sans-serif',
  },
  sectionBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  detailLink: {
    paddingVertical: 4,
    paddingHorizontal: 0,
  },
  detailLinkPressed: {
    opacity: 0.7,
  },
  detailLinkText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
    textDecorationLine: 'none',
  },
  detailLinkDisabled: {
    opacity: 0.5,
  },
  detailLinkTextDisabled: {
    color: '#8E8E8E',
  },
  pendingText: {
    fontSize: 14,
    color: '#FF9800',
    fontFamily: 'Epilogue, sans-serif',
    fontWeight: '600',
  },
  pendingScoreText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#8E8E8E',
    fontFamily: 'Epilogue, sans-serif',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
    marginTop: 8,
  },
  actionButton: {
    minWidth: 160,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  actionButtonSecondary: {
    backgroundColor: '#FFF4DA',
  },
})
