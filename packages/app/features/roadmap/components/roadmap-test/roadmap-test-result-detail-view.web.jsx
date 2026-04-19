import { useEffect, useMemo, useState } from 'react'
import { StyleSheet, View, Text, ScrollView, Platform, TouchableOpacity, Pressable } from 'react-native'
import { CloseOutlined } from '@ant-design/icons'

const getSectionLabel = (section) =>
  section === 'listening' ? 'Nghe' : section === 'reading' ? 'Đọc' : section === 'writing' ? 'Viết' : ''

const formatDateTimeUTC7 = (dateString) => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return String(dateString)
    const utc7Timestamp = date.getTime() + (7 * 60 * 60 * 1000)
    const utc7Date = new Date(utc7Timestamp)
    const day = String(utc7Date.getUTCDate()).padStart(2, '0')
    const month = String(utc7Date.getUTCMonth() + 1).padStart(2, '0')
    const year = utc7Date.getUTCFullYear()
    const hours = String(utc7Date.getUTCHours()).padStart(2, '0')
    const minutes = String(utc7Date.getUTCMinutes()).padStart(2, '0')
    return `${day}/${month}/${year} ${hours}:${minutes}`
  } catch (err) {
    return String(dateString)
  }
}

export function RoadmapTestResultDetailView({ section, detailData, isLoading, error, onClose }) {
  const sectionLabel = getSectionLabel(section)
  const questionGroups = detailData?.questionGroups || []
  const isWritingDetail = questionGroups?.some((g) =>
    (g?.questions || []).some((q) => typeof q?.answerContent === 'string' || q?.aiAnalysis)
  )

  const allQuestions = useMemo(() => {
    const list = []
    questionGroups.forEach((group, groupIdx) => {
      ; (group?.questions || []).forEach((q) => {
        list.push({ ...q, groupIdx, group })
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
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Chi tiết phần {sectionLabel}</Text>
        {onClose && (
          <Pressable onPress={onClose} style={styles.closeButton}>
            <CloseOutlined style={styles.closeIcon} />
          </Pressable>
        )}
      </View>

      {isLoading ? <Text style={styles.loadingText}>Đang tải chi tiết...</Text> : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {!isLoading && !error && !detailData ? (
        <Text style={styles.emptyText}>Chưa có dữ liệu chi tiết.</Text>
      ) : null}

      {!isLoading && !error && !!detailData && (
        <View style={styles.viewContent}>
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
                          isCorrect && styles.questionChipCorrect,
                          !isCorrect && q?.isCorrect === false && styles.questionChipIncorrect,
                          isActive && styles.questionChipActive,
                        ]}
                        onPress={() => setSelectedQuestionNo(q?.questionNo)}
                      >
                        <Text
                          style={[
                            styles.questionChipText,
                            isCorrect && styles.questionChipTextCorrect,
                            !isCorrect && q?.isCorrect === false && styles.questionChipTextIncorrect,
                            isActive && styles.questionChipTextActive,
                          ]}
                        >
                          {q?.questionNo}
                        </Text>
                      </TouchableOpacity>
                    )
                  })}
                </View>
              </View>

              <ScrollView style={styles.questionDetailScroll} contentContainerStyle={styles.questionDetailContent}>
                {!selectedQuestion ? (
                  <Text style={styles.emptyText}>Chưa chọn câu.</Text>
                ) : (
                  <>
                    {(() => {
                      const q = selectedQuestion
                      if (!q) return null

                      const group = q.group || null
                      const sharedMediaType = (group?.sharedMediaType || '').toLowerCase()
                      const sharedMediaUrl = group?.sharedMediaUrl || null
                      const sharedPassageContent = group?.sharedPassageContent || null
                      const isWritingQuestion = typeof q?.answerContent === 'string' || !!q?.aiAnalysis
                      const hasOptions = Array.isArray(q?.options) && q.options.length > 0
                      const selected = q?.selectedOptionId
                      const correct = q?.correctOptionId
                      const isCorrect = !!q?.isCorrect

                      return (
                        <View style={styles.questionCard}>
                          {/* Question Header at the very top */}
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

                          {/* Shared Group Content (Passage, Media) */}
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
                              <img src={sharedMediaUrl} alt="Media" style={styles.groupMediaImage} />
                            </View>
                          ) : null}

                          {/* Question Specific Content */}
                          {!!q?.content && <Text style={styles.questionContent}>{String(q.content)}</Text>}

                          {/* Options */}
                          {hasOptions && (
                            <View style={styles.optionsList}>
                              {[...(q?.options || [])]
                                .sort((a, b) => (parseInt(a?.keyOption) || 0) - (parseInt(b?.keyOption) || 0))
                                .map((opt) => {
                                  const isSelected = opt?.optionId === selected
                                  const isCorrectOpt = opt?.optionId === correct
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
                                        {opt?.content ? <Text style={styles.optionText}>{String(opt?.content)}</Text> : null}
                                        {Platform.OS === 'web' && opt?.imageUrl ? (
                                          <img src={opt?.imageUrl} alt="Option" style={styles.optionImage} />
                                        ) : null}
                                      </View>
                                    </View>
                                  )
                                })}
                            </View>
                          )}

                          {/* Writing Analysis and AI Feedback */}
                          {isWritingQuestion && (
                            <View style={styles.writingBox}>
                              <View style={styles.writingMetaRow}>
                                <Text style={styles.writingMetaText}>Số từ: {q?.wordCount ?? 0}</Text>
                                {!!q?.gradedAt && (
                                  <Text style={styles.writingMetaText}>Chấm lúc: {formatDateTimeUTC7(q.gradedAt)}</Text>
                                )}
                              </View>
                              <Text style={styles.writingAnswerLabel}>Bài làm:</Text>
                              <View style={styles.writingAnswerBox}>
                                <Text style={styles.writingAnswerText}>
                                  {Array.isArray(q?.aiAnalysis?.results)
                                    ? q.aiAnalysis.results
                                        .map((r) => `${r.blank_id}: ${r.user_answer || '(Trống)'}`)
                                        .join('\n')
                                    : q?.answerContent || '(Trống)'}
                                </Text>
                              </View>

                              {q?.aiAnalysis && (
                                <View style={styles.aiBox}>
                                  <Text style={styles.aiTitle}>Phân tích AI ({q?.aiAnalysis?.totalScore ?? 0}đ)</Text>
                                  
                                  {Array.isArray(q?.aiAnalysis?.results) ? (
                                    q.aiAnalysis.results.map((res, idx) => (
                                      <View key={idx} style={[styles.aiSection, idx > 0 && { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F0E6D2' }]}>
                                        <View style={styles.blankHeader}>
                                          <Text style={styles.blankTitle}>Ô {res.blank_id}:</Text>
                                          <Text style={[
                                            styles.evaluationBadge, 
                                            res.evaluation === 'correct' ? styles.evalCorrect : 
                                            res.evaluation === 'partial' ? styles.evalPartial : styles.evalIncorrect
                                          ]}>
                                            {res.evaluation === 'correct' ? 'Đúng' : res.evaluation === 'partial' ? 'Một phần' : 'Sai'}
                                          </Text>
                                        </View>
                                        <Text style={styles.aiFeedback}><Text style={{ fontWeight: '700' }}>Câu trả lời: </Text>{res.user_answer || '(Trống)'}</Text>
                                        <Text style={styles.aiFeedback}><Text style={{ fontWeight: '700' }}>Nhận xét: </Text>{res.feedback}</Text>
                                        {res.suggestions?.length > 0 && (
                                          <Text style={styles.aiFeedback}><Text style={{ fontWeight: '700' }}>Gợi ý: </Text>{res.suggestions.join(', ')}</Text>
                                        )}
                                      </View>
                                    ))
                                  ) : (
                                    <>
                                      {q.aiAnalysis.overallFeedback && (
                                        <View style={styles.aiSection}>
                                          <Text style={styles.aiSectionTitle}>Nhận xét tổng quát</Text>
                                          <Text style={styles.aiFeedback}>{q.aiAnalysis.overallFeedback}</Text>
                                        </View>
                                      )}
                                      {q.aiAnalysis.contentFeedback && (
                                        <View style={styles.aiSection}>
                                          <Text style={styles.aiSectionTitle}>Nội dung ({q.aiAnalysis.contentScore ?? 0}đ)</Text>
                                          <Text style={styles.aiFeedback}>{q.aiAnalysis.contentFeedback}</Text>
                                        </View>
                                      )}
                                      {q.aiAnalysis.organizationFeedback && (
                                        <View style={styles.aiSection}>
                                          <Text style={styles.aiSectionTitle}>Bố cục ({q.aiAnalysis.organizationScore ?? 0}đ)</Text>
                                          <Text style={styles.aiFeedback}>{q.aiAnalysis.organizationFeedback}</Text>
                                        </View>
                                      )}
                                      {q.aiAnalysis.languageFeedback && (
                                        <View style={styles.aiSection}>
                                          <Text style={styles.aiSectionTitle}>Ngôn ngữ ({q.aiAnalysis.languageScore ?? 0}đ)</Text>
                                          <Text style={styles.aiFeedback}>{q.aiAnalysis.languageFeedback}</Text>
                                        </View>
                                      )}
                                      {q.aiAnalysis.polishedVersion && (
                                        <View style={styles.aiSection}>
                                          <Text style={styles.aiSectionTitle}>Bản sửa tham khảo</Text>
                                          <View style={styles.polishedBox}>
                                            <Text style={styles.polishedText}>{q.aiAnalysis.polishedVersion}</Text>
                                          </View>
                                        </View>
                                      )}
                                    </>
                                  )}
                                </View>
                              )}
                            </View>
                          )}

                          {/* Explanation Box */}
                          {!!q?.explanation && (
                            <View style={styles.explanationBox}>
                              <Text style={styles.explanationTitle}>Giải thích:</Text>
                              {Platform.OS === 'web' ? (
                                <div
                                  style={{
                                    fontSize: '14px',
                                    lineHeight: '1.6',
                                    color: '#4B5563',
                                    fontFamily: 'Inter, sans-serif'
                                  }}
                                  dangerouslySetInnerHTML={{ __html: String(q.explanation) }}
                                />
                              ) : (
                                <Text style={styles.explanationText}>
                                  {String(q.explanation)
                                    .replace(/<br\s*\/?>/gi, '\n')
                                    .replace(/<\/?[^>]+(>|$)/g, '')}
                                </Text>
                              )}
                            </View>
                          )}
                        </View>
                      )
                    })()}
                  </>
                )}
              </ScrollView>
            </View>
          )}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  closeIcon: {
    fontSize: 18,
    color: '#666',
  },
  viewContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 20,
    padding: 20,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  detailLayout: {
    flex: 1,
    flexDirection: 'row',
    minHeight: 0,
  },
  questionPickerCard: {
    width: 200,
    padding: 20,
    borderRightWidth: 1,
    borderRightColor: '#F0F0F0',
    backgroundColor: '#FCFDFF',
  },
  questionPickerTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#999',
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  questionPickerList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  questionChip: {
    width: 36,
    height: 36,
    borderRadius: 8,
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
    fontSize: 13,
    fontWeight: '800',
    color: '#4B5563',
  },
  questionChipTextActive: {
    color: '#FFFFFF',
  },
  questionChipTextCorrect: {
    color: '#10B981',
  },
  questionChipTextIncorrect: {
    color: '#EF4444',
  },
  questionDetailScroll: {
    flex: 1,
  },
  questionDetailContent: {
    padding: 24,
    gap: 24,
  },
  emptyText: {
    padding: 40,
    textAlign: 'center',
    color: '#999',
  },
  loadingText: {
    padding: 40,
    textAlign: 'center',
    color: '#F1BE4B',
    fontWeight: '700',
  },
  errorText: {
    padding: 40,
    textAlign: 'center',
    color: '#EF4444',
  },
  groupPassageBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  groupPassageText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#333',
  },
  groupMediaBox: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  groupMediaImage: {
    maxWidth: '100%',
    maxHeight: 200,
    objectFit: 'contain',
  },
  questionCard: {
    gap: 16,
  },
  questionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  questionNo: {
    fontSize: 18,
    fontWeight: '800',
  },
  questionResult: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: '700',
  },
  questionResultOk: { backgroundColor: '#F0FDF4', color: '#10B981' },
  questionResultBad: { backgroundColor: '#FEF2F2', color: '#EF4444' },
  writingScoreChip: {
    backgroundColor: '#FFFBE6',
    color: '#F1BE4B',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: '800',
  },
  questionContent: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },
  optionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionRow: {
    width: '100%',
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    backgroundColor: '#FCFDFF',
    gap: 12,
  },
  optionRowHalf: {
    width: 'calc(50% - 6px)',
    minWidth: 260,
  },
  optionSelected: { borderColor: '#EF4444', backgroundColor: '#FEF2F2' },
  optionCorrect: { borderColor: '#10B981', backgroundColor: '#F0FDF4' },
  optionKey: { fontSize: 14, fontWeight: '800', color: '#999' },
  optionContentBox: { flex: 1 },
  optionText: { fontSize: 14, fontWeight: '500' },
  optionImage: { maxWidth: '100%', maxHeight: 150, objectFit: 'contain', marginTop: 8 },
  writingBox: { gap: 16 },
  writingMetaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  writingMetaText: { fontSize: 12, color: '#999' },
  writingAnswerLabel: { fontSize: 13, fontWeight: '800', color: '#F1BE4B' },
  writingAnswerBox: { padding: 16, backgroundColor: '#FAF9F6', borderRadius: 12, borderWidth: 1, borderColor: '#F0EBE0' },
  writingAnswerText: { fontSize: 14, lineHeight: 22 },
  aiBox: { padding: 20, backgroundColor: '#FFFBE6', borderRadius: 16, gap: 12 },
  aiTitle: { fontSize: 16, fontWeight: '800' },
  aiSection: { gap: 4 },
  aiSectionTitle: { fontSize: 12, fontWeight: '800', color: '#F1BE4B' },
  aiFeedback: { fontSize: 14, color: '#666', lineHeight: 20 },
  blankHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  blankTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#333',
  },
  evaluationBadge: {
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    textTransform: 'uppercase',
  },
  evalCorrect: {
    backgroundColor: '#D1FAE5',
    color: '#059669',
  },
  evalPartial: {
    backgroundColor: '#FEF3C7',
    color: '#D97706',
  },
  evalIncorrect: {
    backgroundColor: '#FEE2E2',
    color: '#DC2626',
  },
  polishedBox: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  polishedText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#166534',
    fontStyle: 'italic',
  },
  explanationBox: {
    marginTop: 24,
    padding: 24,
    backgroundColor: '#FEFCE8',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#F1BE4B',
    gap: 12,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 10px 30px rgba(241, 190, 75, 0.08)',
    }),
  },
  explanationTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#B45309',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  explanationText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#374151',
    fontWeight: '500',
  },
})
