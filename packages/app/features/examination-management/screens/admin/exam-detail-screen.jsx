'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'solito/navigation'
import { Card, Space, Typography, Spin, Alert, Descriptions, Tag, Divider, message, Modal, Button, Tooltip, Popconfirm, Row, Col, Badge, List, Empty } from 'antd'
import { EditOutlined, EyeOutlined, UndoOutlined, SaveOutlined, SyncOutlined } from '@ant-design/icons'
import { useExamDetailAdmin } from '../../api/exam-hooks.js'
import { fetchExamDetailAdmin, regenerateExamPart, updateExamQuestion, updateExamStatus } from '../../api/exam-management.js'
import { useQueryClient } from '@tanstack/react-query'
import ExamStatusChangeModal from '../../components/admin/exam-detail/exam-status-change-modal.jsx'
import ExamQuestionSelectModal from '../../components/admin/exam-detail/exam-question-select-modal.jsx'
import EditExamInfoModal from '../../components/admin/exam-detail/edit-exam-info-modal.jsx'

const { Title, Text, Paragraph } = Typography

// Map status enum values to display text
const STATUS_MAP = {
  0: { color: 'default', text: 'Nháp' },
  1: { color: 'green', text: 'Đã xuất bản' },
  2: { color: 'red', text: 'Đã xóa' },
}

// Map type enum values to display text
const TYPE_MAP = {
  1: 'TOPIK I',
  2: 'TOPIK II',
}

const SKILL_MAP = {
  listening: 'Nghe',
  reading: 'Đọc',
  writing: 'Viết',
  writting: 'Viết',
}

const getSkillLabel = (skill) => {
  if (!skill) return '-'
  return SKILL_MAP[skill.toLowerCase()] || skill
}

