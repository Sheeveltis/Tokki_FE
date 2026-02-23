import React from 'react'
import { StyleSheet, View, Text, ScrollView, Platform } from 'react-native'
import { useRouter } from 'solito/navigation'
import { Navbar } from '../../../../../components/navbar'
import ArrowIcon from '../../../../../assets/icon/icon-mainflow/arrow.svg'
import { NavigationPill } from '../../../../../components/navigation-pill'

const getSectionLabel = (section) =>
  section === 'listening' ? 'Nghe' : section === 'reading' ? 'Đọc' : section === 'writing' ? 'Viết' : ''

// Format thời gian theo UTC+7 (GMT+7)
// Cộng thêm 7 giờ vào thời gian UTC từ backend
const formatDateTimeUTC7 = (dateString) => {
  if (!dateString) return ''
  
  try {
    // Parse date string - Date constructor tự động parse UTC nếu có 'Z' hoặc timezone offset
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return String(dateString)
    
    // Lấy UTC timestamp (milliseconds từ epoch UTC)
    const utcTimestamp = date.getTime()
    
    // Cộng thêm 7 giờ (7 * 60 * 60 * 1000 milliseconds) để chuyển sang UTC+7
    const utc7Timestamp = utcTimestamp + (7 * 60 * 60 * 1000)
    const utc7Date = new Date(utc7Timestamp)
    
    // Format: DD/MM/YYYY HH:mm:ss (sử dụng UTC methods để đảm bảo đúng UTC+7)
    const day = String(utc7Date.getUTCDate()).padStart(2, '0')
    const month = String(utc7Date.getUTCMonth() + 1).padStart(2, '0')
    const year = utc7Date.getUTCFullYear()
    const hours = String(utc7Date.getUTCHours()).padStart(2, '0')
    const minutes = String(utc7Date.getUTCMinutes()).padStart(2, '0')
    const seconds = String(utc7Date.getUTCSeconds()).padStart(2, '0')
    
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`
  } catch (err) {
    console.error('Error formatting date:', err)
    return String(dateString)
  }
}

export function RoadmapTestResultDetailLayout({ userExamId, section, detailData, isLoading, error }) {
  const router = useRouter()
  const sectionLabel = getSectionLabel(section)

  const questionGroups = detailData?.questionGroups || []
  const isWritingDetail = questionGroups?.some((g) =>
    (g?.questions || []).some((q) => typeof q?.answerContent === 'string' || q?.aiAnalysis)
  )

  return (
    <View style={styles.wrapper}>
      <Navbar />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.backButtonContainer}>
            <NavigationPill
              label="Quay lại kết quả"
              to={undefined}
              icon={ArrowIcon}
              onPress={() => {
                const to = userExamId
                  ? `/roadmap/test/result?userExamId=${encodeURIComponent(userExamId)}`
                  : '/roadmap/test/result'
                router.push(to)
              }}
              textStyle={{ fontWeight: '700' }}
              iconStyle={{ transform: [{ scaleX: -1 }] }}
            />
          </View>

          <Text style={styles.title}>Chi tiết phần {sectionLabel}</Text>

          {isLoading ? <Text style={styles.loadingText}>Đang tải chi tiết...</Text> : null}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {!isLoading && !error && !detailData ? (
            <Text style={styles.emptyText}>Chưa có dữ liệu chi tiết.</Text>
          ) : null}

          {!isLoading && !error && !!detailData && (
            <>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryText}>
                  Điểm: {detailData?.score ?? 0} / {detailData?.maxScore ?? 0}
                </Text>
                {!isWritingDetail ? (
                  <Text style={styles.summaryText}>
                    Đúng: {detailData?.correctAnswers ?? 0} / {detailData?.totalQuestions ?? 0}
                  </Text>
                ) : (
                  <Text style={styles.summaryText}>Số câu: {detailData?.totalQuestions ?? 0}</Text>
                )}
              </View>

              {questionGroups.length === 0 ? (
                <Text style={styles.emptyText}>Chưa có dữ liệu câu hỏi.</Text>
              ) : (
                <View style={styles.groupList}>
                  {questionGroups.map((group, groupIdx) => {
                    const sharedMediaType = (group?.sharedMediaType || '').toLowerCase()
                    const sharedMediaUrl = group?.sharedMediaUrl || null
                    const sharedPassageContent = group?.sharedPassageContent || null

                    return (
                      <View key={`${groupIdx}`} style={styles.groupCard}>
                        {sharedPassageContent ? (
                          <View style={styles.groupPassageBox}>
                            <Text style={styles.groupPassageText}>{String(sharedPassageContent)}</Text>
                          </View>
                        ) : null}

                        {Platform.OS === 'web' && sharedMediaUrl && sharedMediaType === 'audio' ? (
                          <View style={styles.groupMediaBox}>
                            <audio controls src={sharedMediaUrl} style={{ width: '100%' }} />
                          </View>
                        ) : null}

                        {Platform.OS === 'web' && sharedMediaUrl && sharedMediaType === 'image' ? (
                          <View style={styles.groupMediaBox}>
                            <img
                              src={sharedMediaUrl}
                              alt="Shared media"
                              style={{ maxWidth: '100%', borderRadius: 12 }}
                            />
                          </View>
                        ) : null}

                        <View style={styles.questionList}>
                          {(group?.questions || []).map((q) => {
                            const isWritingQuestion = typeof q?.answerContent === 'string' || !!q?.aiAnalysis
                            const hasOptions = Array.isArray(q?.options) && q.options.length > 0
                            const selected = q?.selectedOptionId
                            const correct = q?.correctOptionId
                            const isCorrect = !!q?.isCorrect

                            return (
                              <View key={`${q?.questionNo}`} style={styles.questionCard}>
                                <View style={styles.questionHeaderRow}>
                                  <Text style={styles.questionNo}>Câu {q?.questionNo}</Text>
                                  {isWritingQuestion ? (
                                    <Text style={styles.writingScoreChip}>Điểm: {q?.score ?? 0}</Text>
                                  ) : (
                                    <Text
                                      style={[
                                        styles.questionResult,
                                        isCorrect ? styles.questionResultOk : styles.questionResultBad,
                                      ]}
                                    >
                                      {isCorrect ? 'Đúng' : 'Sai'}
                                    </Text>
                                  )}
                                </View>

                                {!!q?.content && <Text style={styles.questionContent}>{String(q.content)}</Text>}

                                {hasOptions && (
                                  <View style={styles.optionsList}>
                                    {(q?.options || []).map((opt) => {
                                      const isSelected = opt?.optionId === selected
                                      const isCorrectOpt = opt?.optionId === correct
                                      return (
                                        <View
                                          key={opt?.optionId || opt?.keyOption}
                                          style={[
                                            styles.optionRow,
                                            isSelected && styles.optionSelected,
                                            isCorrectOpt && styles.optionCorrect,
                                          ]}
                                        >
                                          <Text style={styles.optionKey}>{String(opt?.keyOption)}.</Text>
                                          <Text style={styles.optionText}>{String(opt?.content || '')}</Text>
                                        </View>
                                      )
                                    })}
                                  </View>
                                )}

                                {isWritingQuestion && (
                                  <View style={styles.writingBox}>
                                    <View style={styles.writingMetaRow}>
                                      <Text style={styles.writingMetaText}>
                                        Số từ:{' '}
                                        {q?.wordCount ??
                                          (q?.answerContent
                                            ? String(q.answerContent)
                                                .trim()
                                                .split(/\s+/)
                                                .filter(Boolean).length
                                            : 0)}
                                      </Text>
                                      {!!q?.gradedAt && (
                                        <Text style={styles.writingMetaText}>
                                          Chấm lúc: {formatDateTimeUTC7(q.gradedAt)}
                                        </Text>
                                      )}
                                    </View>

                                    <Text style={styles.writingAnswerLabel}>Bài làm:</Text>
                                    <View style={styles.writingAnswerBox}>
                                      <Text style={styles.writingAnswerText}>
                                        {q?.answerContent ? String(q.answerContent) : '(Không có nội dung)'}
                                      </Text>
                                    </View>

                                    {!!q?.aiAnalysis?.results?.length && (
                                      <View style={styles.aiBox}>
                                        <Text style={styles.aiTitle}>
                                          Phân tích AI (Tổng: {q?.aiAnalysis?.totalScore ?? 0})
                                        </Text>
                                        <View style={styles.aiList}>
                                          {q.aiAnalysis.results.map((r, idx) => (
                                            <View key={`${r?.blank_id || idx}`} style={styles.aiItem}>
                                              <Text style={styles.aiItemTitle}>
                                                {String(r?.blank_id || `Mục ${idx + 1}`)} • Điểm: {r?.score ?? 0} •{' '}
                                                {String(r?.evaluation || '')}
                                              </Text>
                                              {!!r?.feedback && <Text style={styles.aiFeedback}>{String(r.feedback)}</Text>}
                                              {Array.isArray(r?.suggestions) && r.suggestions.length > 0 && (
                                                <View style={styles.aiSuggestions}>
                                                  {r.suggestions.map((s, sIdx) => (
                                                    <Text key={`${sIdx}`} style={styles.aiSuggestionText}>
                                                      - {String(s)}
                                                    </Text>
                                                  ))}
                                                </View>
                                              )}
                                            </View>
                                          ))}
                                        </View>
                                      </View>
                                    )}
                                  </View>
                                )}
                              </View>
                            )
                          })}
                        </View>
                      </View>
                    )
                  })}
                </View>
              )}
            </>
          )}
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
    maxWidth: 820,
    backgroundColor: '#FDF7EC',
    borderRadius: 24,
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#5F5F5F',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#C62828',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#5F5F5F',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  summaryText: {
    fontSize: 14,
    color: '#1C1C1C',
    fontWeight: '800',
    fontFamily: 'Epilogue, sans-serif',
  },
  groupList: {
    gap: 14,
  },
  groupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFE0B3',
    ...(Platform.OS === 'web' && { boxShadow: '0px 8px 22px rgba(0,0,0,0.08)' }),
  },
  groupMediaBox: {
    marginBottom: 12,
  },
  groupPassageBox: {
    backgroundColor: '#FFF3E6',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F5D6BE',
    marginBottom: 12,
  },
  groupPassageText: {
    fontSize: 14,
    color: '#1C1C1C',
    lineHeight: 20,
    fontFamily: 'Epilogue, sans-serif',
  },
  questionList: {
    gap: 12,
  },
  questionCard: {
    backgroundColor: '#FDF7EC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  questionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  questionNo: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
  },
  questionResult: {
    fontSize: 13,
    fontWeight: '800',
    fontFamily: 'Epilogue, sans-serif',
  },
  questionResultOk: {
    color: '#2E7D32',
  },
  questionResultBad: {
    color: '#C62828',
  },
  writingScoreChip: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
    backgroundColor: '#FFF2CC',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  questionContent: {
    fontSize: 14,
    color: '#1C1C1C',
    lineHeight: 20,
    fontFamily: 'Epilogue, sans-serif',
    marginBottom: 10,
  },
  optionsList: {
    gap: 8,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    backgroundColor: '#FFFFFF',
  },
  optionSelected: {
    borderColor: '#E8B4B8',
    backgroundColor: '#FFF6F7',
  },
  optionCorrect: {
    borderColor: '#2E7D32',
    backgroundColor: '#F1FBF3',
  },
  optionKey: {
    width: 22,
    fontSize: 14,
    fontWeight: '800',
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    color: '#1C1C1C',
    lineHeight: 20,
    fontFamily: 'Epilogue, sans-serif',
  },
  writingBox: {
    marginTop: 10,
    gap: 10,
  },
  writingMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
  },
  writingMetaText: {
    fontSize: 13,
    color: '#5F5F5F',
    fontFamily: 'Epilogue, sans-serif',
  },
  writingAnswerLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
  },
  writingAnswerBox: {
    backgroundColor: '#FFF8F0',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  writingAnswerText: {
    fontSize: 14,
    color: '#1C1C1C',
    lineHeight: 20,
    fontFamily: 'Epilogue, sans-serif',
  },
  aiBox: {
    backgroundColor: '#F7FAFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(25, 118, 210, 0.18)',
  },
  aiTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
    marginBottom: 10,
  },
  aiList: {
    gap: 10,
  },
  aiItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  aiItemTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
    marginBottom: 6,
  },
  aiFeedback: {
    fontSize: 13,
    color: '#1C1C1C',
    lineHeight: 18,
    fontFamily: 'Epilogue, sans-serif',
  },
  aiSuggestions: {
    marginTop: 8,
    gap: 4,
  },
  aiSuggestionText: {
    fontSize: 13,
    color: '#1C1C1C',
    lineHeight: 18,
    fontFamily: 'Epilogue, sans-serif',
  },
})

