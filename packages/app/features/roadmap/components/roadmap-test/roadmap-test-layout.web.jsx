import { useState, useEffect, useRef } from 'react'
import { StyleSheet, View, Image, Text, Alert, Platform, Modal, Pressable } from 'react-native'
import { useRouter } from 'solito/navigation'
import { RoadmapTestQuestion } from './roadmap-test-question'
import { RoadmapTestDashboard } from './roadmap-test-dashboard'
import { RoadmapTestButton } from './roadmap-test-button'
import { ToastNotification } from './toast-notification'
import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons'
import { getTestQuestions, getTestConfig, formatTime } from '../../api/roadmap-test'
import { apiClient } from '../../../../provider/api/client'
import { ENDPOINTS } from '../../../../provider/api/endpoints'
import CarrotImage from '../../../../../assets/carrot.png'

const normalizeImageSource = (src) => {
  if (!src) return null
  if (typeof src === 'number' || src.uri) return src
  if (typeof src === 'object' && src.src) return { uri: src.src }
  if (typeof src === 'string') return { uri: src }
  return src
}

const DEFAULT_EXAM_ID = 'kjyv9q3dac'

// Đảm bảo trong 1 lần load bundle chỉ gọi API take-exam đúng 1 lần
// (kể cả khi React StrictMode mount/unmount component 2 lần)
let startExamOncePromise = null
let startExamCacheKey = null

const isTwoPartWriting = (questionTypeCode) => {
  const code = String(questionTypeCode || '').slice(-3).toUpperCase()
  return code === 'Q51' || code === 'Q52'
}

const parseTwoPartAnswerContent = (answerContent) => {
  const text = String(answerContent || '')
  if (!text) return { b: '', a: '' }

  // Robust parse by marker positions; supports same-line or multi-line and any order
  const idxA = text.indexOf('㉠')
  const idxB = text.indexOf('㉡')

  const cleanValue = (s) => String(s || '').replace(/^:\s*/, '').trim()

  // If both markers exist, split by whichever comes first
  if (idxA >= 0 && idxB >= 0) {
    if (idxA < idxB) {
      const aRaw = text.slice(idxA + 2, idxB)
      const bRaw = text.slice(idxB + 2)
      return { a: cleanValue(aRaw), b: cleanValue(bRaw) }
    } else {
      const bRaw = text.slice(idxB + 2, idxA)
      const aRaw = text.slice(idxA + 2)
      return { a: cleanValue(aRaw), b: cleanValue(bRaw) }
    }
  }

  // If only one marker exists, best-effort: return it and leave the other empty
  if (idxA >= 0) return { a: cleanValue(text.slice(idxA + 2)), b: '' }
  if (idxB >= 0) return { a: '', b: cleanValue(text.slice(idxB + 2)) }

  // No markers: fallback split first newline into 2 parts (assume b then a)
  const [b = '', ...rest] = text.split('\n')
  return { b: String(b).trimEnd(), a: rest.join('\n').trimEnd() }
}

const serializeWritingAnswerForApi = (answerValue, questionTypeCode) => {
  if (!isTwoPartWriting(questionTypeCode)) return String(answerValue ?? '')
  const b = String(answerValue?.b ?? '')
  const a = String(answerValue?.a ?? '')
  // Match backend-friendly format (can be same-line): "㉠:... ㉡:..."
  return `㉠:${a} ㉡:${b}`.trim()
}

// Map questionTypeCode Q51–Q54 -> TopikWriting grading endpoint path
const getTopikWritingEndpointPath = (questionTypeCode) => {
  if (!questionTypeCode) return null
  const code = String(questionTypeCode).slice(-3).toUpperCase()
  switch (code) {
    case 'Q51':
      return '/TopikWriting/question51'
    case 'Q52':
      return '/TopikWriting/question52'
    case 'Q53':
      return '/TopikWriting/question53'
    case 'Q54':
      return '/TopikWriting/question54'
    default:
      return null
  }
}

// Grade TopikWriting questions (Q51–Q54) và đợi kết quả
// Chỉ chạy API grading cho các câu Q51, Q52, Q53, Q54 nếu có trong đề thi
// Dùng userQuestionId của từng câu writing làm userExamWritingAnswerId khi POST
const gradeTopikWriting = async (sectionsSnapshot) => {
  try {
    const sectionsToUse = Array.isArray(sectionsSnapshot) ? sectionsSnapshot : []
    const gradingPromises = []

    sectionsToUse.forEach((section) => {
      if (!section || section.key !== 'writing') return

      section.questions.forEach((q) => {
        if (!q || q.type !== 'writing' || !q.rawQuestion) return

        const raw = q.rawQuestion
        const questionTypeCode =
          q.questionTypeCode || raw.questionTypeCode || raw.questionType?.code

        // Chỉ xử lý các câu Q51, Q52, Q53, Q54
        const code = questionTypeCode ? String(questionTypeCode).slice(-3).toUpperCase() : ''
        if (!['Q51', 'Q52', 'Q53', 'Q54'].includes(code)) return

        const gradingPath = getTopikWritingEndpointPath(questionTypeCode)
        // Dùng userQuestionId của từng câu writing làm userExamWritingAnswerId
        const userQuestionId = raw.userQuestionId

        if (!gradingPath || !userQuestionId) return

        gradingPromises.push(
          apiClient.post(gradingPath, {
            userExamWritingAnswerId: userQuestionId,
          })
        )
      })
    })

    // Đợi tất cả các API grading hoàn thành
    if (gradingPromises.length > 0) {
      await Promise.allSettled(gradingPromises)
    }
  } catch (error) {
    console.error('Failed to grade TopikWriting questions:', error)
    // Không throw error để không chặn flow submit
  }
}

