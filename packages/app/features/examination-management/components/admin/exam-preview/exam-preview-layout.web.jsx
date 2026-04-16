import { useState, useEffect, useRef } from 'react'
import { StyleSheet, View, Image, Text, Alert, Platform, Modal, Pressable } from 'react-native'
import { useRouter } from 'solito/navigation'

// Import components from the roadmap feature
import { RoadmapTestQuestion } from '../../../../roadmap/components/roadmap-test/roadmap-test-question'
import { RoadmapTestDashboard } from '../../../../roadmap/components/roadmap-test/roadmap-test-dashboard'
import { RoadmapTestButton } from '../../../../roadmap/components/roadmap-test/roadmap-test-button'
import { ToastNotification } from '../../../../roadmap/components/roadmap-test/toast-notification'
import { ArrowLeftOutlined, ArrowRightOutlined, CloseOutlined } from '@ant-design/icons'
import CarrotImage from '../../../../../../assets/carrot.png'

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')} : ${secs.toString().padStart(2, '0')}`
}

/**
 * Map admin exam data to sections exactly as the student view expects
 */
const mapAdminExamToSections = (examData) => {
  if (!examData || !examData.templateParts) return []

  const { templateParts, skillDurations = {} } = examData
  let globalQuestionCounter = 1

  const SKILL_MAP = {
    listening: 1,
    reading: 2,
    writing: 3,
    writting: 3
  }

  const getSkillValue = (part) => {
    if (typeof part.skill === 'number') return part.skill
    if (typeof part.Skill === 'number') return part.Skill
    const skillName = (part.skill || part.Skill || '').toLowerCase()
    return SKILL_MAP[skillName] || null
  }

  const buildSection = (key, label, skillValues, defaultType, durationFallbackKey) => {
    // Collect all parts belonging to this skill
    const parts = templateParts.filter((p) => skillValues.includes(getSkillValue(p)))
    if (parts.length === 0) return null
    const questions = []

    // Prefer explicit per-part skillDuration, then aggregate, then exam-level skillDurations map
    let sectionDuration = 0
    parts.forEach((p) => {
      // Parts from API use `skillDuration` (minutes), not `duration`
      sectionDuration = Math.max(sectionDuration, p.skillDuration || p.duration || 0)
    })
    // Fallback to exam-level skillDurations map (e.g. { listening: 60, reading: 60, writing: 60 })
    if (!sectionDuration && durationFallbackKey) {
      sectionDuration = skillDurations[durationFallbackKey] || 0
    }

    parts.forEach((p) => {
      // Group questions by passage similar to how RoadmapTestLayout handles groups
      const qList = p.questions || []

      qList.forEach((q) => {
        const type = defaultType
        const options = (q.options || []).map((opt) => ({
          content: opt.content || '',
          imageUrl: opt.imageUrl || null,
          isCorrect: opt.isCorrect || false,
        }))

        // Formatting questionText
        const questionText = q.content || (type === 'writing' ? p.templatePartsTitle || q.passageContent || '' : '')
        const correctAnswer = (q.options || []).findIndex(opt => opt.isCorrect === true || opt.IsCorrect === true) + 1

        questions.push({
          id: q.questionId || q.questionNo,
          questionNumber: q.questionNo || globalQuestionCounter++,
          type,
          questionText,
          audioUrl: q.mediaType === 'Audio' ? q.mediaUrl : (q.passageAudioUrl || null),
          imageUrl: q.mediaType === 'Image' ? q.mediaUrl : (q.passageImageUrl || null),
          options,
          correctAnswer: correctAnswer > 0 ? correctAnswer : null,
          questionTypeCode: q.questionTypeCode || null,
          partTitle: p.templatePartsTitle || '',
          partDescription: p.description || '',
          rawQuestion: q,
          passageContent: q.passageContent,
          passageImageUrl: q.passageImageUrl,
          passageAudioUrl: q.passageAudioUrl,
        })
      })
    })

    if (questions.length === 0) return null

    return {
      key,
      label,
      title: parts[0]?.templatePartsTitle || label,
      description: parts[0]?.description || '',
      duration: sectionDuration, // in minutes
      questions,
    }
  }

  // Student view order: Listening (1), Writing (3), Reading (2)
  const sections = [
    buildSection('listening', 'Nghe', [1], 'audio', 'listening'),
    buildSection('writing', 'Viết', [3], 'writing', 'writing'),
    buildSection('reading', 'Đọc', [2], 'text', 'reading'),
  ].filter(Boolean)

  return sections
}