export function ExamDetailScreen() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const params = useParams()
  const examId = params?.id
  const [statusChangeModalOpen, setStatusChangeModalOpen] = useState(false)
  const [statusChangeLoading, setStatusChangeLoading] = useState(false)
  const [editInfoModalOpen, setEditInfoModalOpen] = useState(false)
  const [templatePartsState, setTemplatePartsState] = useState(null)
  const [questionSelectModalOpen, setQuestionSelectModalOpen] = useState(false)
  const [currentTemplatePartId, setCurrentTemplatePartId] = useState(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(null)
  const [pendingSelectedQuestion, setPendingSelectedQuestion] = useState(null)
  const [confirmQuestionModalOpen, setConfirmQuestionModalOpen] = useState(false)
  const [highlightedQuestions, setHighlightedQuestions] = useState([]) // array of "templatePartId:questionIndex"
  const [previousQuestionsMap, setPreviousQuestionsMap] = useState({}) // { [key]: oldQuestion }
  const [oldQuestionModalOpen, setOldQuestionModalOpen] = useState(false)
  const [oldQuestionModalData, setOldQuestionModalData] = useState(null)
  const [pendingExamQuestionUpdates, setPendingExamQuestionUpdates] = useState({}) // { [key]: { questionNo, questionBankId, newQuestionSnapshot } }
  const [savingUpdateKey, setSavingUpdateKey] = useState(null)
  const [bulkSaving, setBulkSaving] = useState(false)
  const [regeneratingPartId, setRegeneratingPartId] = useState(null)
  const pendingUpdatesRef = useRef(pendingExamQuestionUpdates)

  const { data: exam, isLoading, error } = useExamDetailAdmin(examId)

  useEffect(() => {
    if (exam && !templatePartsState) {
      setTemplatePartsState(exam.templateParts || [])
    }
  }, [exam, templatePartsState])

  useEffect(() => {
    pendingUpdatesRef.current = pendingExamQuestionUpdates
  }, [pendingExamQuestionUpdates])

  const applyPendingUpdatesToParts = (parts, pendingMap) => {
    if (!Array.isArray(parts)) return parts
    const entries = Object.entries(pendingMap || {})
    if (entries.length === 0) return parts

    return parts.map((part) => {
      const partId = part?.templatePartId
      if (!partId) return part
      const questions = Array.isArray(part.questions) ? part.questions : []
      if (questions.length === 0) return part

      // apply updates by (templatePartId, questionIndex)
      const updatedQuestions = questions.map((q, idx) => {
        const key = `${partId}:${idx}`
        const payload = pendingMap?.[key]
        if (!payload?.newQuestionSnapshot) return q
        const questionNo = q?.questionNo || idx + 1
        return { ...payload.newQuestionSnapshot, questionNo }
      })

      return { ...part, questions: updatedQuestions }
    })
  }

  const refreshTemplatePartsFromServer = async (idToUpdate, pendingMapOverride) => {
    const pendingMap = pendingMapOverride ?? pendingUpdatesRef.current
    const fresh = await fetchExamDetailAdmin(idToUpdate)
    const freshParts = fresh?.templateParts || []
    const merged = applyPendingUpdatesToParts(freshParts, pendingMap)
    setTemplatePartsState(merged)
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="Lỗi"
          description={error?.message || 'Không thể tải thông tin đề thi.'}
          type="error"
          showIcon
        />
      </div>
    )
  }

  if (!exam) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="Không tìm thấy"
          description="Không tìm thấy đề thi với ID này."
          type="warning"
          showIcon
        />
      </div>
    )
  }

  const statusInfo = STATUS_MAP[exam.status] || { color: 'default', text: `Status ${exam.status}` }
  const typeText = TYPE_MAP[exam.type] || exam.type
  // Không cho phép chỉnh sửa nếu đề đang hoạt động (1) hoặc đã xóa (2)
  const isLockedExam = exam.status === 1 || exam.status === 2

  const handleOpenStatusModal = () => {
    if (isLockedExam) {
      message.info('Đề thi này không cho phép thay đổi trạng thái.')
      return
    }
    setStatusChangeModalOpen(true)
  }

  const handleSubmitStatusChange = async (values) => {
    const idToUpdate = exam?.examId || examId
    if (!idToUpdate) return

    const newStatus = values?.status

    try {
      setStatusChangeLoading(true)
      await updateExamStatus(idToUpdate, newStatus)
      message.success(`Đã chuyển trạng thái sang "${STATUS_MAP?.[newStatus]?.text || `Status ${newStatus}`}" thành công`)
      await queryClient.invalidateQueries({ queryKey: ['exam', 'admin', 'detail', idToUpdate] })
      await queryClient.invalidateQueries({ queryKey: ['exams', 'admin'] })
      setStatusChangeModalOpen(false)
    } catch (err) {
      message.error(err?.response?.data?.message || err?.message || 'Chuyển trạng thái thất bại')
    } finally {
      setStatusChangeLoading(false)
    }
  }

  const handleOpenEditInfoModal = () => {
    if (isLockedExam) {
      message.info('Đề thi này không cho phép chỉnh sửa thông tin.')
      return
    }
    setEditInfoModalOpen(true)
  }

  const handleSubmitEditInfo = async () => {
    const idToUpdate = exam?.examId || examId
    if (!idToUpdate) return

    try {
      await queryClient.invalidateQueries({ queryKey: ['exam', 'admin', 'detail', idToUpdate] })
      await queryClient.invalidateQueries({ queryKey: ['exams', 'admin'] })
      // Refresh template parts nếu có thay đổi examTemplateId
      await refreshTemplatePartsFromServer(idToUpdate, pendingUpdatesRef.current)
    } catch (err) {
      console.error('Failed to refresh exam data after edit', err)
    }
  }

  const handleOpenQuestionSelectModal = (templatePartId, questionIndex) => {
    if (isLockedExam) {
      message.info('Đề thi này không cho phép thay đổi câu hỏi.')
      return
    }
    setCurrentTemplatePartId(templatePartId)
    setCurrentQuestionIndex(questionIndex)
    setQuestionSelectModalOpen(true)
  }

  const handleSelectQuestion = (selectedQuestion) => {
    if (isLockedExam) {
      message.info('Đề thi này không cho phép thay đổi câu hỏi.')
      return
    }
    // Lưu câu vừa chọn và mở modal xem trước để xác nhận
    setPendingSelectedQuestion(selectedQuestion)
    setConfirmQuestionModalOpen(true)
    setQuestionSelectModalOpen(false)
  }

  const handleConfirmSelectedQuestion = () => {
    if (isLockedExam) {
      message.info('Đề thi này không cho phép thay đổi câu hỏi.')
      setConfirmQuestionModalOpen(false)
      setPendingSelectedQuestion(null)
      return
    }
    if (!currentTemplatePartId || currentQuestionIndex == null || !pendingSelectedQuestion) {
      setConfirmQuestionModalOpen(false)
      setPendingSelectedQuestion(null)
      return
    }

    const key = `${currentTemplatePartId}:${currentQuestionIndex}`
    const oldQuestionSnapshot =
      templatePartsState?.find((p) => p.templatePartId === currentTemplatePartId)?.questions?.[currentQuestionIndex] || null
    if (oldQuestionSnapshot) {
      setPreviousQuestionsMap((prev) => ({ ...prev, [key]: oldQuestionSnapshot }))
    }

    const nextQuestionBankId = pendingSelectedQuestion?.questionBankId || pendingSelectedQuestion?.id

    setTemplatePartsState((prev) => {
      if (!prev) return prev
      return prev.map((part) => {
        if (part.templatePartId !== currentTemplatePartId) return part

        const questions = part.questions || []
        const updatedQuestions = questions.map((q, idx) => {
          if (idx !== currentQuestionIndex) return q

          const questionNo = q.questionNo || idx + 1
          return {
            ...pendingSelectedQuestion,
            questionNo,
          }
        })

        return {
          ...part,
          questions: updatedQuestions,
        }
      })
    })

    // Highlight the updated question card in UI (yellow background) permanently (until page refresh)
    setHighlightedQuestions((prev) => (prev.includes(key) ? prev : [...prev, key]))

    // Track pending save payload (examId + questionNo + questionBankId)
    if (nextQuestionBankId) {
      const currentQuestionNo =
        templatePartsState?.find((p) => p.templatePartId === currentTemplatePartId)?.questions?.[currentQuestionIndex]?.questionNo ||
        currentQuestionIndex + 1
      setPendingExamQuestionUpdates((prev) => ({
        ...prev,
        [key]: { questionNo: currentQuestionNo, questionBankId: nextQuestionBankId, newQuestionSnapshot: pendingSelectedQuestion },
      }))
    }

    setConfirmQuestionModalOpen(false)
    setPendingSelectedQuestion(null)
    setCurrentTemplatePartId(null)
    setCurrentQuestionIndex(null)
  }

  const handleBackToQuestionList = () => {
    setConfirmQuestionModalOpen(false)
    setPendingSelectedQuestion(null)
    setQuestionSelectModalOpen(true)
  }

  const handleCancelConfirmQuestion = () => {
    setConfirmQuestionModalOpen(false)
    setPendingSelectedQuestion(null)
  }

  const handleViewOldQuestion = (templatePartId, questionIndex) => {
    const key = `${templatePartId}:${questionIndex}`
    const oldQ = previousQuestionsMap?.[key]
    if (!oldQ) {
      message.info('Chưa có câu cũ để xem (chỉ có sau khi bạn đã đổi câu).')
      return
    }
    setOldQuestionModalData(oldQ)
    setOldQuestionModalOpen(true)
  }

  const handleUndoQuestion = (templatePartId, questionIndex) => {
    if (isLockedExam) {
      message.info('Đề thi này không cho phép hoàn tác câu hỏi.')
      return
    }
    const key = `${templatePartId}:${questionIndex}`
    const oldQ = previousQuestionsMap?.[key]
    if (!oldQ) {
      message.info('Không có dữ liệu câu cũ để hoàn tác.')
      return
    }

    setTemplatePartsState((prev) => {
      if (!prev) return prev
      return prev.map((part) => {
        if (part.templatePartId !== templatePartId) return part
        const questions = part.questions || []
        const updatedQuestions = questions.map((q, idx) => {
          if (idx !== questionIndex) return q
          const questionNo = q.questionNo || idx + 1
          return { ...oldQ, questionNo }
        })
        return { ...part, questions: updatedQuestions }
      })
    })

    setHighlightedQuestions((prev) => prev.filter((k) => k !== key))
    setPendingExamQuestionUpdates((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
    setPreviousQuestionsMap((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
    message.success('Đã hoàn tác về câu cũ.')
  }

  const handleSaveSingleChange = (templatePartId, questionIndex) => {
    if (isLockedExam) {
      message.info('Đề thi này không cho phép lưu thay đổi.')
      return
    }
    const key = `${templatePartId}:${questionIndex}`
    const payload = pendingExamQuestionUpdates?.[key]
    const idToUpdate = exam?.examId || examId
    if (!idToUpdate) return
    if (!payload?.questionBankId || !payload?.questionNo) {
      message.info('Câu này chưa có thay đổi để lưu.')
      return
    }

    Modal.confirm({
      title: 'Xác nhận lưu thay đổi câu hỏi',
      content: (
        <div>
          <div>
            <b>Exam ID:</b> {idToUpdate}
          </div>
          <div>
            <b>Question No:</b> {payload.questionNo}
          </div>
          <div>
            <b>QuestionBankId mới:</b> {payload.questionBankId}
          </div>
        </div>
      ),
      okText: 'Lưu đổi',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          setSavingUpdateKey(key)
          const res = await updateExamQuestion({
            examId: idToUpdate,
            questionBankId: payload.questionBankId,
            questionNo: payload.questionNo,
          })
          message.success(res?.data || res?.message || 'Đã cập nhật câu hỏi mới thành công.')
          const nextPending = { ...(pendingUpdatesRef.current || {}) }
          delete nextPending[key]
          setPendingExamQuestionUpdates(nextPending)
          setHighlightedQuestions((prev) => prev.filter((k) => k !== key))
          await queryClient.invalidateQueries({ queryKey: ['exam', 'admin', 'detail', idToUpdate] })
          await refreshTemplatePartsFromServer(idToUpdate, nextPending)
        } catch (err) {
          message.error(err?.response?.data?.message || err?.message || 'Lưu thay đổi thất bại')
        } finally {
          setSavingUpdateKey(null)
        }
      },
    })
  }

  const handleSaveBulkChanges = () => {
    if (isLockedExam) {
      message.info('Đề thi này không cho phép lưu thay đổi.')
      return
    }
    const idToUpdate = exam?.examId || examId
    if (!idToUpdate) return
    const entries = Object.entries(pendingExamQuestionUpdates || {})
    if (entries.length === 0) {
      message.info('Không có thay đổi nào để lưu.')
      return
    }

    Modal.confirm({
      title: 'Xác nhận lưu thay đổi hàng loạt',
      content: (
        <div>
          <div style={{ marginBottom: 8 }}>
            Bạn sắp lưu <b>{entries.length}</b> thay đổi.
          </div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>
            Hệ thống sẽ gọi API lần lượt cho từng câu (PUT /Exams/update-exam-question).
          </div>
        </div>
      ),
      okText: 'Lưu đổi hàng loạt',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          setBulkSaving(true)
          for (const [, payload] of entries) {
            if (!payload?.questionBankId || !payload?.questionNo) continue
            await updateExamQuestion({
              examId: idToUpdate,
              questionBankId: payload.questionBankId,
              questionNo: payload.questionNo,
            })
          }
          message.success('Đã lưu toàn bộ thay đổi thành công.')
          setPendingExamQuestionUpdates({})
          setHighlightedQuestions([])
          setPreviousQuestionsMap({})
          await queryClient.invalidateQueries({ queryKey: ['exam', 'admin', 'detail', idToUpdate] })
          await refreshTemplatePartsFromServer(idToUpdate, {})
        } catch (err) {
          message.error(err?.response?.data?.message || err?.message || 'Lưu hàng loạt thất bại')
        } finally {
          setBulkSaving(false)
        }
      },
    })
  }

  const handleRegenerateTemplatePart = async (templatePartId) => {
    if (isLockedExam) {
      message.info('Đề thi này không cho phép đổi lại bộ câu hỏi.')
      return
    }
    const idToUpdate = exam?.examId || examId
    if (!idToUpdate || !templatePartId) return

    try {
      setRegeneratingPartId(templatePartId)
      const res = await regenerateExamPart({ examId: idToUpdate, templatePartId })

      // Clear only local pending changes for THIS part (avoid wiping user work in other parts)
      const currentPending = pendingUpdatesRef.current || {}
      const nextPending = { ...currentPending }
      for (const key of Object.keys(nextPending)) {
        if (key.startsWith(`${templatePartId}:`)) delete nextPending[key]
      }
      pendingUpdatesRef.current = nextPending
      setPendingExamQuestionUpdates(nextPending)
      setHighlightedQuestions((prev) => prev.filter((k) => !k.startsWith(`${templatePartId}:`)))
      setPreviousQuestionsMap((prev) => {
        const next = { ...(prev || {}) }
        for (const key of Object.keys(next)) {
          if (key.startsWith(`${templatePartId}:`)) delete next[key]
        }
        return next
      })

      message.success(res?.message || 'Đã regenerate (random) lại bộ câu hỏi của phần này.')
      await queryClient.invalidateQueries({ queryKey: ['exam', 'admin', 'detail', idToUpdate] })
      await refreshTemplatePartsFromServer(idToUpdate, nextPending)
    } catch (err) {
      message.error(err?.response?.data?.message || err?.message || 'Đổi lại bộ câu hỏi phần thi thất bại')
    } finally {
      setRegeneratingPartId(null)
    }
  }

  // Group consecutive questions that share the same passage/media
  const groupQuestionsByPassage = (questions) => {
    if (!questions || questions.length === 0) return []
    const groups = []
    let currentGroup = null

    questions.forEach((q, qIndex) => {
      // Create a unique key for the passage/media context
      const passageKey = `${q.passageContent || ''}|${q.passageImageUrl || ''}|${q.passageAudioUrl || ''}`
      const hasPassage = !!q.passageContent || !!q.passageImageUrl || !!q.passageAudioUrl

      if (hasPassage && currentGroup && currentGroup.passageKey === passageKey) {
        currentGroup.questions.push({ ...q, originalIndex: qIndex })
      } else {
        currentGroup = {
          passageKey,
          passageContent: q.passageContent,
          passageImageUrl: q.passageImageUrl,
          passageAudioUrl: q.passageAudioUrl,
          questions: [{ ...q, originalIndex: qIndex }],
          isGroup: hasPassage,
        }
        groups.push(currentGroup)
      }
    })
    return groups
  }

  // Calculate status statistics for the navigator
  const getQuestionStatus = (partId, qIndex) => {
    const key = `${partId}:${qIndex}`
    if (savingUpdateKey === key) return 'processing'
    if (pendingExamQuestionUpdates?.[key]) return 'warning'
    if (highlightedQuestions.includes(key)) return 'success'
    return 'default'
  }

  return (
    <div style={{ padding: '0px' }}>
      <div style={{ maxWidth: '100%', margin: '0 auto', width: '100%' }}>
        {/* Page Header */}
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2} style={{ margin: 0, color: '#1a1a1a' }}>
              Quản lý Bộ đề thi
            </Title>
            <Text type="secondary">Cấu hình câu hỏi và nội dung chi tiết cho đề thi ID: {exam.examId}</Text>
          </div>
          <Space size="middle">
            <Button
              onClick={() => router.push('/admin?tab=exam-management')}
              icon={<UndoOutlined />}
              style={{ borderRadius: '8px' }}
            >
              Quay lại danh sách
            </Button>
            <Button
              type="primary"
              onClick={handleOpenStatusModal}
              disabled={statusChangeLoading || isLockedExam}
              style={{ borderRadius: '8px', boxShadow: '0 2px 4px rgba(24, 144, 255, 0.2)' }}
            >
              Cập nhật trạng thái
            </Button>
          </Space>
        </div>

        <Row gutter={[24, 24]}>
          {/* Main Content: Question List */}
          <Col xs={24} lg={18}>
            <Space orientation="vertical" size="large" style={{ width: '100%' }}>
              {/* Basic Info Card */}
              <Card
                variant="borderless"
                style={{
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  border: '1px solid #f0f0f0',
                }}
                styles={{ body: { padding: '16px 20px' } }}
                title={
                  <Space size="small">
                    <div style={{ width: '3px', height: '14px', background: '#1890ff', borderRadius: '4px' }} />
                    <Text strong style={{ fontSize: '14px', color: '#262626' }}>Thông tin tổng quan</Text>
                  </Space>
                }
                extra={
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={handleOpenEditInfoModal}
                    disabled={isLockedExam}
                    style={{ fontSize: '12px', color: '#1890ff' }}
                    size="small"
                  >
                    Sửa
                  </Button>
                }
              >
                <Descriptions
                  column={{ xxl: 4, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }}
                  size="small"
                  layout="horizontal"
                  bordered={false}
                  styles={{
                    label: { color: '#8c8c8c', fontWeight: 400, fontSize: '13px' },
                    content: { color: '#262626', fontSize: '13px', fontWeight: 500 }
                  }}
                >
                  <Descriptions.Item label="Tiêu đề" span={3}>{exam.title || '-'}</Descriptions.Item>
                  <Descriptions.Item label="Loại đề">
                    <Tag color="blue" variant="filled" style={{ borderRadius: '4px', fontSize: '11px', margin: 0 }}>{typeText}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Trạng thái">
                    <Badge
                      status={statusInfo.color === 'green' ? 'success' : statusInfo.color === 'red' ? 'error' : 'default'}
                      text={statusInfo.text}
                      style={{ fontSize: '13px' }}
                    />
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày tạo">
                    {exam.createdAt ? new Date(exam.createdAt).toLocaleDateString('vi-VN') : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Thời lượng" span={2}>
                    {exam.skillDurations && Object.keys(exam.skillDurations).length > 0 ? (
                      <Space size="middle" wrap style={{ marginTop: '2px' }}>
                        {Object.entries(exam.skillDurations).map(([skill, time]) => (
                          <Space key={skill} size={4}>
                            <Text type="secondary" style={{ fontSize: '12px' }}>{getSkillLabel(skill)}:</Text>
                            <Text strong style={{ fontSize: '12px' }}>{time}′</Text>
                          </Space>
                        ))}
                        <Tag color="blue" style={{ borderRadius: '4px', border: 'none', background: '#e6f7ff', color: '#1890ff', fontWeight: 600 }}>
                          Tổng {Object.values(exam.skillDurations).reduce((a, b) => a + b, 0)} phút
                        </Tag>
                      </Space>
                    ) : (
                      `${exam.duration || 0} phút`
                    )}
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              {/* Template Parts & Questions */}
              {templatePartsState && templatePartsState.length > 0 ? (
                templatePartsState.map((templatePart, partIndex) => {
                  const partId = templatePart?.templatePartId
                  const partPendingCount = Object.keys(pendingExamQuestionUpdates || {}).filter((k) => k.startsWith(`${partId}:`)).length
                  const isRegenerating = regeneratingPartId === partId
                  const canRegenerate = !!partId && !isRegenerating && !isLockedExam
                  const passageGroups = groupQuestionsByPassage(templatePart.questions)

                  return (
                    <div key={partId || partIndex} id={`part-${partId}`} style={{ marginBottom: '32px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <Title level={4} style={{ margin: 0 }}>
                            Phần {partIndex + 1}: {templatePart.templatePartsTitle || 'Nội dung thi'}
                          </Title>
                          {partPendingCount > 0 && <Badge count={partPendingCount} style={{ backgroundColor: '#faad14' }} />}
                        </div>
                        <Popconfirm
                          title="Bạn muốn đổi ngẫu nhiên toàn bộ câu hỏi của phần này?"
                          onConfirm={() => handleRegenerateTemplatePart(partId)}
                          disabled={!canRegenerate}
                          okText="Đổi lại"
                          cancelText="Hủy"
                        >
                          <Button
                            icon={<SyncOutlined spin={isRegenerating} />}
                            disabled={!canRegenerate}
                            type="dashed"
                            danger={partPendingCount > 0}
                          >
                            Tạo lại phần này
                          </Button>
                        </Popconfirm>
                      </div>

                      {passageGroups.length > 0 ? (
                        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                          {passageGroups.map((group, groupIdx) => (
                            <div key={groupIdx} style={{ 
                              background: '#fff', 
                              borderRadius: '12px', 
                              overflow: 'hidden', 
                              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                              border: '1px solid #e8e8e8'
                            }}>
                              {/* Shared Passage Header */}
                              {group.isGroup && (
                                <div style={{ padding: '20px', background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                                  <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                                    {(group.passageImageUrl || group.passageAudioUrl) && (
                                      <div style={{ flex: '0 0 300px', maxWidth: '100%' }}>
                                        {group.passageImageUrl && (
                                          <img src={group.passageImageUrl} alt="Passage" style={{ width: '100%', borderRadius: '8px', border: '1px solid #eee' }} />
                                        )}
                                        {group.passageAudioUrl && (
                                          <audio controls src={group.passageAudioUrl} style={{ width: '100%', marginTop: '8px' }} />
                                        )}
                                      </div>
                                    )}
                                    <div style={{ flex: 1, minWidth: '300px' }}>
                                      <Text strong style={{ fontSize: '13px', color: '#8c8c8c', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>
                                        Nội dung chung (Câu {group.questions[0].questionNo} - {group.questions[group.questions.length - 1].questionNo})
                                      </Text>
                                      <Paragraph style={{ fontSize: '15px', whiteSpace: 'pre-wrap', margin: 0 }}>
                                        {group.passageContent}
                                      </Paragraph>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Questions in this group */}
                              <div style={{ padding: '8px 0' }}>
                                {group.questions.map((question, innerIdx) => {
                                  const qIdx = question.originalIndex
                                  const highlightKey = `${partId}:${qIdx}`
                                  const isHighlighted = highlightedQuestions.includes(highlightKey)
                                  const isPending = !!pendingExamQuestionUpdates?.[highlightKey]

                                  return (
                                    <div 
                                      key={qIdx} 
                                      id={`q-${partId}-${qIdx}`}
                                      style={{ 
                                        padding: '24px',
                                        background: isHighlighted ? '#fffbe6' : 'transparent',
                                        borderBottom: innerIdx < group.questions.length - 1 ? '1px solid #f0f0f0' : 'none',
                                        transition: 'all 0.3s'
                                      }}
                                    >
                                      {/* Question Header & Content */}
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                        <div style={{ display: 'flex', gap: '16px', flex: 1 }}>
                                          <Badge 
                                            count={question.questionNo} 
                                            style={{ backgroundColor: isPending ? '#faad14' : isHighlighted ? '#52c41a' : '#595959', fontSize: '14px', height: '24px', lineHeight: '24px', minWidth: '24px' }}
                                          />
                                          <div style={{ flex: 1 }}>
                                            {question.mediaUrl && (
                                              <div style={{ marginBottom: '16px' }}>
                                                {question.mediaType === 'Image' ? (
                                                  <img src={question.mediaUrl} alt="Question" style={{ maxWidth: '400px', borderRadius: '8px', border: '1px solid #eee' }} />
                                                ) : <audio controls src={question.mediaUrl} style={{ minWidth: '300px' }} />}
                                              </div>
                                            )}
                                            <Paragraph style={{ fontSize: '17px', fontWeight: 500, margin: 0 }}>
                                              {question.content}
                                            </Paragraph>
                                          </div>
                                        </div>
                                        
                                        {/* Actions Toolbar */}
                                        <div style={{ marginLeft: '16px' }}>
                                          <Space>
                                            <Tooltip title="Thay đổi câu hỏi này">
                                              <Button 
                                                shape="circle" 
                                                icon={<EditOutlined />} 
                                                onClick={() => !isLockedExam && handleOpenQuestionSelectModal(partId, qIdx)}
                                                disabled={isLockedExam}
                                              />
                                            </Tooltip>
                                            <Tooltip title="Hoàn tác">
                                              <Button 
                                                shape="circle" 
                                                icon={<UndoOutlined />} 
                                                onClick={() => handleUndoQuestion(partId, qIdx)}
                                                disabled={isLockedExam || !previousQuestionsMap[`${partId}:${qIdx}`]}
                                              />
                                            </Tooltip>
                                            <Tooltip title="Xem câu gốc">
                                              <Button 
                                                shape="circle" 
                                                icon={<EyeOutlined />} 
                                                onClick={() => handleViewOldQuestion(partId, qIdx)}
                                              />
                                            </Tooltip>
                                            {isPending && (
                                              <Tooltip title="Lưu thay đổi câu này">
                                                <Button 
                                                  type="primary"
                                                  shape="circle" 
                                                  icon={<SaveOutlined />} 
                                                  loading={savingUpdateKey === highlightKey}
                                                  onClick={() => handleSaveSingleChange(partId, qIdx)}
                                                />
                                              </Tooltip>
                                            )}
                                          </Space>
                                        </div>
                                      </div>

                                      {/* Options */}
                                      {question.options && question.options.length > 0 && (
                                        <div style={{ paddingLeft: '40px' }}>
                                          <Row gutter={[16, 16]}>
                                            {question.options.map((option, optIndex) => {
                                              const hasImage = !!option.imageUrl
                                              return (
                                                <Col span={12} key={optIndex}>
                                                  <div style={{
                                                    padding: '12px 16px',
                                                    borderRadius: '8px',
                                                    border: option.isCorrect ? '2px solid #52c41a' : '1px solid #f0f0f0',
                                                    backgroundColor: option.isCorrect ? '#f6ffed' : '#fff',
                                                    height: '100%',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '12px',
                                                    transition: 'all 0.2s ease',
                                                    boxShadow: option.isCorrect ? '0 2px 4px rgba(82, 196, 26, 0.1)' : 'none'
                                                  }}>
                                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                                      <div style={{ 
                                                        width: '28px', 
                                                        height: '28px', 
                                                        minWidth: '28px',
                                                        borderRadius: '50%', 
                                                        backgroundColor: option.isCorrect ? '#52c41a' : '#f0f0f0',
                                                        color: option.isCorrect ? '#fff' : '#8c8c8c',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '13px',
                                                        fontWeight: 'bold'
                                                      }}>
                                                        {option.keyOption || String.fromCharCode(65 + optIndex)}
                                                      </div>
                                                      <Text style={{ fontSize: '15px' }}>{option.content || '-'}</Text>
                                                    </div>
                                                    {hasImage && (
                                                      <div style={{ textAlign: 'center', marginTop: '4px' }}>
                                                        <img 
                                                          src={option.imageUrl} 
                                                          alt={`Option ${optIndex}`} 
                                                          style={{ maxHeight: '120px', maxWidth: '100%', borderRadius: '4px', objectFit: 'contain' }} 
                                                        />
                                                      </div>
                                                    )}
                                                  </div>
                                                </Col>
                                              )
                                            })}
                                          </Row>
                                        </div>
                                      )}

                                      {/* Explanation */}
                                      {question.explanation && (
                                        <div style={{ marginTop: '16px', marginLeft: '40px', padding: '12px 16px', background: '#e6f7ff', borderRadius: '8px', borderLeft: '4px solid #1890ff' }}>
                                          <Text strong style={{ color: '#1890ff', fontSize: '13px', display: 'block', marginBottom: '4px' }}>GIẢI THÍCH:</Text>
                                          <Paragraph style={{ margin: 0, color: '#434343' }}>{question.explanation}</Paragraph>
                                        </div>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          ))}
                        </Space>
                      ) : (
                        <Alert message="Không có câu hỏi trong phần này." type="info" />
                      )}
                    </div>
                  )
                })
              ) : (
                <Empty description="Không có cấu trúc đề thi" />
              )}
            </Space>
          </Col>

          {/* Right Sider: Navigator & Summary */}
          <Col xs={0} lg={6}>
            <div style={{ position: 'sticky', top: '0px', zIndex: 10 }}>
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {/* Navigator */}
                <Card 
                  title="Danh sách câu hỏi" 
                  bordered={false} 
                  style={{ borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
                  bodyStyle={{ maxHeight: 'calc(100vh - 400px)', overflowY: 'auto', padding: '12px' }}
                >
                  {templatePartsState?.map((part, pIdx) => (
                    <div key={pIdx} style={{ marginBottom: '24px' }}>
                      <div style={{ paddingLeft: '4px', marginBottom: '12px' }}>
                        <Text type="secondary" style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 800, color: '#bfbfbf', letterSpacing: '0.1em', display: 'block' }}>
                          PHẦN {pIdx + 1}
                        </Text>
                        <Tooltip title={part.templatePartsTitle || 'Nội dung thi'}>
                          <div style={{ 
                            fontSize: '12px', 
                            fontWeight: 700, 
                            color: '#262626', 
                            marginTop: '2px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '100%'
                          }}>
                            {part.templatePartsTitle || 'Nội dung thi'}
                          </div>
                        </Tooltip>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {part.questions?.map((q, qIdx) => {
                          const status = getQuestionStatus(part.templatePartId, qIdx)
                          return (
                            <Tooltip title={`Câu ${q.questionNo}`} key={qIdx}>
                              <div
                                onClick={() => {
                                  const element = document.getElementById(`q-${part.templatePartId}-${qIdx}`)
                                  if (element) {
                                    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
                                  }
                                }}
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '6px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  border: '1px solid #e8e8e8',
                                  backgroundColor: status === 'warning' ? '#fffbe6' : status === 'success' ? '#f6ffed' : '#fff',
                                  color: status === 'warning' ? '#faad14' : status === 'success' ? '#52c41a' : '#595959',
                                  borderColor: status === 'warning' ? '#ffe58f' : status === 'success' ? '#b7eb8f' : '#e8e8e8',
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.borderColor = '#1890ff'
                                  e.currentTarget.style.color = '#1890ff'
                                }}
                                onMouseLeave={(e) => {
                                  const s = getQuestionStatus(part.templatePartId, qIdx)
                                  e.currentTarget.style.borderColor = s === 'warning' ? '#ffe58f' : s === 'success' ? '#b7eb8f' : '#e8e8e8'
                                  e.currentTarget.style.color = s === 'warning' ? '#faad14' : s === 'success' ? '#52c41a' : '#595959'
                                }}
                              >
                                {q.questionNo}
                              </div>
                            </Tooltip>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </Card>

                {/* Save Summary */}
                <Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ marginBottom: '16px' }}>
                      <Text type="secondary" style={{ display: 'block' }}>Thay đổi chưa lưu</Text>
                      <Title level={2} style={{ margin: '4px 0' }}>{Object.keys(pendingExamQuestionUpdates || {}).length}</Title>
                    </div>
                    <Button
                      type="primary"
                      size="large"
                      block
                      icon={<SaveOutlined />}
                      onClick={handleSaveBulkChanges}
                      loading={bulkSaving}
                      disabled={isLockedExam || Object.keys(pendingExamQuestionUpdates || {}).length === 0}
                      style={{ height: '48px', borderRadius: '8px' }}
                    >
                      Lưu tất cả thay đổi
                    </Button>
                  </div>
                </Card>
              </Space>
            </div>
          </Col>
        </Row>

        {/* Modals */}
        <ExamStatusChangeModal
          open={statusChangeModalOpen}
          loading={statusChangeLoading}
          currentStatus={exam?.status ?? 0}
          onCancel={() => setStatusChangeModalOpen(false)}
          onSubmit={handleSubmitStatusChange}
        />
        <ExamQuestionSelectModal
          open={questionSelectModalOpen}
          templatePartId={currentTemplatePartId}
          onCancel={() => setQuestionSelectModalOpen(false)}
          onSelect={handleSelectQuestion}
        />
        <EditExamInfoModal
          open={editInfoModalOpen}
          exam={exam}
          onCancel={() => setEditInfoModalOpen(false)}
          onSuccess={handleSubmitEditInfo}
        />

        {/* Modal confirm question selection */}
        <Modal
          title="Xác nhận chọn câu hỏi"
          open={confirmQuestionModalOpen}
          onOk={handleConfirmSelectedQuestion}
          onCancel={handleBackToQuestionList}
          width={800}
          destroyOnClose
          footer={[
            <Button key="back" onClick={handleBackToQuestionList}>Quay lại</Button>,
            <Button key="ok" type="primary" onClick={handleConfirmSelectedQuestion}>Xác nhận chọn</Button>,
          ]}
        >
          {pendingSelectedQuestion && (
            <div style={{ padding: '12px 0' }}>
               {/* Simplified preview in modal */}
               <div style={{ marginBottom: '24px', background: '#f9f9f9', padding: '16px', borderRadius: '8px' }}>
                 {pendingSelectedQuestion.passageContent && (
                   <div style={{ marginBottom: '16px' }}>
                     <Text strong>Đoạn văn:</Text>
                     <Paragraph>{pendingSelectedQuestion.passageContent}</Paragraph>
                   </div>
                 )}
                 <Text strong>Câu hỏi:</Text>
                 <Paragraph style={{ fontSize: '16px' }}>{pendingSelectedQuestion.content}</Paragraph>
               </div>
               <List
                 grid={{ gutter: 16, column: 2 }}
                 dataSource={pendingSelectedQuestion.options}
                 renderItem={(opt, idx) => (
                   <List.Item>
                     <Card size="small" style={{ border: opt.isCorrect ? '1px solid #52c41a' : '1px solid #f0f0f0' }}>
                       <Badge status={opt.isCorrect ? 'success' : 'default'} text={`${String.fromCharCode(65 + idx)}. ${opt.content}`} />
                     </Card>
                   </List.Item>
                 )}
               />
            </div>
          )}
        </Modal>

        {/* Old Question Modal */}
        <Modal
          title="Chi tiết câu hỏi gốc"
          open={oldQuestionModalOpen}
          onCancel={() => setOldQuestionModalOpen(false)}
          width={700}
          footer={[<Button key="close" onClick={() => setOldQuestionModalOpen(false)}>Đóng</Button>]}
        >
          {oldQuestionModalData && (
            <div style={{ padding: '12px 0' }}>
              <Paragraph strong>{oldQuestionModalData.content}</Paragraph>
              {/* Add options and other info if needed, keeping it simple for now */}
            </div>
          )}
        </Modal>
      </div>
    </div>
  )
}

export default ExamDetailScreen

