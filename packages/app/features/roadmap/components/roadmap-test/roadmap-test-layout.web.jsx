import { useState, useEffect, useRef } from 'react'
import { StyleSheet, View, Image, Text, Alert, Platform, Modal, Pressable } from 'react-native'
import { useRouter } from 'solito/navigation'
import { RoadmapTestQuestion } from './roadmap-test-question'
import { RoadmapTestDashboard } from './roadmap-test-dashboard'
import { RoadmapTestButton } from './roadmap-test-button'
import { ToastNotification } from './toast-notification'
import { ArrowLeftOutlined, ArrowRightOutlined, FlagFilled, ClockCircleOutlined, CustomerServiceOutlined, EditOutlined, ReadOutlined } from '@ant-design/icons'
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

const normalizeHtmlText = (value) => {
  if (!value) return ''
  return String(value)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?[^>]+(>|$)/g, '')
}

const renderHtmlText = (value, style) => {
  if (Platform.OS === 'web') {
    return (
      <span
        style={{ 
          ...style, 
          display: 'block', 
          lineHeight: '1.5',
          wordBreak: 'break-word' 
        }}
        dangerouslySetInnerHTML={{ __html: String(value || '') }}
      />
    )
  }

  return <Text style={style}>{normalizeHtmlText(value)}</Text>
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
const startExam = async (examId, isShuffle = true) => {
  const url = ENDPOINTS.USER_EXAM?.TAKE_EXAM
    ? ENDPOINTS.USER_EXAM.TAKE_EXAM(examId, isShuffle)
    : `/UserExam/user/take-exam?examId=${encodeURIComponent(examId)}&isShuffle=${isShuffle}`

  try {
    const response = await apiClient.post(url, {})
    return response?.data?.data || response?.data || null
  } catch (error) {
    console.error('Failed to start exam:', error)
    throw error
  }
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

const examIdConfigCache = {}
const getExamIdByConfigKey = async (examKey) => {
  if (!examKey) return null
  if (examIdConfigCache[examKey]) return examIdConfigCache[examKey]

  const url = ENDPOINTS.SYSTEM_CONFIGS?.GET_BY_KEY
    ? ENDPOINTS.SYSTEM_CONFIGS.GET_BY_KEY(examKey)
    : `/system-configs/${encodeURIComponent(examKey)}`

  const response = await apiClient.get(url)
  const value = response?.data?.data?.value || null
  if (value) examIdConfigCache[examKey] = value
  return value
}

// Map dữ liệu exam thành 3 phần: listening / reading / writing (nếu có)
const mapExamToSections = (examData) => {
  if (!examData || !examData.part) return []

  const { part } = examData
  let globalQuestionCounter = 1

  const buildSection = (key, label, sectionArray, defaultType) => {
    if (!Array.isArray(sectionArray) || sectionArray.length === 0) return null

    const questions = []

    sectionArray.forEach((p, pIdx) => {
      // Xử lý cấu trúc mới: questionGroups với sharedMediaUrl/sharedMediaType
      const questionGroups = p.questionGroups || []

      questionGroups.forEach((group, gIdx) => {
        const sharedMediaUrl = group.sharedMediaUrl
        const sharedMediaType = (group.sharedMediaType || '').toLowerCase()
        const sharedPassageContent = group.sharedPassageContent || null
        const sharedPassageMediaUrl = group.sharedPassageMediaUrl || null
        const groupId = `group-${p.partId || pIdx}-${gIdx}`

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
            (type === 'writing' ? sharedPassageContent || p.partName || '' : '')

          questions.push({
            id: q.userQuestionId || q.questionId, // dùng userQuestionId nếu có
            questionNumber: q.questionNo || globalQuestionCounter++, // số thứ tự trong đề (không reset theo phần)
            type,
            questionText,
            audioUrl: type === 'audio' ? sharedMediaUrl : null,
            imageUrl: type === 'image' || type === 'writing' ? sharedMediaUrl : null,
            sharedPassageContent,
            sharedPassageMediaUrl,
            groupId,
            options,
            questionTypeCode: q.questionTypeCode || null,
            partTitle: p.partName || '',
            partDescription: p.description || '',
            rawQuestion: q, // lưu raw để lấy userQuestionId, answerContent khi sync
          })
        })
      })

      // Fallback: nếu không có questionGroups, thử dùng questions trực tiếp (backward compatibility)
      if (questionGroups.length === 0 && p.questions) {
        ; (p.questions || []).forEach((q, qIdx) => {
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
            sharedPassageContent: null,
            sharedPassageMediaUrl: null,
            groupId: `legacy-${p.partId || pIdx}-${qIdx}`,
            options,
            questionTypeCode: q.questionTypeCode || null,
            partTitle: p.partName || '',
            partDescription: p.description || '',
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
    buildSection('writing', 'Viết', part.writing, 'writing'),
    buildSection('reading', 'Đọc', part.reading, 'text'),
  ].filter(Boolean)

  // Linh hoạt sắp xếp thứ tự các phần thi theo thứ tự trả về từ skillDurations / skillTimeRemaining
  const orderingKeys = Object.keys(examData.skillDurations || examData.skillTimeRemaining || {})
  if (orderingKeys.length > 0) {
    sections.sort((a, b) => {
      const idxA = orderingKeys.findIndex((k) => k.toLowerCase() === a.key.toLowerCase())
      const idxB = orderingKeys.findIndex((k) => k.toLowerCase() === b.key.toLowerCase())
      const posA = idxA >= 0 ? idxA : 999
      const posB = idxB >= 0 ? idxB : 999
      return posA - posB
    })
  }

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

export function RoadmapTestLayout({ level = 1, examKey = null, examId = null, isEntrance = false, taskId = null }) {
  const router = useRouter()
  const [userExamId, setUserExamId] = useState(null)
  const [sections, setSections] = useState([])
  const [activeSectionKey, setActiveSectionKey] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(1)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [examTitle, setExamTitle] = useState('')
  const [answers, setAnswers] = useState({}) // answers theo section: { [sectionKey]: { [questionNo]: optionIndex } }
  const [timeRemaining, setTimeRemaining] = useState('00 : 00')
  const [skillTimeRemaining, setSkillTimeRemaining] = useState({})
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(0)
  const [, setTotalQuestions] = useState(8)
  const [isLoading, setIsLoading] = useState(true)
  const [, setLoadError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitConfirmVisible, setSubmitConfirmVisible] = useState(false)
  const [submitConfirmMessage, setSubmitConfirmMessage] = useState('')
  const submitConfirmResolverRef = useRef(null)
  const [backConfirmVisible, setBackConfirmVisible] = useState(false)
  const backConfirmResolverRef = useRef(null)
  const [sectionConfirmVisible, setSectionConfirmVisible] = useState(false)
  const [pendingSectionKey, setPendingSectionKey] = useState(null)
  const [toastVisible, setToastVisible] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState('success')
  const [markedQuestions, setMarkedQuestions] = useState({}) // { [sectionKey]: { [questionNo]: boolean } }
  const [previewImage, setPreviewImage] = useState(null)
  const questionListRef = useRef(null)
  // Refs to deduplicate the take-exam API call when React StrictMode double-invokes
  // the effect. Both invocations share the same promise so the API fires exactly once.
  const activeLoadIdRef = useRef(0)
  const takeExamInFlightRef = useRef(null)   // { examId, promise }

  // Scroll to top when section changes
  useEffect(() => {
    if (activeSectionKey && questionListRef.current) {
      if (Platform.OS === 'web') {
        questionListRef.current.scrollTop = 0
      }
    }
  }, [activeSectionKey])

  const handleToggleMark = (questionNum) => {
    if (!activeSectionKey) return
    setMarkedQuestions((prev) => {
      const sectionMarked = prev[activeSectionKey] || {}
      return {
        ...prev,
        [activeSectionKey]: {
          ...sectionMarked,
          [questionNum]: !sectionMarked[questionNum],
        },
      }
    })
  }

  const handleImagePreview = (url) => {
    if (url) setPreviewImage(url)
  }

  // Load exam data
  useEffect(() => {
    // Give this specific invocation a unique ID.
    // If React StrictMode mounts twice, the first invocation's ID becomes stale
    // as soon as the cleanup runs and increments the counter.
    const loadId = ++activeLoadIdRef.current

    const loadExam = async () => {
      setIsLoading(true)
      setLoadError(null)

      try {
        // 1) Resolve examId
        const resolvedExamId = examId || (examKey ? await getExamIdByConfigKey(examKey) : null)

        // Bail out if this request is no longer the latest (component unmounted or re-ran)
        if (activeLoadIdRef.current !== loadId) return

        if (!resolvedExamId) {
          throw new Error('Không tìm thấy mã bài thi. Vui lòng quay lại trang trước.')
        }

        const takeExamResult = await (() => {
          // If a take-exam call for this exact examId is already in-flight
          // (StrictMode double-mount), reuse the same promise so the API
          // fires exactly once and both invocations get the same result.
          if (
            takeExamInFlightRef.current &&
            takeExamInFlightRef.current.examId === resolvedExamId
          ) {
            return takeExamInFlightRef.current.promise
          }
          const promise = startExam(resolvedExamId)
          takeExamInFlightRef.current = { examId: resolvedExamId, promise }
          // Clear once settled so the ref doesn’t block future retries
          promise.finally(() => {
            if (takeExamInFlightRef.current?.examId === resolvedExamId) {
              takeExamInFlightRef.current = null
            }
          })
          return promise
        })()

        // Bail out again after the async call — this is the critical check that
        // prevents the second StrictMode invocation from committing its session.
        if (activeLoadIdRef.current !== loadId) return

        let uId = null
        if (takeExamResult) {
          uId = takeExamResult.userExamId || takeExamResult.id || takeExamResult.data?.userExamId || takeExamResult.data?.id
          if (!uId && (typeof takeExamResult === 'string' || typeof takeExamResult === 'number')) {
            uId = takeExamResult
          }
        }

        if (!uId) {
          throw new Error('No userExamId returned from take-exam')
        }

        setUserExamId(uId)

        // 2) Fetch exam detail
        const examData = await getExamDetailInProgress(uId)

        if (activeLoadIdRef.current !== loadId) return
        if (!examData) {
          throw new Error('No exam detail data')
        }

        const mappedSections = mapExamToSections(examData)
        const restoredAnswers = restoreAnswersFromSections(mappedSections)

        setSections(mappedSections)
        const skillRemaining = examData.skillTimeRemaining || {}
        const backendCurrentSkill = (examData.currentSkill || '').toLowerCase()

        let initialSection = mappedSections.find(s => s.key === backendCurrentSkill)
        if (!initialSection) {
          initialSection = mappedSections.find(s => (skillRemaining[s.key] || 0) > 0)
        }
        if (!initialSection) initialSection = mappedSections[0]

        setActiveSectionKey(initialSection?.key || null)
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

        if (Object.keys(skillRemaining).length === 0) {
          mappedSections.forEach(s => {
            skillRemaining[s.key] = totalSeconds / mappedSections.length
          })
        }
        setSkillTimeRemaining(skillRemaining)

        const initialSectionKey = initialSection?.key || null
        const currentSkillSeconds = initialSectionKey ? (skillRemaining[initialSectionKey] || 0) : totalSeconds

        setTimeRemainingSeconds(currentSkillSeconds)
        setTimeRemaining(formatTime(currentSkillSeconds))

        const activeSectionQuestion = initialSection?.questions?.[0]
        setCurrentQuestion(activeSectionQuestion?.questionNumber || 1)
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
        if (activeLoadIdRef.current !== loadId) return
        console.error('Failed to load exam:', error)

        Alert.alert(
          'Không thể tải đề thi',
          'Đã có lỗi xảy ra khi lấy thông tin bài kiểm tra. Vui lòng thử lại sau.',
          [{ text: 'Đồng ý', onPress: () => router.push(isEntrance ? '/roadmap/info' : '/roadmap/learning') }]
        )
      } finally {
        if (activeLoadIdRef.current === loadId) {
          setIsLoading(false)
        }
      }
    }

    loadExam()

    // Cleanup: invalidate this loadId so any in-flight async work is discarded
    return () => {
      activeLoadIdRef.current = loadId + 1
    }
  }, [level, examKey, examId])

  // Countdown timer for the active skill
  useEffect(() => {
    if (isLoading || !activeSectionKey || isSubmitting) return

    const timer = setInterval(() => {
      setSkillTimeRemaining((prev) => {
        const currentSeconds = prev[activeSectionKey]
        if (typeof currentSeconds !== 'number' || currentSeconds <= 0) {
          return prev
        }
        return {
          ...prev,
          [activeSectionKey]: currentSeconds - 1,
        }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isLoading, activeSectionKey, isSubmitting])

  // Prevent accidental tab close/refresh on Web
  useEffect(() => {
    if (Platform.OS !== 'web') return

    const handleBeforeUnload = (e) => {
      // Only show warning if we are not currently in the submission process
      // and the exam has loaded.
      if (!isLoading && !isSubmitting) {
        e.preventDefault()
        e.returnValue = '' // Standard way to trigger browser's "Leave site?" dialog
        return ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [isLoading, isSubmitting])

  // Watch current skill time to update display and handle timeout
  useEffect(() => {
    const currentSeconds = skillTimeRemaining[activeSectionKey]
    if (typeof currentSeconds === 'number') {
      setTimeRemaining(formatTime(currentSeconds))
      setTimeRemainingSeconds(currentSeconds)

      if (currentSeconds <= 0 && !isLoading && !isSubmitting) {
        handleSectionTimeout()
      }
    }
  }, [activeSectionKey, skillTimeRemaining, isLoading, isSubmitting])

  const handleSectionTimeout = () => {
    // Luôn gọi handleSubmit(true) để sync đáp án và chuyển phần hoặc nộp bài dựa trên logic handleSubmit
    handleSubmit(true)
  }

  const performSectionSwitch = (sectionKey) => {
    const nextSection = sections.find((s) => s.key === sectionKey)
    const firstQuestion = nextSection?.questions?.[0]
    setActiveSectionKey(sectionKey)
    setCurrentQuestionIndex(0)
    setCurrentQuestion(firstQuestion?.questionNumber || 1)
  }

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


  // Handle question selection from dashboard
  const handleQuestionSelect = (questionNum) => {
    const activeSection = sections.find((s) => s.key === activeSectionKey)
    const questionList = activeSection?.questions || []
    const nextIndex = questionList.findIndex((q) => q.questionNumber === questionNum)
    if (nextIndex >= 0) {
      setCurrentQuestionIndex(nextIndex)
      setCurrentQuestion(questionNum)

      // Scroll to question on web
      if (Platform.OS === 'web') {
        const element = document.getElementById(`question-${questionNum}`)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }
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
        handleQuestionSelect(nextQuestion.questionNumber)
      }
    }
  }

  // Navigate to previous question
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1
      const prevQuestion = activeSection?.questions?.[prevIndex]
      if (prevQuestion) {
        handleQuestionSelect(prevQuestion.questionNumber)
      }
    }
  }

  // Handle submit
  const confirmSubmit = (message) =>
    new Promise((resolve) => {
      submitConfirmResolverRef.current = resolve
      setSubmitConfirmMessage(message || '')
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

  const handleSubmit = async (isAuto = false) => {
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      if (!userExamId) {
        if (isAuto !== true) {
          Alert.alert('Thông báo', 'Bạn đang làm đề mẫu. Kết quả không được lưu.')
        }
        setIsSubmitting(false)
        return
      }

      const activeSectionSnapshot = activeSection
      const activeSectionIndexSnapshot = activeSectionIndex
      const isLastSkill = activeSectionIndexSnapshot === sections.length - 1

      if (isAuto !== true) {
        const confirmText = isLastSkill
          ? 'Bạn có chắc chắn muốn nộp bài? Sau khi nộp, bạn sẽ không thể chỉnh sửa đáp án.'
          : `Bạn có chắc chắn muốn nộp phần thi ${activeSectionSnapshot?.label || ''} và chuyển sang phần tiếp theo?`

        const confirmed = await confirmSubmit(confirmText)
        if (!confirmed) {
          setIsSubmitting(false)
          return
        }
      }

      // 1) Sync tất cả đáp án (MCQ + Writing) trước khi submit/next-skill
      await syncAllAnswersBeforeSubmit()

      if (isLastSkill) {
        // timeRemainingSeconds logic only for final submit
        if (!isAuto) setTimeRemainingSeconds(0)

        // 2) Submit exam
        const submitResp = await apiClient.post(ENDPOINTS.USER_EXAM.SUBMIT, {
          userExamId,
        })

        const submittedUserExamId = submitResp?.data?.data?.userExamId || userExamId
        const isSubmitSuccess = submitResp?.data?.isSuccess !== false

        if (!isSubmitSuccess || !submittedUserExamId) {
          Alert.alert('Lỗi', 'Không thể nộp bài. Vui lòng thử lại.')
          setIsSubmitting(false)
          return
        }

        // 3) GET result để đảm bảo kết quả đã được tính toán
        try {
          const resultUrl = ENDPOINTS.USER_EXAM.RESULT(submittedUserExamId)
          await apiClient.get(resultUrl)
        } catch (resultError) {
          console.error('Failed to fetch result after grading:', resultError)
        }

        // 4) Navigate to result page
        router.push(
          `/roadmap/test/result?userExamId=${encodeURIComponent(
            submittedUserExamId
          )}&level=${encodeURIComponent(String(level))}&isEntrance=${isEntrance ? '1' : '0'}&taskId=${taskId || ''}`
        )
      } else {
        // Gọi next-skill API
        await apiClient.put(ENDPOINTS.USER_EXAM.NEXT_SKILL(userExamId))

        // Chuyển phần tiếp theo
        const nextSection = sections[activeSectionIndexSnapshot + 1]
        if (nextSection) {
          performSectionSwitch(nextSection.key)
        }
      }
    } catch (error) {
      console.error('Failed to submit exam/skill:', error)
      const activeSectionIndexSnapshot = sections.findIndex((s) => s.key === activeSectionKey)
      const isLastSkill = activeSectionIndexSnapshot === sections.length - 1
      const errorMsg = isLastSkill ? 'Không thể nộp bài. Vui lòng thử lại.' : 'Không thể chuyển phần. Vui lòng thử lại.'
      Alert.alert('Lỗi', errorMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChangeSection = (sectionKey, isAuto = false) => {
    if (sectionKey === activeSectionKey) return

    const currentIndex = sections.findIndex((s) => s.key === activeSectionKey)
    const targetIndex = sections.findIndex((s) => s.key === sectionKey)

    // Block going back to previous sections
    if (targetIndex < currentIndex) {
      setToastMessage('Bạn không thể quay lại phần thi đã qua.')
      setToastType('error')
      setToastVisible(true)
      return
    }

    // Chặn nhảy cóc qua các phần thi (ví dụ từ 1 nhảy lên 3 mà chưa qua 2)
    if (targetIndex > currentIndex + 1) {
      setToastMessage('Bạn phải thực hiện tuần tự các phần thi.')
      setToastType('error')
      setToastVisible(true)
      return
    }

    // Manual switch to next section requires confirmation
    if (!isAuto && targetIndex > currentIndex) {
      setPendingSectionKey(sectionKey)
      setSectionConfirmVisible(true)
      return
    }

    performSectionSwitch(sectionKey)
  }

  const handleConfirmSectionChange = async () => {
    if (pendingSectionKey && !isSubmitting) {
      setIsSubmitting(true)
      try {
        // Sync answers before switching via manual tab
        await syncAllAnswersBeforeSubmit()

        // Call next-skill API if transitioning forward
        if (userExamId) {
          await apiClient.put(ENDPOINTS.USER_EXAM.NEXT_SKILL(userExamId))
        }

        performSectionSwitch(pendingSectionKey)
      } catch (error) {
        console.error('Failed to switch section manually:', error)
        setToastMessage('Không thể chuyển phần. Vui lòng thử lại.')
        setToastType('error')
        setToastVisible(true)
      } finally {
        setIsSubmitting(false)
        setSectionConfirmVisible(false)
        setPendingSectionKey(null)
      }
    }
  }

  const handleCancelSectionChange = () => {
    setSectionConfirmVisible(false)
    setPendingSectionKey(null)
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

    // Navigate back: entrance tests go to info, others go to learning
    router.push(isEntrance ? '/roadmap/info' : '/roadmap/learning')
  }

  const activeSectionIndex = sections.findIndex((s) => s.key === activeSectionKey)
  const activeSection = sections[activeSectionIndex]
  const sectionQuestions = activeSection?.questions || []
  const currentQuestionData =
    sectionQuestions[currentQuestionIndex] ||
    sectionQuestions.find((q) => q.questionNumber === currentQuestion) ||
    sectionQuestions[0]

  const isLastSection = activeSectionIndex === sections.length - 1 && sections.length > 0


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
          style={({ pressed, hovered }) => [
            styles.headerCloseButton,
            hovered && styles.closeButtonHovered,
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
              <ClockCircleOutlined style={StyleSheet.flatten(styles.timerIcon)} />
              <Text style={styles.timerValue}>{timeRemaining}</Text>
            </View>
          </View>
        </View>

        <View style={styles.contentRow}>
          {/* Left: Question */}
          <View ref={questionListRef} style={styles.questionContainer}>
            {(() => {
              const groupedParts = []
              let currentPart = null

              sectionQuestions.forEach((q) => {
                const partKey = `${q.partTitle}|${q.partDescription}`
                if (!currentPart || currentPart.key !== partKey) {
                  currentPart = {
                    key: partKey,
                    title: q.partTitle,
                    description: q.partDescription,
                    groups: [],
                  }
                  groupedParts.push(currentPart)
                }
                
                // Group by groupId
                let currentGroup = currentPart.groups[currentPart.groups.length - 1]
                if (!currentGroup || currentGroup.id !== q.groupId) {
                  currentGroup = {
                    id: q.groupId,
                    sharedPassageContent: q.sharedPassageContent,
                    sharedPassageMediaUrl: q.sharedPassageMediaUrl,
                    // If all questions in group share the same audio/image, we can show it at group level
                    audioUrl: q.audioUrl,
                    imageUrl: q.imageUrl,
                    type: q.type,
                    questions: [],
                  }
                  currentPart.groups.push(currentGroup)
                }
                currentGroup.questions.push(q)
              })

              return groupedParts.map((part, pIdx) => (
                <View key={pIdx} style={styles.partGroup}>
                  {(part.title || part.description) && (
                    <View style={styles.instructionBox}>
                      {!!part.title && (
                        <Text style={styles.instructionTitle}>{String(part.title)}</Text>
                      )}
                      {!!part.description && (
                        <Text style={styles.instructionSubtitle}>{String(part.description)}</Text>
                      )}
                    </View>
                  )}
                  
                  <View style={styles.partGroupsList}>
                    {part.groups.map((group, gIdx) => {
                      const hasSharedContent = !!(group.sharedPassageContent || group.sharedPassageMediaUrl || group.audioUrl || group.imageUrl)

                      return (
                        <View key={group.id || gIdx} style={styles.groupCard}>
                          {hasSharedContent && (
                            <View style={styles.groupHeader}>
                              {group.sharedPassageMediaUrl && (
                                <Pressable 
                                  onPress={() => handleImagePreview(group.sharedPassageMediaUrl)}
                                  style={({ pressed }) => [
                                    styles.sharedImageWrapper,
                                    pressed && styles.imagePressed
                                  ]}
                                >
                                  <Image 
                                    source={normalizeImageSource(group.sharedPassageMediaUrl)} 
                                    style={styles.sharedImage} 
                                    resizeMode="contain"
                                  />
                                </Pressable>
                              )}
                              
                              {group.audioUrl && group.type === 'audio' && (
                                <View style={styles.sharedAudioWrapper}>
                                  {Platform.OS === 'web' ? (
                                    <audio controls src={group.audioUrl} style={{ width: '100%' }} />
                                  ) : (
                                    <Text style={styles.instructionSubtitle}>[Audio: {group.audioUrl}]</Text>
                                  )}
                                </View>
                              )}

                              {group.imageUrl && group.type === 'image' && (
                                <Pressable 
                                  onPress={() => handleImagePreview(group.imageUrl)}
                                  style={({ pressed }) => [
                                    styles.sharedImageWrapper,
                                    pressed && styles.imagePressed
                                  ]}
                                >
                                  <Image 
                                    source={normalizeImageSource(group.imageUrl)} 
                                    style={styles.sharedImage} 
                                    resizeMode="contain"
                                  />
                                </Pressable>
                              )}

                              {group.sharedPassageContent && renderHtmlText(group.sharedPassageContent, styles.sharedPassageText)}
                              
                              {/* Separator if there are questions below */}
                              {group.questions.length > 0 && <View style={styles.groupSeparator} />}
                            </View>
                          )}

                          <View style={styles.groupQuestionsList}>
                            {group.questions.map((q, qIdx) => (
                              <View
                                key={q.id || q.questionNumber}
                                id={Platform.OS === 'web' ? `question-${q.questionNumber}` : undefined}
                                style={[
                                  qIdx > 0 && styles.questionInGroupSeparator
                                ]}
                              >
                                <RoadmapTestQuestion
                                  questionNumber={q.questionNumber}
                                  type={hasSharedContent && (q.type === 'audio' || q.type === 'image') ? 'text' : q.type}
                                  questionText={q.questionText}
                                  audioUrl={hasSharedContent && q.type === 'audio' ? null : q.audioUrl}
                                  imageUrl={hasSharedContent && q.type === 'image' ? null : q.imageUrl}
                                  options={q.options}
                                  questionTypeCode={q.questionTypeCode}
                                  selectedAnswer={(answers[activeSectionKey] || {})[q.questionNumber]}
                                  onAnswerSelect={(val) => handleAnswerSelect(q.questionNumber, val)}
                                  onAnswerChange={(val) => {
                                    if (q.type === 'writing') {
                                      setAnswers((prev) => ({
                                        ...prev,
                                        [activeSectionKey]: {
                                          ...(prev[activeSectionKey] || {}),
                                          [q.questionNumber]: val,
                                        },
                                      }))
                                    }
                                  }}
                                  isMarked={(markedQuestions[activeSectionKey] || {})[q.questionNumber]}
                                  onToggleMark={() => handleToggleMark(q.questionNumber)}
                                  isFlat={true}
                                  onImagePreview={handleImagePreview}
                                />
                              </View>
                            ))}
                          </View>
                        </View>
                      )
                    })}
                  </View>
                </View>
              ))
            })()}

          </View>

          {/* Right: Dashboard */}
          <View style={styles.dashboardContainer}>
            <View style={[styles.sectionTabsRow, styles.dashboardHeaderTabs]}>
              {sections.map((section, index) => {
                const currentIndex = sections.findIndex((s) => s.key === activeSectionKey)
                const isPrevious = index < currentIndex
                const isFinished = skillTimeRemaining[section.key] <= 0 && section.key !== activeSectionKey
                const isActive = activeSectionKey === section.key

                let Icon = ReadOutlined
                if (section.key === 'listening') Icon = CustomerServiceOutlined
                if (section.key === 'writing') Icon = EditOutlined

                return (
                  <RoadmapTestButton
                    key={section.key}
                    onPress={() => handleChangeSection(section.key)}
                    disabled={isPrevious || isFinished || index > currentIndex + 1}
                    style={[
                      styles.sectionTab,
                      isActive && styles.sectionTabActive,
                      (isPrevious || isFinished) && styles.sectionTabDisabled,
                    ]}
                  >
                    <Icon style={StyleSheet.flatten([styles.sectionTabIcon, isActive && styles.sectionTabIconActive])} />
                    <Text style={StyleSheet.flatten([styles.sectionTabText, isActive && styles.sectionTabTextActive])}>
                      {section.label}
                    </Text>
                  </RoadmapTestButton>
                )
              })}
            </View>

            <RoadmapTestDashboard
              totalQuestions={sectionQuestions.length}
              questionNumbers={sectionQuestions.map((q) => q.questionNumber)}
              timeRemaining={timeRemaining}
              answers={answers[activeSectionKey] || {}}
              onAnswerSelect={handleAnswerSelect}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              isLastSection={isLastSection}
              currentQuestion={currentQuestion}
              onQuestionSelect={handleQuestionSelect}
              markedQuestions={markedQuestions[activeSectionKey] || {}}
            />

            <View style={[styles.navigationButtons, styles.dashboardNavigationButtons]}>
              {currentQuestionIndex > 0 ? (
                <RoadmapTestButton onPress={handlePrevQuestion} style={styles.navButtonLeft}>
                  <ArrowLeftOutlined style={StyleSheet.flatten(styles.navButtonIconLeft)} />
                </RoadmapTestButton>
              ) : (
                <View style={{ flex: 1 }} />
              )}
              {currentQuestionIndex < sectionQuestions.length - 1 && (
                <RoadmapTestButton onPress={handleNextQuestion} style={styles.navButtonRight}>
                  <ArrowRightOutlined style={StyleSheet.flatten(styles.navButtonIcon)} />
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
            <Text style={styles.confirmTitle}>Xác nhận</Text>
            <Text style={styles.confirmMessage}>
              {submitConfirmMessage || 'Bạn có chắc chắn muốn thực hiện hành động này?'}
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
                <Text style={styles.confirmButtonOkText}>
                  {isLastSection ? 'Nộp bài' : 'Xác nhận'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Section change confirm modal */}
      <Modal
        visible={sectionConfirmVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCancelSectionChange}
      >
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmModal}>
            <Text style={styles.confirmTitle}>Xác nhận chuyển phần thi</Text>
            <Text style={styles.confirmMessage}>
              Bạn có chắc chắn muốn kết thúc phần thi {activeSection?.label || 'này'} và chuyển sang phần thi tiếp theo?
              Một khi đã chuyển, bạn sẽ không thể quay lại để sửa đáp án của phần cũ.
            </Text>

            <View style={styles.confirmActions}>
              <Pressable
                onPress={handleCancelSectionChange}
                style={({ pressed, hovered }) => [
                  styles.confirmButton,
                  styles.confirmButtonCancel,
                  hovered && styles.confirmButtonHovered,
                  pressed && styles.confirmButtonPressed,
                ]}
              >
                <Text style={styles.confirmButtonCancelText}>Hủy</Text>
              </Pressable>
              <Pressable
                onPress={handleConfirmSectionChange}
                style={({ pressed, hovered }) => [
                  styles.confirmButton,
                  styles.confirmButtonOk,
                  hovered && styles.confirmButtonHovered,
                  pressed && styles.confirmButtonPressed,
                ]}
              >
                <Text style={styles.confirmButtonOkText}>Đồng ý</Text>
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
              style={({ pressed, hovered }) => [
                styles.closeButton,
                hovered && styles.closeButtonHovered,
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

      {/* Image Preview Modal */}
      <Modal
        visible={!!previewImage}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewImage(null)}
      >
        <Pressable 
          style={styles.previewOverlay} 
          onPress={() => setPreviewImage(null)}
        >
          <Pressable 
            onPress={handleBackToLearning}
            style={styles.previewCloseButton}
            onPressIn={() => setPreviewImage(null)}
          >
            <Text style={styles.previewCloseText}>×</Text>
          </Pressable>
          <View style={styles.previewImageContainer}>
            {previewImage && (
              <Image 
                source={normalizeImageSource(previewImage)} 
                style={styles.previewFullImage} 
                resizeMode="contain"
              />
            )}
          </View>
        </Pressable>
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
    ...(Platform.OS === 'web' && {
      transition: 'all 0.2s ease',
    }),
  },
  headerCloseButtonText: {
    fontSize: 24,
    fontWeight: '300',
    color: '#666',
    lineHeight: 24,
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
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#6366F1',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 8,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1F2937',
    fontFamily: 'Epilogue, sans-serif',
    letterSpacing: -0.3,
  },
  instructionSubtitle: {
    marginTop: 6,
    fontSize: 14,
    color: '#4B5563',
    fontFamily: 'Epilogue, sans-serif',
    fontWeight: '500',
    lineHeight: 20,
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 100,
    backgroundColor: '#FFF9EE',
    borderWidth: 1,
    borderColor: '#FFECC0',
    gap: 8,
    minWidth: 110,
    justifyContent: 'center',
  },
  timerIcon: {
    fontSize: 16,
    color: '#8D4E2A',
  },
  timerValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#8D4E2A',
    fontFamily: 'Epilogue, sans-serif',
  },
  contentRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 20,
    overflow: 'hidden',
  },
  questionContainer: {
    flex: 1.4,
    gap: 24,
    ...(Platform.OS === 'web' && {
      overflowY: 'auto',
      paddingRight: 12,
    }),
  },
  partGroup: {
    gap: 16,
    marginBottom: 32,
  },
  partGroupsList: {
    gap: 32,
  },
  groupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    gap: 8,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 12px 40px rgba(0,0,0,0.04)',
    }),
  },
  groupHeader: {
    gap: 20,
    marginBottom: 8,
  },
  sharedImage: {
    width: '100%',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    minHeight: 200,
  },
  sharedAudioWrapper: {
    width: '100%',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  sharedPassageText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 26,
    fontFamily: 'Epilogue, sans-serif',
    fontWeight: '500',
  },
  groupSeparator: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginTop: 8,
  },
  groupQuestionsList: {
    gap: 0,
  },
  questionInGroupSeparator: {
    borderTopWidth: 1,
    borderTopColor: '#F9FAFB',
    marginTop: 12,
    paddingTop: 12,
  },
  sharedImageWrapper: {
    width: '100%',
    ...(Platform.OS === 'web' && {
      cursor: 'zoom-in',
    }),
  },
  imagePressed: {
    opacity: 0.9,
  },
  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    ...(Platform.OS === 'web' && {
      backdropFilter: 'blur(10px)',
    }),
  },
  previewImageContainer: {
    width: '90%',
    height: '85%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewFullImage: {
    width: '100%',
    height: '100%',
  },
  previewCloseButton: {
    position: 'absolute',
    top: 30,
    right: 30,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  previewCloseText: {
    fontSize: 36,
    color: '#FFFFFF',
    fontWeight: '300',
    lineHeight: 40,
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
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#F0F2F5', // Light gray background
    width: '100%',
    gap: 4,
    marginBottom: 8,
  },
  sectionTab: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 0,
    paddingHorizontal: 0,
    borderWidth: 0,
  },
  sectionTabActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 0,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    }),
  },
  sectionTabText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#667085',
  },
  sectionTabTextActive: {
    color: '#6366F1',
  },
  sectionTabIcon: {
    fontSize: 18,
    color: '#667085',
  },
  sectionTabIconActive: {
    color: '#6366F1',
  },
  sectionTabDisabled: {
    opacity: 0.5,
    backgroundColor: '#E0E0E0',
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
    backgroundColor: '#F5F5F5',
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
  navButtonIconLeft: {
    fontSize: 16,
    color: '#666666',
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    ...(Platform.OS === 'web' && {
      transition: 'all 0.2s ease',
    }),
  },
  closeButtonHovered: {
    backgroundColor: '#E0E0E0',
    transform: [{ scale: 1.1 }],
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: '300',
    color: '#666',
    lineHeight: 24,
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
    ...(Platform.OS === 'web' && {
      transition: 'all 0.2s ease',
    }),
  },
  confirmButtonHovered: {
    opacity: 0.9,
    transform: [{ translateY: -2 }],
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


