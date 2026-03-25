import { useEffect, useMemo, useState } from 'react'
import { StyleSheet, View, Text, ScrollView, Platform, TouchableOpacity } from 'react-native'
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

  const allQuestions = useMemo(() => {
    const list = []
    questionGroups.forEach((group, groupIdx) => {
      ; (group?.questions || []).forEach((q) => {
        list.push({
          ...q,
          groupIdx,
          group,
        })
      })
    })
    return list.sort((a, b) => (a?.questionNo ?? 0) - (b?.questionNo ?? 0))
  }, [questionGroups])

  const [selectedQuestionNo, setSelectedQuestionNo] = useState(null)

  useEffect(() => {
    if (allQuestions.length > 0) {
      setSelectedQuestionNo((prev) => (prev != null ? prev : allQuestions[0]?.questionNo))
    }
  }, [allQuestions])

  const selectedQuestion = useMemo(() => {
    if (selectedQuestionNo == null) return null
    return allQuestions.find((q) => q?.questionNo === selectedQuestionNo) || null
  }, [allQuestions, selectedQuestionNo])

  return (
    <View style={styles.wrapper}>
      <Navbar />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.headerSection}>
            <Text style={styles.title}>Chi tiết phần {sectionLabel}</Text>
          </View>

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
                <View style={styles.detailLayout}>
                  <View style={styles.questionPickerCard}>
                    <Text style={styles.questionPickerTitle}>Chọn câu</Text>
                    <View style={styles.questionPickerList}>
                      {allQuestions.map((q) => {
                        const isCorrect = !!q?.isCorrect
                        const isActive = q?.questionNo === selectedQuestionNo
                        return (
                          <TouchableOpacity
                            key={`${q?.questionNo}`}
                            style={[
                              styles.questionChip,
                              isActive && styles.questionChipActive,
                              isCorrect && styles.questionChipCorrect,
                              !isCorrect && q?.isCorrect === false && styles.questionChipIncorrect,
                            ]}
                            onPress={() => setSelectedQuestionNo(q?.questionNo)}
                          >
                            <Text style={[styles.questionChipText, isActive && styles.questionChipTextActive]}>
                              {q?.questionNo}
                            </Text>
                          </TouchableOpacity>
                        )
                      })}
                    </View>
                  </View>

                  <View style={styles.questionDetailCard}>
                    {!selectedQuestion ? (
                      <Text style={styles.emptyText}>Chưa chọn câu.</Text>
                    ) : (
                      <>
                        {(() => {
                          const group = selectedQuestion?.group || null
                          const sharedMediaType = (group?.sharedMediaType || '').toLowerCase()
                          const sharedMediaUrl = group?.sharedMediaUrl || null
                          const sharedPassageContent = group?.sharedPassageContent || null

                          return (
                            <>
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
                                    style={{
                                      maxWidth: '100%',
                                      maxHeight: 250,
                                      borderRadius: 16,
                                      objectFit: 'contain'
                                    }}
                                  />
                                </View>
                              ) : null}
                            </>
                          )
                        })()}

                        {(() => {
                          const q = selectedQuestion
                          const isWritingQuestion = typeof q?.answerContent === 'string' || !!q?.aiAnalysis
                          const hasOptions = Array.isArray(q?.options) && q.options.length > 0
                          const selected = q?.selectedOptionId
                          const correct = q?.correctOptionId
                          const isCorrect = !!q?.isCorrect

                          return (
                            <View style={styles.questionCard}>
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
                                  {[...(q?.options || [])]
                                    .sort((a, b) => (parseInt(a?.keyOption) || 0) - (parseInt(b?.keyOption) || 0))
                                    .map((opt) => {
                                      const isSelected = opt?.optionId === selected
                                      const isCorrectOpt = opt?.optionId === correct
                                      const hasText = !!opt?.content
                                      const hasImage = !!opt?.imageUrl
                                      const useHalfWidth = hasImage

                                      return (
                                        <View
                                          key={opt?.optionId || opt?.keyOption}
                                          style={[
                                            styles.optionRow,
                                            useHalfWidth && styles.optionRowHalf,
                                            isSelected && styles.optionSelected,
                                            isCorrectOpt && styles.optionCorrect,
                                          ]}
                                        >
                                          <Text style={styles.optionKey}>{String(opt?.keyOption)}.</Text>
                                          <View style={styles.optionContentBox}>
                                            {hasText ? <Text style={styles.optionText}>{String(opt?.content)}</Text> : null}
                                            {!hasText && !hasImage ? (
                                              <Text style={styles.optionText}>(Không có nội dung)</Text>
                                            ) : null}
                                            {Platform.OS === 'web' && hasImage ? (
                                              <img src={opt?.imageUrl} alt="Option" style={styles.optionImage} />
                                            ) : null}
                                          </View>
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

                                  {(!!q?.aiAnalysis?.results?.length ||
                                    !!q?.aiAnalysis?.overallFeedback ||
                                    !!q?.aiAnalysis?.contentFeedback ||
                                    !!q?.aiAnalysis?.organizationFeedback ||
                                    !!q?.aiAnalysis?.languageFeedback ||
                                    !!q?.aiAnalysis?.polishedVersion ||
                                    (Array.isArray(q?.aiAnalysis?.missingInfo) && q.aiAnalysis.missingInfo.length > 0)) && (
                                      <View style={styles.aiBox}>
                                        <Text style={styles.aiTitle}>
                                          Phân tích AI (Tổng: {q?.aiAnalysis?.totalScore ?? 0})
                                        </Text>

                                        {!!q?.aiAnalysis?.overallFeedback && (
                                          <View style={styles.aiSection}>
                                            <Text style={styles.aiSectionTitle}>Nhận xét tổng quan</Text>
                                            <Text style={styles.aiFeedback}>{String(q.aiAnalysis.overallFeedback)}</Text>
                                          </View>
                                        )}

                                        {!!q?.aiAnalysis?.contentFeedback && (
                                          <View style={styles.aiSection}>
                                            <Text style={styles.aiSectionTitle}>
                                              Nội dung ({q?.aiAnalysis?.contentScore ?? 0} điểm)
                                            </Text>
                                            <Text style={styles.aiFeedback}>{String(q.aiAnalysis.contentFeedback)}</Text>
                                          </View>
                                        )}

                                        {!!q?.aiAnalysis?.organizationFeedback && (
                                          <View style={styles.aiSection}>
                                            <Text style={styles.aiSectionTitle}>
                                              Bố cục ({q?.aiAnalysis?.organizationScore ?? 0} điểm)
                                            </Text>
                                            <Text style={styles.aiFeedback}>{String(q.aiAnalysis.organizationFeedback)}</Text>
                                          </View>
                                        )}

                                        {!!q?.aiAnalysis?.languageFeedback && (
                                          <View style={styles.aiSection}>
                                            <Text style={styles.aiSectionTitle}>
                                              Ngôn ngữ ({q?.aiAnalysis?.languageScore ?? 0} điểm)
                                            </Text>
                                            <Text style={styles.aiFeedback}>{String(q.aiAnalysis.languageFeedback)}</Text>
                                          </View>
                                        )}

                                        {Array.isArray(q?.aiAnalysis?.missingInfo) && q.aiAnalysis.missingInfo.length > 0 && (
                                          <View style={styles.aiSection}>
                                            <Text style={styles.aiSectionTitle}>Thông tin còn thiếu</Text>
                                            <View style={styles.aiSuggestions}>
                                              {q.aiAnalysis.missingInfo.map((item, idx) => (
                                                <Text key={`${idx}`} style={styles.aiSuggestionText}>
                                                  - {String(item)}
                                                </Text>
                                              ))}
                                            </View>
                                          </View>
                                        )}

                                        {!!q?.aiAnalysis?.polishedVersion && (
                                          <View style={styles.aiSection}>
                                            <Text style={styles.aiSectionTitle}>Bài mẫu gợi ý</Text>
                                            <Text style={styles.aiFeedback}>{String(q.aiAnalysis.polishedVersion)}</Text>
                                          </View>
                                        )}

                                        {!!q?.aiAnalysis?.results?.length && (
                                          <View style={styles.aiSection}>
                                            <Text style={styles.aiSectionTitle}>Chi tiết từng ô trống</Text>
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
                              )}
                            </View>
                          )
                        })()}
                      </>
                    )}
                  </View>
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
    backgroundColor: '#FAF9F6',
    minHeight: '100vh',
  },
  scrollContent: {
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
    paddingBottom: 100,
  },
  backButtonContainer: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  content: {
    width: '100%',
    maxWidth: 1400,
    gap: 32,
  },
  headerSection: {
    gap: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
    letterSpacing: -1,
  },
  loadingText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '600',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
    }),
  },
  summaryText: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '900',
    fontFamily: 'Epilogue, sans-serif',
  },
  detailLayout: {
    flexDirection: 'row',
    gap: 24,
    alignItems: 'flex-start',
    ...(Platform.OS === 'web' && {
      flexWrap: 'nowrap',
    }),
    flexWrap: 'wrap',
  },
  questionPickerCard: {
    width: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    gap: 16,
    ...(Platform.OS === 'web' && {
      position: 'sticky',
      top: 40,
      boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
    }),
  },
  questionPickerTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  questionPickerList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  questionChip: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    ...(Platform.OS === 'web' && {
      transition: 'all 0.2s ease',
    }),
  },
  questionChipActive: {
    backgroundColor: '#1A1A1A',
    borderColor: '#1A1A1A',
  },
  questionChipCorrect: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  questionChipIncorrect: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  questionChipText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
  },
  questionChipTextActive: {
    color: '#FFFFFF',
  },
  questionDetailCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    gap: 24,
    minHeight: 600,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
    }),
  },
  groupPassageBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 16,
  },
  groupPassageText: {
    fontSize: 16,
    color: '#1A1A1A',
    lineHeight: 28,
    fontFamily: 'Epilogue, sans-serif',
    fontWeight: '500',
  },
  groupMediaBox: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  questionCard: {
    gap: 20,
  },
  questionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    paddingBottom: 16,
  },
  questionNo: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1A1A1A',
  },
  questionResult: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  questionResultOk: {
    backgroundColor: '#F0FDF4',
    color: '#10B981',
  },
  questionResultBad: {
    backgroundColor: '#FEF2F2',
    color: '#EF4444',
  },
  writingScoreChip: {
    backgroundColor: '#FFFBE6',
    color: '#F1BE4B',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    fontSize: 14,
    fontWeight: '900',
  },
  questionContent: {
    fontSize: 18,
    color: '#1A1A1A',
    lineHeight: 28,
    fontWeight: '600',
  },
  optionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  optionRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
    backgroundColor: '#FCFDFF',
  },
  optionRowHalf: {
    width: 'calc(50% - 6px)',
    minWidth: 280,
  },
  optionSelected: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  optionCorrect: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  optionKey: {
    width: 24,
    fontSize: 16,
    fontWeight: '900',
    color: '#999',
  },
  optionContentBox: {
    flex: 1,
  },
  optionText: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  optionImage: {
    maxWidth: '100%',
    maxHeight: 280,
    borderRadius: 12,
    marginTop: 8,
    ...(Platform.OS === 'web' && {
      objectFit: 'contain',
    }),
  },
  writingBox: {
    gap: 20,
  },
  writingMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  writingMetaText: {
    fontSize: 13,
    color: '#999',
    fontWeight: '600',
  },
  writingAnswerLabel: {
    fontSize: 14,
    fontWeight: '900',
    color: '#F1BE4B',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  writingAnswerBox: {
    backgroundColor: '#FAF9F6',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#F0EBE0',
  },
  writingAnswerText: {
    fontSize: 16,
    color: '#1A1A1A',
    lineHeight: 28,
    fontWeight: '500',
  },
  aiBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: '#F1BE4B',
    gap: 24,
    marginTop: 16,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 20px 50px rgba(241, 190, 75, 0.08)',
    }),
  },
  aiTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  aiSection: {
    gap: 8,
  },
  aiSectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#F1BE4B',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  aiFeedback: {
    fontSize: 16,
    color: '#444',
    lineHeight: 26,
    fontWeight: '500',
  },
  aiItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  aiItemTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  aiSuggestions: {
    marginTop: 8,
    gap: 6,
  },
  aiSuggestionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
})