const buildMcqAnswersPayload = (section, sectionAnswers) => {
  if (!section || !Array.isArray(section.questions)) return []
  const answers = []

  section.questions.forEach((q) => {
    if (!q || q.type === 'writing') return
    const raw = q.rawQuestion
    if (!raw?.userQuestionId) return

    const answerIndex = sectionAnswers?.[q.questionNumber]
    if (typeof answerIndex !== 'number' || answerIndex <= 0) return

    const opt = (raw.options || [])[answerIndex - 1] // UI is 1-based
    if (!opt?.optionId) return

    answers.push({
      userQuestionId: raw.userQuestionId,
      selectedOptionId: opt.optionId,
    })
  })

  return answers
}

const buildAllMcqAnswersPayload = (sections, allAnswersState) => {
  if (!Array.isArray(sections) || !allAnswersState) return []
  const merged = []
  const seen = new Set()

  sections.forEach((section) => {
    if (!section || section.key === 'writing') return
    const sectionAnswers = allAnswersState[section.key] || {}
    const list = buildMcqAnswersPayload(section, sectionAnswers)
    list.forEach((item) => {
      if (!item?.userQuestionId || !item?.selectedOptionId) return
      // If duplicates happen, keep last occurrence
      if (seen.has(item.userQuestionId)) return
      seen.add(item.userQuestionId)
      merged.push(item)
    })
  })

  return merged
}

// Bước 1: Take exam để lấy userExamId
const startExam = async (examId = DEFAULT_EXAM_ID, isShuffle = true) => {
  const cacheKey = `${examId || ''}:${isShuffle}`
  // Nếu đã có promise đang/đã gọi rồi với cùng tham số thì luôn dùng lại (tránh gọi 2 lần API)
  if (startExamOncePromise && startExamCacheKey === cacheKey) {
    return startExamOncePromise
  }

  startExamCacheKey = cacheKey

  const url = ENDPOINTS.USER_EXAM?.TAKE_EXAM
    ? ENDPOINTS.USER_EXAM.TAKE_EXAM(examId, isShuffle)
    : `/UserExam/user/take-exam?examId=${encodeURIComponent(examId)}&isShuffle=${isShuffle}`

  startExamOncePromise = (async () => {
    try {
      const response = await apiClient.post(url, {})
      // API backend bọc trong { isSuccess, data: { userExamId }, ... }
      return response?.data?.data || null // { userExamId }
    } catch (error) {
      // Nếu lỗi thì reset để lần sau có thể thử lại
      startExamOncePromise = null
      startExamCacheKey = null
      throw error
    }
  })()

  return startExamOncePromise
}

// Bước 2: Lấy chi tiết bài thi đang làm dở từ userExamId
const getExamDetailInProgress = async (userExamId) => {
  if (!userExamId) return null
  const url = ENDPOINTS.USER_EXAM?.DETAIL_IN_PROGRESS
    ? ENDPOINTS.USER_EXAM.DETAIL_IN_PROGRESS(userExamId)
    : `/UserExam/user/detail/in-progress?UserExamId=${encodeURIComponent(userExamId)}`

  const response = await apiClient.get(url)
  return response?.data?.data || null
}

const getExamIdByConfigKey = async (examKey) => {
  if (!examKey) return null

  const url = ENDPOINTS.SYSTEM_CONFIGS?.GET_BY_KEY
    ? ENDPOINTS.SYSTEM_CONFIGS.GET_BY_KEY(examKey)
    : `/system-configs/${encodeURIComponent(examKey)}`

  const response = await apiClient.get(url)
  return response?.data?.data?.value || null
}