export function ExamPreviewLayout({ examData }) {
  const router = useRouter()
  const [sections, setSections] = useState([])
  const [activeSectionKey, setActiveSectionKey] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(1)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [examTitle, setExamTitle] = useState(examData?.title || '')
  const [answers, setAnswers] = useState({}) // Structure: { [sectionKey]: { [questionNum]: answer } }
  const [timeRemaining, setTimeRemaining] = useState('00 : 00')
  const [toastVisible, setToastVisible] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState('success')

  const canvasAreaRef = useRef(null)

  useEffect(() => {
    if (examData) {
      const mappedSections = mapAdminExamToSections(examData)
      setSections(mappedSections)
      if (mappedSections.length > 0) {
        const firstSection = mappedSections[0]
        setActiveSectionKey(firstSection.key)
        const firstQuestion = firstSection.questions?.[0]
        setCurrentQuestion(firstQuestion?.questionNumber || 1)
        setCurrentQuestionIndex(0)
      }

      const firstSectionDuration = mappedSections[0]?.duration || examData.duration || 0
      setTimeRemaining(formatTime(firstSectionDuration * 60))
      setExamTitle(examData.title || '')
    }
  }, [examData])

  const handleAnswerSelect = (questionNum, answerIndex) => {
    if (!activeSectionKey) return
    setAnswers((prev) => ({
      ...prev,
      [activeSectionKey]: {
        ...(prev[activeSectionKey] || {}),
        [questionNum]: answerIndex,
      },
    }))
  }

  const handleQuestionSelect = (questionNum) => {
    // Search across all sections to find which one contains the question
    let foundSectionKey = null
    let foundQuestionIndex = -1

    for (const section of sections) {
      const qIdx = section.questions.findIndex((q) => q.questionNumber === questionNum)
      if (qIdx >= 0) {
        foundSectionKey = section.key
        foundQuestionIndex = qIdx
        break
      }
    }

    if (foundSectionKey && foundQuestionIndex >= 0) {
      // If the question is in a different section, switch to it first
      if (foundSectionKey !== activeSectionKey) {
        setActiveSectionKey(foundSectionKey)
      }

      setCurrentQuestionIndex(foundQuestionIndex)
      setCurrentQuestion(questionNum)

      // Use a small delay to allow React to render the new section if it was switched
      setTimeout(() => {
        if (Platform.OS === 'web') {
          const targetElement = document.getElementById(`question-${questionNum}`)

          if (targetElement) {
            // Using scrollIntoView is more reliable across browsers
            targetElement.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
              inline: 'nearest'
            })
          }
        }
      }, foundSectionKey !== activeSectionKey ? 150 : 50)
    }
  }

  const handleChangeSection = (sectionKey) => {
    const nextSection = sections.find((s) => s.key === sectionKey)
    if (nextSection) {
      setActiveSectionKey(sectionKey)
      setCurrentQuestionIndex(0)
      setCurrentQuestion(nextSection.questions?.[0]?.questionNumber || 1)
      
      // Update time remaining for the specific section
      const sectionDuration = nextSection.duration * 60 || 0
      setTimeRemaining(formatTime(sectionDuration))
    }
  }

  const handleNextSection = () => {
    const currentIndex = sections.findIndex((s) => s.key === activeSectionKey)
    if (currentIndex < sections.length - 1) {
      handleChangeSection(sections[currentIndex + 1].key)
    } else {
      setToastMessage('Đây là phần thi cuối cùng.')
      setToastType('info')
      setToastVisible(true)
    }
  }

  const handleBackToAdmin = () => {
    router.back()
  }

  const activeSection = sections.find((s) => s.key === activeSectionKey)
  const isLastSection = sections.findIndex((s) => s.key === activeSectionKey) === sections.length - 1

  if (!examData) return null

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable onPress={handleBackToAdmin} style={styles.backButton}>
            <CloseOutlined style={{ color: '#111827', fontSize: 18 }} />
          </Pressable>
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {examTitle || 'Đang xem trước đề thi'}
            </Text>
            <View style={styles.previewBadge}>
              <Text style={styles.previewBadgeText}>CHẾ ĐỘ XEM TRƯỚC (ADMIN)</Text>
            </View>
          </View>
        </View>

        <View style={styles.headerRight}>
          <View style={styles.timeContainer}>
            <Text style={styles.timeLabel}>Thời gian tham khảo:</Text>
            <Text style={styles.timeValue}>{timeRemaining}</Text>
          </View>
          <Pressable
            style={styles.submitButton}
            onPress={() => {
              setToastMessage('Bạn đang ở chế độ admin xem trước.')
              setToastType('info')
              setToastVisible(true)
            }}
          >
            <Text style={styles.submitButtonText}>Kết thúc</Text>
          </Pressable>
        </View>
      </View>

      {/* Main Layout Area */}
      <View style={styles.mainContent}>
        {/* Left Side: Question Content */}
        <View ref={canvasAreaRef} style={styles.canvasArea}>


          {/* List questions in the current active section */}
          <View style={styles.questionsList}>
            {activeSection?.questions?.map((q, idx) => {
              const prevQ = activeSection.questions[idx - 1]
              const showPassage = q.passageContent &&
                (!prevQ || prevQ.passageContent !== q.passageContent ||
                  prevQ.passageImageUrl !== q.passageImageUrl ||
                  prevQ.passageAudioUrl !== q.passageAudioUrl)

              return (
                <View key={q.id || idx} id={`question-${q.questionNumber}`} style={styles.questionWrapper}>
                  {/* Instruction / Group Title if changed from previous */}
                  {(!prevQ || prevQ.partTitle !== q.partTitle) && q.partTitle && (
                    <View style={styles.instructionBox}>
                      <Text style={styles.instructionTitle}>{q.partTitle}</Text>
                      {q.partTitleDescription && <Text style={styles.instructionSubtitle}>{q.partTitleDescription}</Text>}
                    </View>
                  )}

                  {showPassage && (
                    <View style={styles.passageContainer}>
                      <View style={styles.passageHeader}>
                        <Image source={CarrotImage} style={styles.passageIcon} />
                        <Text style={styles.passageLabel}>Đọc đoạn văn sau và trả lời câu hỏi</Text>
                      </View>
                      <View style={styles.passageContent}>
                        {(q.passageImageUrl || q.passageAudioUrl) && (
                          <View style={styles.passageMedia}>
                            {q.passageImageUrl && <img src={q.passageImageUrl} style={{ maxWidth: '100%', borderRadius: 8 }} />}
                            {q.passageAudioUrl && <audio controls src={q.passageAudioUrl} style={{ width: '100%', marginTop: 8 }} />}
                          </View>
                        )}
                        <Text style={styles.passageText}>{q.passageContent}</Text>
                      </View>
                    </View>
                  )}

                  <RoadmapTestQuestion
                    questionNumber={q.questionNumber}
                    type={q.type}
                    questionText={q.questionText}
                    audioUrl={q.audioUrl}
                    imageUrl={q.imageUrl}
                    options={q.options}
                    questionTypeCode={q.questionTypeCode}
                    selectedAnswer={answers[activeSectionKey]?.[q.questionNumber]}
                    onAnswerSelect={(ans) => handleAnswerSelect(q.questionNumber, ans)}
                    onAnswerChange={(ans) => handleAnswerSelect(q.questionNumber, ans)}
                    showCorrectAnswer={true}
                    correctAnswer={q.correctAnswer}
                  />
                </View>
              )
            })}
          </View>
        </View>

        {/* Right Side: Sidebar Dashboard */}
        <View style={styles.sidebarArea}>
          {/* Section Tabs matching RoadmapTestLayout.web.jsx */}
          <View style={styles.sectionTabsRow}>
            {sections.map((section, index) => {
              const isActive = activeSectionKey === section.key
              return (
                <Pressable
                  key={section.key}
                  onPress={() => handleChangeSection(section.key)}
                  style={[
                    styles.sectionTab,
                    isActive && styles.sectionTabActive
                  ]}
                >
                  <Text style={[styles.sectionTabText, isActive && styles.sectionTabTextActive]}>
                    {section.label}
                  </Text>
                </Pressable>
              )
            })}
          </View>

          <RoadmapTestDashboard
            totalQuestions={activeSection?.questions?.length || 0}
            questionNumbers={activeSection?.questions?.map(q => q.questionNumber) || []}
            answers={answers[activeSectionKey] || {}}
            onQuestionSelect={handleQuestionSelect}
            onSubmit={handleNextSection}
            isSubmitting={false}
            isLastSection={isLastSection}
            currentQuestion={currentQuestion}
          />
        </View>
      </View>

      <ToastNotification
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={() => setToastVisible(false)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    height: 80,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    padding: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    marginRight: 16,
  },
  titleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
    fontFamily: 'Epilogue, sans-serif',
    letterSpacing: -0.5,
  },
  previewBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  previewBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D97706',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  timeContainer: {
    alignItems: 'flex-end',
  },
  timeLabel: {
    fontSize: 11,
    color: '#6B7280',
    textTransform: 'uppercase',
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  timeValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111827',
    fontFamily: 'monospace',
  },
  submitButton: {
    backgroundColor: '#111827',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
    padding: 24,
    gap: 24,
    overflow: 'hidden',
    ...(Platform.OS === 'web' && {
      minHeight: 0, // Critical for scrollable children in flexbox
    }),
  },
  canvasArea: {
    flex: 1.8, // Slightly wider for question area
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      overflowY: 'auto',
      height: '100%',
    }),
  },
  sectionHeader: {
    marginBottom: 32,
  },
  sectionIndicator: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  sectionIndicatorText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#4F46E5',
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#111827',
    fontFamily: 'Epilogue, sans-serif',
    letterSpacing: -1,
    marginBottom: 12,
  },
  sectionDescription: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    fontWeight: '500',
  },
  questionsList: {
    gap: 40,
  },
  questionWrapper: {
    gap: 20,
    ...(Platform.OS === 'web' && {
      scrollMarginTop: 20,
    }),
  },
  instructionBox: {
    backgroundColor: '#F8F9FF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8EFFF',
    marginBottom: 8,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2A2A2A',
    fontFamily: 'Epilogue, sans-serif',
  },
  instructionSubtitle: {
    marginTop: 6,
    fontSize: 14,
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
    fontWeight: '500',
  },
  passageContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  passageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  passageIcon: {
    width: 24,
    height: 24,
  },
  passageLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  passageContent: {
    gap: 12,
  },
  passageText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 26,
    fontWeight: '500',
  },
  passageMedia: {
    marginBottom: 12,
  },
  sidebarArea: {
    flex: 1,
    maxWidth: 420,
    gap: 16,
    ...(Platform.OS === 'web' && {
      overflowY: 'auto',
      height: '100%',
      paddingRight: 4, // Add some padding for scrollbar
    }),
  },
  sectionTabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  sectionTab: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  sectionTabActive: {
    backgroundColor: '#FFFBEB',
    borderColor: '#F1BE4B',
  },
  sectionTabText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#6B7280',
  },
  sectionTabTextActive: {
    color: '#F1BE4B',
  },
})