// Map dữ liệu exam thành 3 phần: listening / reading / writing (nếu có)
const mapExamToSections = (examData) => {
  if (!examData || !examData.part) return []

  const { part } = examData
  let globalQuestionCounter = 1

  const buildSection = (key, label, sectionArray, defaultType) => {
    if (!Array.isArray(sectionArray) || sectionArray.length === 0) return null

    const questions = []

    sectionArray.forEach((p) => {
      // Xử lý cấu trúc mới: questionGroups với sharedMediaUrl/sharedMediaType
      const questionGroups = p.questionGroups || []

      questionGroups.forEach((group) => {
        const sharedMediaUrl = group.sharedMediaUrl
        const sharedMediaType = (group.sharedMediaType || '').toLowerCase()

        // Xác định type dựa trên defaultType (ưu tiên) hoặc sharedMediaType
        // Nếu defaultType là 'writing', luôn giữ là 'writing' (có thể có image kèm theo)
        let type = defaultType
        if (defaultType === 'writing') {
          type = 'writing'
        } else if (sharedMediaType === 'audio') {
          type = 'audio'
        } else if (sharedMediaType === 'image') {
          type = 'image'
        } else {
          type = 'text'
        }

        // Duyệt qua các câu hỏi trong group
        ; (group.questions || []).forEach((q) => {
          const options = (q.options || []).map((opt) => ({
            content: opt.content || '',
            imageUrl: opt.imageUrl || null,
          }))
          // Writing: dùng sharedPassageContent hoặc partName khi content trống; đáp án lấy từ answerContent
          const questionText =
            q.content ||
            (type === 'writing' ? group.sharedPassageContent || p.partName || '' : '')

          questions.push({
            id: q.userQuestionId || q.questionId, // dùng userQuestionId nếu có
            questionNumber: q.questionNo || globalQuestionCounter++, // số thứ tự trong đề (không reset theo phần)
            type,
            questionText,
            audioUrl: type === 'audio' ? sharedMediaUrl : null,
            imageUrl: type === 'image' || type === 'writing' ? sharedMediaUrl : null,
            options,
            questionTypeCode: q.questionTypeCode || null,
            rawQuestion: q, // lưu raw để lấy userQuestionId, answerContent khi sync
          })
        })
      })

      // Fallback: nếu không có questionGroups, thử dùng questions trực tiếp (backward compatibility)
      if (questionGroups.length === 0 && p.questions) {
        ; (p.questions || []).forEach((q) => {
          const options = (q.options || []).map((opt) => ({
            content: opt.content || '',
            imageUrl: opt.imageUrl || null,
          }))
          const mediaType = (q.mediaType || '').toLowerCase()

          // Xác định type dựa trên defaultType (ưu tiên) hoặc mediaType
          // Nếu defaultType là 'writing', luôn giữ là 'writing' (có thể có image kèm theo)
          let type = defaultType
          if (defaultType === 'writing') {
            type = 'writing'
          } else if (mediaType === 'audio') {
            type = 'audio'
          } else if (mediaType === 'image') {
            type = 'image'
          } else {
            type = 'text'
          }

          // Writing: đáp án lấy từ answerContent (không phải content)
          const questionText = q.content || (type === 'writing' ? p.partName || '' : '')

          questions.push({
            id: q.userQuestionId || q.questionId,
            questionNumber: q.questionNo || globalQuestionCounter++,
            type,
            questionText,
            audioUrl: type === 'audio' ? q.mediaUrl : null,
            imageUrl: type === 'image' || type === 'writing' ? q.mediaUrl : null,
            options,
            questionTypeCode: q.questionTypeCode || null,
            rawQuestion: q,
          })
        })
      }
    })

    // Nếu không có câu hỏi nào, không hiển thị section này
    if (questions.length === 0) return null

    return {
      key,
      label,
      title: sectionArray[0]?.partName || '',
      description: sectionArray[0]?.description || '',
      questions,
    }
  }

  const sections = [
    buildSection('listening', 'Nghe', part.listening, 'audio'),
    buildSection('reading', 'Đọc', part.reading, 'text'),
    buildSection('writing', 'Viết', part.writing, 'writing'),
  ].filter(Boolean)

  return sections
}

// Khôi phục đáp án đã chọn từ selectedOptionId trong examData
const restoreAnswersFromSections = (sections) => {
  const restoredAnswers = {}

  sections.forEach((section) => {
    const sectionAnswers = {}

    section.questions.forEach((q) => {
      const raw = q.rawQuestion
      if (!raw) return

      // Nếu có selectedOptionId (đã chọn trước đó), tìm index của option đó
      if (raw.selectedOptionId) {
        const optionIndex = (raw.options || []).findIndex(
          (opt) => opt.optionId === raw.selectedOptionId
        )
        if (optionIndex >= 0) {
          // UI dùng 1-based index (1, 2, 3, 4)
          sectionAnswers[q.questionNumber] = optionIndex + 1
        }
      }

      // Writing: dùng answerContent (không phải content) - kể cả khi rỗng
      if (q.type === 'writing') {
        const questionTypeCode = q.questionTypeCode || raw.questionTypeCode || raw.questionType?.code
        const rawAnswerContent = raw.answerContent ?? ''
        sectionAnswers[q.questionNumber] = isTwoPartWriting(questionTypeCode)
          ? parseTwoPartAnswerContent(rawAnswerContent)
          : rawAnswerContent
      }
    })

    if (Object.keys(sectionAnswers).length > 0) {
      restoredAnswers[section.key] = sectionAnswers
    }
  })

  return restoredAnswers
}

export function RoadmapTestLayout({ level = 1, examKey = null, examId = null, isEntrance = false }) {
  const router = useRouter()
  const [userExamId, setUserExamId] = useState(null)
  const [sections, setSections] = useState([])
  const [activeSectionKey, setActiveSectionKey] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(1)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [examTitle, setExamTitle] = useState('')
  const [answers, setAnswers] = useState({}) // answers theo section: { [sectionKey]: { [questionNo]: optionIndex } }
  const [timeRemaining, setTimeRemaining] = useState('08 : 00')
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(0)
  const [, setTotalQuestions] = useState(8)
  const [isLoading, setIsLoading] = useState(true)
  const [, setLoadError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [submitConfirmVisible, setSubmitConfirmVisible] = useState(false)
  const submitConfirmResolverRef = useRef(null)
  const [backConfirmVisible, setBackConfirmVisible] = useState(false)
  const backConfirmResolverRef = useRef(null)
  const [toastVisible, setToastVisible] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState('success')

  // Load exam data (ưu tiên gọi API thật, fallback sang mock theo level nếu lỗi)
  useEffect(() => {
    let isMounted = true

    const loadExam = async () => {
      setIsLoading(true)
      setLoadError(null)

      try {
        // 1) Resolve examId từ examKey (nếu có), sau đó take exam để backend tạo/ghi nhận userExamId
        const resolvedExamId = examId || (examKey ? await getExamIdByConfigKey(examKey) : null)
        const examIdToUse = resolvedExamId || DEFAULT_EXAM_ID
        const takeExamResult = await startExam(examIdToUse)
        // Handle different possible response structures:
        // - { userExamId: '...' }
        // - { data: { userExamId: '...' } }
        // - userExamId directly (string/number)
        let userExamId = null
        if (takeExamResult) {
          if (typeof takeExamResult === 'string' || typeof takeExamResult === 'number') {
            userExamId = takeExamResult
          } else if (takeExamResult.userExamId) {
            userExamId = takeExamResult.userExamId
          } else if (takeExamResult.data?.userExamId) {
            userExamId = takeExamResult.data.userExamId
          }

        }
        if (!isMounted || !userExamId) {
          throw new Error('No userExamId returned from take-exam')
        }

        setUserExamId(userExamId)
        setExamTitle(takeExamResult?.title || takeExamResult?.examTitle || '')

        // 2) Lấy chi tiết bài đang làm từ userExamId
        const examData = await getExamDetailInProgress(userExamId)
        if (!isMounted || !examData) {
          throw new Error('No exam detail data')
        }

        const mappedSections = mapExamToSections(examData)

        // Khôi phục đáp án đã chọn trước đó (nếu user quay lại)
        const restoredAnswers = restoreAnswersFromSections(mappedSections)

        setSections(mappedSections)
        setActiveSectionKey(mappedSections[0]?.key || null)
        setTotalQuestions(
          examData.totalQuestions ||
          mappedSections.reduce((sum, s) => sum + s.questions.length, 0)
        )

        const totalSeconds =
          typeof examData.timeRemaining === 'number' && examData.timeRemaining > 0
            ? examData.timeRemaining
            : examData.duration
              ? examData.duration * 60
              : getTestConfig(level).totalTime

        setTimeRemainingSeconds(totalSeconds)
        setTimeRemaining(formatTime(totalSeconds))
        const firstSectionQuestion = mappedSections[0]?.questions?.[0]
        setCurrentQuestion(firstSectionQuestion?.questionNumber || 1)
        setCurrentQuestionIndex(0)
        setAnswers(restoredAnswers)
        setExamTitle(
          examData.title ||
          examData.examTitle ||
          takeExamResult?.title ||
          takeExamResult?.examTitle ||
          ''
        )
      } catch (error) {
        console.error('Failed to load exam from API, fallback to mock:', error)

        const testConfig = getTestConfig(level)
        const testQuestions = getTestQuestions(level)

        setTotalQuestions(testConfig.totalQuestions)
        setSections([
          {
            key: 'mock',
            label: 'Đề mẫu',
            title: 'Đề luyện tập',
            description: '',
            questions: testQuestions,
          },
        ])
        setActiveSectionKey('mock')
        setExamTitle('')

        const totalSeconds = testConfig.totalTime
        setTimeRemainingSeconds(totalSeconds)
        setTimeRemaining(formatTime(totalSeconds))

        setLoadError('Không tải được đề thi thật, đang dùng dữ liệu mẫu.')
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadExam()

    return () => {
      isMounted = false
    }
  }, [level, examKey, examId])

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

  // Dùng ref để lưu latest values cho auto-save
  const sectionsRef = useRef(sections)
  const answersRef = useRef(answers)

  useEffect(() => {
    sectionsRef.current = sections
  }, [sections])

  useEffect(() => {
    answersRef.current = answers
  }, [answers])

  // Auto-save writing answers mỗi 20s
  // Lưu ý: cần phụ thuộc vào `sections` để khi đề thi (và phần writing) được load xong
  // thì interval mới được tạo. Nếu để [] thì lần mount đầu sectionsRef.current.length === 0
  // và interval sẽ không bao giờ được tạo => không gọi API sync/writing.
  useEffect(() => {
    if (sectionsRef.current.length === 0) return

    const hasWritingSection = sectionsRef.current.some((section) => section.key === 'writing')
    if (!hasWritingSection) return

    const interval = setInterval(() => {
      // Duyệt qua tất cả writing questions và sync nếu có thay đổi
      sectionsRef.current.forEach((section) => {
        if (section.key !== 'writing') return

        const sectionAnswers = answersRef.current[section.key] || {}
        section.questions.forEach((q) => {
          if (q.type === 'writing' && q.rawQuestion) {
            const raw = q.rawQuestion
            const answerText = sectionAnswers[q.questionNumber]
            if (raw.userQuestionId && answerText !== undefined) {
              const questionTypeCode = q.questionTypeCode || raw.questionTypeCode || raw.questionType?.code
              syncWritingAnswer(
                raw.userQuestionId,
                serializeWritingAnswerForApi(answerText, questionTypeCode) || ''
              )
            }
          }
        })
      })
    }, 20000) // 20 giây

    return () => clearInterval(interval)
  }, [sections])

  // Lưu đáp án MCQ (listening/reading) ngay khi user chọn
  const syncMcqAnswers = async (answersList) => {
    if (!Array.isArray(answersList) || answersList.length === 0) return

    try {
      await apiClient.put(ENDPOINTS.USER_EXAM.SYNC_MCQ, {
        answers: answersList,
      })
      // Không hiện thông báo để không làm phiền user
    } catch (error) {
      console.error('Failed to sync MCQ answer:', error)
      // Không hiện alert để không làm gián đoạn flow làm bài
    }
  }

  // Lưu đáp án Writing (tự luận)
  const syncWritingAnswer = async (userQuestionId, answerContent) => {
    if (!userQuestionId) return

    try {
      await apiClient.put(ENDPOINTS.USER_EXAM.SYNC_WRITING, {
        userQuestionId,
        answerContent: answerContent || '',
      })
      // Không hiện thông báo để không làm phiền user
    } catch (error) {
      console.error('Failed to sync writing answer:', error)
      // Không hiện alert để không làm gián đoạn flow làm bài
    }
  }

  // Sync tất cả đáp án (MCQ + Writing) trước khi submit
  const syncAllAnswersBeforeSubmit = async () => {
    if (!userExamId) return

    try {
      const sectionsSnapshot = sectionsRef.current.length ? sectionsRef.current : sections
      const answersSnapshot = answersRef.current || answers

      // 1. Sync tất cả MCQ answers (listening + reading)
      const allMcqAnswers = buildAllMcqAnswersPayload(sectionsSnapshot, answersSnapshot)
      if (allMcqAnswers.length > 0) {
        await syncMcqAnswers(allMcqAnswers)
      }

      // 2. Sync tất cả Writing answers
      const writingSyncPromises = []
      sectionsSnapshot.forEach((section) => {
        if (section.key !== 'writing') return

        const sectionAnswers = answersSnapshot[section.key] || {}
        section.questions.forEach((q) => {
          if (q.type !== 'writing' || !q.rawQuestion) return

          const raw = q.rawQuestion
          const answerText = sectionAnswers[q.questionNumber]
          if (answerText === undefined || !raw.userQuestionId) return

          const questionTypeCode =
            q.questionTypeCode || raw.questionTypeCode || raw.questionType?.code
          const answerContent =
            serializeWritingAnswerForApi(answerText, questionTypeCode) || ''

          writingSyncPromises.push(syncWritingAnswer(raw.userQuestionId, answerContent))
        })
      })

      if (writingSyncPromises.length > 0) {
        await Promise.allSettled(writingSyncPromises)
      }
    } catch (error) {
      console.error('Error syncing all answers before submit:', error)
      // Không throw để không chặn submit
    }
  }

  // Shared handler: cập nhật đáp án (dùng cho question area và dashboard)
  const handleAnswerSelect = (questionNum, answerIndex) => {
    if (!activeSectionKey) return
    const activeSection = sections.find((s) => s.key === activeSectionKey)
    const questionData = activeSection?.questions?.find((q) => q.questionNumber === questionNum)
    if (!questionData) return

    setAnswers((prev) => {
      const next = {
        ...prev,
        [activeSectionKey]: {
          ...(prev[activeSectionKey] || {}),
          [questionNum]: answerIndex,
        },
      }
      if (questionData.type !== 'writing') {
        const answersList = buildAllMcqAnswersPayload(sectionsRef.current, next)
        syncMcqAnswers(answersList)
      }
      return next
    })
  }

  const handleQuestionAnswerSelect = (answerIndex) => {
    const questionNumber = currentQuestionData?.questionNumber || currentQuestion
    handleAnswerSelect(questionNumber, answerIndex)
  }

  // Handle writing answer change (tự luận)
  const handleWritingAnswerChange = (text) => {
    if (!activeSectionKey) return

    const questionData = currentQuestionData
    if (!questionData || questionData.type !== 'writing') return

    // Writing là lưu riêng từng câu (theo userQuestionId). Nhưng state đang key theo questionNumber.
    // Khi user đổi section/tab hoặc bấm Lưu bài ngay sau khi gõ, `currentQuestion` có thể đã thay đổi
    // khiến đáp án bị set vào câu khác => nút Lưu bài không thấy để sync.
    // => luôn dùng questionNumber snapshot từ currentQuestionData.
    const questionNumber = questionData.questionNumber

    setAnswers((prev) => ({
      ...prev,
      [activeSectionKey]: {
        ...(prev[activeSectionKey] || {}),
        [questionNumber]: text,
      },
    }))
  }

  // Handle question selection from dashboard
  const handleQuestionSelect = (questionNum) => {
    const activeSection = sections.find((s) => s.key === activeSectionKey)
    const questionList = activeSection?.questions || []
    const nextIndex = questionList.findIndex((q) => q.questionNumber === questionNum)
    if (nextIndex >= 0) {
      setCurrentQuestionIndex(nextIndex)
      setCurrentQuestion(questionNum)
    }
  }

  // Navigate to next question
  const handleNextQuestion = () => {
    const activeSection = sections.find((s) => s.key === activeSectionKey)
    const sectionTotal = activeSection?.questions.length || 0
    if (currentQuestionIndex < sectionTotal - 1) {
      const nextIndex = currentQuestionIndex + 1
      const nextQuestion = activeSection?.questions?.[nextIndex]
      if (nextQuestion) {
        setCurrentQuestionIndex(nextIndex)
        setCurrentQuestion(nextQuestion.questionNumber)
      }
    }
  }

  // Navigate to previous question
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1
      const prevQuestion = activeSection?.questions?.[prevIndex]
      if (prevQuestion) {
        setCurrentQuestionIndex(prevIndex)
        setCurrentQuestion(prevQuestion.questionNumber)
      }
    }
  }

  // Handle submit
  const confirmSubmit = () =>
    new Promise((resolve) => {
      submitConfirmResolverRef.current = resolve
      setSubmitConfirmVisible(true)
    })

  const handleCloseSubmitConfirm = () => {
    setSubmitConfirmVisible(false)
    const resolve = submitConfirmResolverRef.current
    submitConfirmResolverRef.current = null
    if (typeof resolve === 'function') resolve(false)
  }

  const handleConfirmSubmit = () => {
    setSubmitConfirmVisible(false)
    const resolve = submitConfirmResolverRef.current
    submitConfirmResolverRef.current = null
    if (typeof resolve === 'function') resolve(true)
  }

  const handleSubmit = async () => {
    if (isSubmitting) return

    setTimeRemainingSeconds(0)

    if (!userExamId) {
      Alert.alert('Thông báo', 'Bạn đang làm đề mẫu. Kết quả không được lưu.')
      return
    }

    const confirmed = await confirmSubmit()
    if (!confirmed) return

    setIsSubmitting(true)
    try {
      // 0) Sync tất cả đáp án (MCQ + Writing) trước khi submit
      await syncAllAnswersBeforeSubmit()

      // 1) Submit exam
      const submitResp = await apiClient.post(ENDPOINTS.USER_EXAM.SUBMIT, {
        userExamId,
      })

      const submittedUserExamId = submitResp?.data?.data?.userExamId || userExamId
      const isSubmitSuccess = submitResp?.data?.isSuccess !== false

      if (!isSubmitSuccess || !submittedUserExamId) {
        Alert.alert('Lỗi', 'Không thể nộp bài. Vui lòng thử lại.')
        return
      }

      // 2) Chạy API grading cho các câu writing Q51, Q52, Q53, Q54 (nếu có)
      const sectionsSnapshot = sectionsRef.current.length ? sectionsRef.current : sections
      await gradeTopikWriting(sectionsSnapshot)

      // 3) GET result để đảm bảo kết quả đã được tính toán
      try {
        const resultUrl = ENDPOINTS.USER_EXAM.RESULT(submittedUserExamId)
        await apiClient.get(resultUrl)
      } catch (resultError) {
        console.error('Failed to fetch result after grading:', resultError)
        // Tiếp tục navigate ngay cả khi GET result lỗi (result page sẽ tự fetch lại)
      }

      // 4) Navigate to result page (kèm level để "Làm đề khác" quay về đúng level)
      router.push(
        `/roadmap/test/result?userExamId=${encodeURIComponent(
          submittedUserExamId
        )}&level=${encodeURIComponent(String(level))}&isEntrance=${isEntrance ? '1' : '0'}`
      )

      // Sau khi đã nộp xong và chuyển sang màn hình kết quả,
      // lần vào làm bài tiếp theo phải tạo userExamId mới
      startExamOncePromise = null
    } catch (error) {
      console.error('Failed to submit exam:', error)
      Alert.alert('Lỗi', 'Không thể nộp bài. Vui lòng thử lại.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChangeSection = (sectionKey) => {
    if (sectionKey === activeSectionKey) return
    const nextSection = sections.find((s) => s.key === sectionKey)
    const firstQuestion = nextSection?.questions?.[0]
    setActiveSectionKey(sectionKey)
    setCurrentQuestionIndex(0)
    setCurrentQuestion(firstQuestion?.questionNumber || 1)
  }

  // Handle back to learning page
  const confirmBack = () =>
    new Promise((resolve) => {
      backConfirmResolverRef.current = resolve
      setBackConfirmVisible(true)
    })

  const handleCloseBackConfirm = () => {
    setBackConfirmVisible(false)
    const resolve = backConfirmResolverRef.current
    backConfirmResolverRef.current = null
    if (typeof resolve === 'function') resolve(false)
  }

  const handleConfirmBack = () => {
    setBackConfirmVisible(false)
    const resolve = backConfirmResolverRef.current
    backConfirmResolverRef.current = null
    if (typeof resolve === 'function') resolve(true)
  }

  const handleBackToLearning = async () => {
    const confirmed = await confirmBack()
    if (!confirmed) return

    // Navigate to learning page with current level
    router.push(`/roadmap/learning?level=${level}`)
  }

  const activeSection = sections.find((s) => s.key === activeSectionKey)
  const sectionQuestions = activeSection?.questions || []
  const currentQuestionData =
    sectionQuestions[currentQuestionIndex] ||
    sectionQuestions.find((q) => q.questionNumber === currentQuestion) ||
    sectionQuestions[0]

  const handleManualSave = async () => {
    if (isSaving) return
    setIsSaving(true)
    try {
      // Dùng ref nếu có (luôn là snapshot mới nhất), fallback sang state
      const currentSections = sectionsRef.current.length ? sectionsRef.current : sections
      const currentAnswers = Object.keys(answersRef.current || {}).length
        ? answersRef.current
        : answers

      // 1) Lưu toàn bộ đáp án trắc nghiệm (listening/reading)
      const mcqAnswersPayload = buildAllMcqAnswersPayload(currentSections, currentAnswers)
      if (mcqAnswersPayload.length > 0) {
        await syncMcqAnswers(mcqAnswersPayload)
      }

      // 2) Lưu toàn bộ đáp án Writing
      const writingSection = currentSections.find((section) => section.key === 'writing')
      if (writingSection) {
        const writingAnswers = currentAnswers[writingSection.key] || {}
        const writingPromises = []

        writingSection.questions.forEach((q) => {
          if (q.type !== 'writing' || !q.rawQuestion) return

          const raw = q.rawQuestion
          const answerValue = writingAnswers[q.questionNumber]
          // Nếu answerValue là undefined, vẫn gửi chuỗi rỗng để xóa/cập nhật nếu cần, 
          // trừ khi user chưa bao giờ chạm vào câu đó.
          if (answerValue === undefined || !raw.userQuestionId) return

          const questionTypeCode =
            q.questionTypeCode || raw.questionTypeCode || raw.questionType?.code
          const serializedAnswer = serializeWritingAnswerForApi(
            answerValue,
            questionTypeCode
          )

          writingPromises.push(
            syncWritingAnswer(raw.userQuestionId, serializedAnswer || '')
          )
        })

        if (writingPromises.length > 0) {
          // Sử dụng Promise.allSettled để đảm bảo nếu một câu lỗi thì các câu khác vẫn được lưu
          await Promise.allSettled(writingPromises)
        }
      }

      // Hiển thị toast notification thành công
      setToastMessage('Đáp án của bạn đã được lưu thành công!')
      setToastType('success')
      setToastVisible(true)
    } catch (error) {
      console.error('Failed to manually save answers:', error)
      // Hiển thị toast notification lỗi
      setToastMessage('Không thể lưu bài. Vui lòng thử lại.')
      setToastType('error')
      setToastVisible(true)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.loadingText}>Đang tải đề thi...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Toast Notification */}
      <ToastNotification
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={() => setToastVisible(false)}
        duration={3000}
      />

      <View style={styles.innerWrapper}>
        {/* Close button */}
        <Pressable
          onPress={handleBackToLearning}
          style={({ pressed }) => [
            styles.headerCloseButton,
            pressed && styles.headerCloseButtonPressed,
          ]}
          hitSlop={8}
        >
          <Text style={styles.headerCloseButtonText}>×</Text>
        </Pressable>

        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerTextBlock}>
            <View style={styles.examTitleRow}>
              <View style={styles.examChip}>
                <Image source={normalizeImageSource(CarrotImage)} style={styles.examChipIcon} resizeMode="contain" />
              </View>
              <View>
                <Text style={styles.examTitleText}>
                  {examTitle || 'Đề luyện tập TOPIK'}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.headerRightSection}>
            <View style={styles.timerBox}>
              <Text style={styles.timerLabel}>Thời gian còn lại</Text>
              <Text style={styles.timerValue}>{timeRemaining}</Text>
            </View>
          </View>
        </View>

        <View style={styles.contentRow}>
          {/* Left: Question */}
          <View style={styles.questionContainer}>
            {/* Instruction for current section (moved down from header) */}
            {(activeSection?.title || activeSection?.description) && (
              <View style={styles.instructionBox}>
                {!!activeSection?.title && (
                  <Text style={styles.instructionTitle}>{String(activeSection.title)}</Text>
                )}
                {!!activeSection?.description && (
                  <Text style={styles.instructionSubtitle}>{String(activeSection.description)}</Text>
                )}
              </View>
            )}

            {currentQuestionData && (
              <RoadmapTestQuestion
                questionNumber={currentQuestionData.questionNumber}
                type={currentQuestionData.type}
                questionText={currentQuestionData.questionText}
                audioUrl={currentQuestionData.audioUrl}
                imageUrl={currentQuestionData.imageUrl}
                options={currentQuestionData.options}
                questionTypeCode={currentQuestionData.questionTypeCode}
                selectedAnswer={(answers[activeSectionKey] || {})[currentQuestion]}
                onAnswerSelect={handleQuestionAnswerSelect}
                onAnswerChange={
                  currentQuestionData.type === 'writing' ? handleWritingAnswerChange : undefined
                }
              />
            )}

          </View>

          {/* Right: Dashboard */}
          <View style={styles.dashboardContainer}>
            <View style={[styles.sectionTabsRow, styles.dashboardHeaderTabs]}>
              {sections.map((section) => (
                <RoadmapTestButton
                  key={section.key}
                  title={section.label}
                  onPress={() => handleChangeSection(section.key)}
                  style={[
                    styles.sectionTab,
                    activeSectionKey === section.key && styles.sectionTabActive,
                  ]}
                />
              ))}
            </View>

            <RoadmapTestDashboard
              totalQuestions={sectionQuestions.length}
              questionNumbers={sectionQuestions.map((q) => q.questionNumber)}
              timeRemaining={timeRemaining}
              answers={answers[activeSectionKey] || {}}
              onAnswerSelect={handleAnswerSelect}
              onSubmit={handleSubmit}
              onSave={handleManualSave}
              isSaving={isSaving}
              isSubmitting={isSubmitting}
              currentQuestion={currentQuestion}
              onQuestionSelect={handleQuestionSelect}
            />

            <View style={[styles.navigationButtons, styles.dashboardNavigationButtons]}>
              {currentQuestionIndex > 0 ? (
                <RoadmapTestButton onPress={handlePrevQuestion} style={styles.navButtonLeft}>
                  <ArrowLeftOutlined style={styles.navButtonIcon} />
                </RoadmapTestButton>
              ) : (
                <View style={styles.navButtonLeft} />
              )}
              {currentQuestionIndex < sectionQuestions.length - 1 && (
                <RoadmapTestButton onPress={handleNextQuestion} style={styles.navButtonRight}>
                  <ArrowRightOutlined style={styles.navButtonIcon} />
                </RoadmapTestButton>
              )}
            </View>
          </View>
        </View>
      </View>
      <Image source={normalizeImageSource(CarrotImage)} style={styles.carrot} resizeMode="contain" />

      {/* Submit confirm modal */}
      <Modal
        visible={submitConfirmVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCloseSubmitConfirm}
      >
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmModal}>
            <Text style={styles.confirmTitle}>Xác nhận nộp bài</Text>
            <Text style={styles.confirmMessage}>
              Bạn có chắc chắn muốn nộp bài? Sau khi nộp, bạn sẽ không thể chỉnh sửa đáp án.
            </Text>

            <View style={styles.confirmActions}>
              <Pressable
                onPress={handleCloseSubmitConfirm}
                style={({ pressed }) => [
                  styles.confirmButton,
                  styles.confirmButtonCancel,
                  pressed && styles.confirmButtonPressed,
                ]}
              >
                <Text style={styles.confirmButtonCancelText}>Hủy</Text>
              </Pressable>
              <Pressable
                onPress={handleConfirmSubmit}
                style={({ pressed }) => [
                  styles.confirmButton,
                  styles.confirmButtonOk,
                  pressed && styles.confirmButtonPressed,
                ]}
              >
                <Text style={styles.confirmButtonOkText}>Nộp bài</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Back to learning confirm modal */}
      <Modal
        visible={backConfirmVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCloseBackConfirm}
      >
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmModal}>
            <Pressable
              onPress={handleCloseBackConfirm}
              style={({ pressed }) => [
                styles.closeButton,
                pressed && styles.closeButtonPressed,
              ]}
              hitSlop={8}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </Pressable>
            <Text style={styles.confirmTitle}>Xác nhận quay lại</Text>
            <Text style={styles.confirmMessage}>
              Bạn có chắc chắn muốn quay lại trang học tập? Tiến độ làm bài của bạn sẽ được lưu tự động.
            </Text>

            <View style={styles.confirmActions}>
              <Pressable
                onPress={handleCloseBackConfirm}
                style={({ pressed }) => [
                  styles.confirmButton,
                  styles.confirmButtonCancel,
                  pressed && styles.confirmButtonPressed,
                ]}
              >
                <Text style={styles.confirmButtonCancelText}>Hủy</Text>
              </Pressable>
              <Pressable
                onPress={handleConfirmBack}
                style={({ pressed }) => [
                  styles.confirmButton,
                  styles.confirmButtonOk,
                  pressed && styles.confirmButtonPressed,
                ]}
              >
                <Text style={styles.confirmButtonOkText}>Quay lại</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
    alignItems: 'center',
    height: '100vh',
    overflow: 'hidden',
  },
  innerWrapper: {
    width: '98%',
    maxWidth: 1400,
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginVertical: 12,
    padding: 20,
    gap: 12,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 10px 40px rgba(0,0,0,0.05)',
      display: 'flex',
      flexDirection: 'column',
    }),
  },
  headerCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  headerCloseButtonText: {
    fontSize: 22,
    fontWeight: '300',
    color: '#666',
    lineHeight: 22,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  headerTextBlock: {
    flex: 1,
    gap: 4,
  },
  instructionBox: {
    backgroundColor: '#F8F9FF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E8EFFF',
  },
  instructionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2A2A2A',
    fontFamily: 'Epilogue, sans-serif',
  },
  instructionSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
    fontWeight: '500',
  },
  examTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  examChip: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFF2CC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  examChipIcon: {
    width: 20,
    height: 20,
  },
  examTitleText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
  },
  examSubtitleText: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
  },
  headerRightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingRight: 40,
  },
  timerBox: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: '#F1BE4B',
    alignItems: 'center',
    minWidth: 130,
  },
  timerLabel: {
    fontSize: 9,
    color: '#1A1A1A',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  timerValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  contentRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 20,
    overflow: 'hidden',
  },
  questionContainer: {
    flex: 1.4,
    gap: 16,
    ...(Platform.OS === 'web' && {
      overflowY: 'auto',
      paddingRight: 8,
    }),
  },
  dashboardContainer: {
    flex: 0.6,
    minWidth: 340,
    gap: 12,
    height: '100%',
    ...(Platform.OS === 'web' && {
      display: 'flex',
      flexDirection: 'column',
    }),
  },
  dashboardHeaderTabs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  sectionTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  sectionTabActive: {
    backgroundColor: '#FFE5B3',
    borderColor: '#FFC107',
    borderWidth: 1,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 'auto',
  },
  dashboardNavigationButtons: {
    marginTop: 12,
  },
  navButtonLeft: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F1BE4B',
  },
  navButtonRight: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F1BE4B',
  },
  navButtonIcon: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    ...(Platform.OS === 'web' && {
      backdropFilter: 'blur(8px)',
    }),
  },
  confirmModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 440,
    gap: 16,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#F1BE4B',
    textAlign: 'center',
  },
  confirmMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    textAlign: 'center',
    fontWeight: '500',
  },
  confirmActions: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonCancel: {
    backgroundColor: '#F5F5F5',
  },
  confirmButtonOk: {
    backgroundColor: '#F1BE4B',
  },
  confirmButtonCancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666',
  },
  confirmButtonOkText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  carrot: {
    position: 'absolute',
    bottom: 12,
    right: 20,
    width: 60,
    height: 40,
    opacity: 0.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  loadErrorText: {
    fontSize: 13,
    color: '#E65100',
  },
})


