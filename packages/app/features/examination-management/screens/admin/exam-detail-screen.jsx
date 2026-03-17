'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'solito/navigation'
import { Card, Space, Typography, Spin, Alert, Descriptions, Tag, Divider, message, Modal, Button, Tooltip, Popconfirm } from 'antd'
import { EditOutlined, EyeOutlined, UndoOutlined, SaveOutlined, SyncOutlined } from '@ant-design/icons'
import { ButtonV2 } from '../../../../../components/buttonV2.jsx'
import { AdminLayout } from '../../../back-office/components/admin/admin-layout.web.jsx'
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

  const handleNavigate = (key) => {
    router.push(`/admin?tab=${key}`)
  }

  if (isLoading) {
    return (
      <AdminLayout defaultKey="exam-management" onNavigate={handleNavigate}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <Spin size="large" />
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout defaultKey="exam-management" onNavigate={handleNavigate}>
        <Alert
          message="Lỗi"
          description={error?.message || 'Không thể tải thông tin đề thi.'}
          type="error"
          showIcon
          style={{ margin: '20px' }}
        />
      </AdminLayout>
    )
  }

  if (!exam) {
    return (
      <AdminLayout defaultKey="exam-management" onNavigate={handleNavigate}>
        <Alert
          message="Không tìm thấy"
          description="Không tìm thấy đề thi với ID này."
          type="warning"
          showIcon
          style={{ margin: '20px' }}
        />
      </AdminLayout>
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

  return (
    <AdminLayout defaultKey="exam-management" onNavigate={handleNavigate}>
      <div style={{ padding: '24px' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: '16px' }}>
            <Title level={2} style={{ margin: 0 }}>
              Chi tiết đề thi
            </Title>
            <Space>
              <ButtonV2
                title="Chuyển trạng thái"
                color="#1890ff"
                onPress={handleOpenStatusModal}
                disabled={statusChangeLoading || isLockedExam}
                style={{ minWidth: 140, paddingVertical: 10 }}
                textStyle={{ fontSize: 14 }}
              />
              <ButtonV2
                title="Quay lại"
                color="charcoal"
                onPress={() => router.push('/admin?tab=exam-management')}
                style={{ minWidth: 100, paddingVertical: 10 }}
                textStyle={{ fontSize: 14 }}
              />
            </Space>
          </Space>
        </div>

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

        {/* Modal xem trước câu hỏi mới chọn để xác nhận */}
        <Modal
          title="Xác nhận chọn câu hỏi"
          open={confirmQuestionModalOpen}
          onOk={handleConfirmSelectedQuestion}
          onCancel={handleBackToQuestionList}
          width={800}
          destroyOnClose
          footer={[
            <Button key="back" onClick={handleBackToQuestionList}>
              Quay lại danh sách
            </Button>,
            <Button key="cancel" onClick={handleCancelConfirmQuestion}>
              Đóng
            </Button>,
            <Button key="ok" type="primary" onClick={handleConfirmSelectedQuestion}>
              Xác nhận
            </Button>,
          ]}
        >
          {pendingSelectedQuestion ? (
            <div style={{ marginTop: 8 }}>
              {/* Media */}
              {pendingSelectedQuestion.mediaUrl && (
                <div style={{ marginBottom: '16px', textAlign: 'center' }}>
                  {pendingSelectedQuestion.mediaType === 'Image' ? (
                    <img
                      src={pendingSelectedQuestion.mediaUrl}
                      alt="Question media"
                      style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '4px' }}
                    />
                  ) : pendingSelectedQuestion.mediaType === 'Audio' ? (
                    <audio controls src={pendingSelectedQuestion.mediaUrl} style={{ width: '100%' }} />
                  ) : (
                    <a href={pendingSelectedQuestion.mediaUrl} target="_blank" rel="noopener noreferrer">
                      Xem media
                    </a>
                  )}
                </div>
              )}

              {/* Passage */}
              {pendingSelectedQuestion.passageContent && (
                <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
                  <Text strong style={{ display: 'block', marginBottom: '8px' }}>Đoạn văn:</Text>
                  <Paragraph style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                    {pendingSelectedQuestion.passageContent}
                  </Paragraph>
                </div>
              )}

              {/* Nội dung câu hỏi */}
              {pendingSelectedQuestion.content && (
                <div style={{ marginBottom: '16px' }}>
                  <Text strong style={{ display: 'block', marginBottom: '8px' }}>Nội dung câu hỏi:</Text>
                  <Paragraph style={{ margin: 0, fontSize: '16px' }}>
                    {pendingSelectedQuestion.content}
                  </Paragraph>
                </div>
              )}

              {/* Options */}
              {pendingSelectedQuestion.options && pendingSelectedQuestion.options.length > 0 && (
                <div>
                  <Text strong style={{ display: 'block', marginBottom: '12px' }}>Các lựa chọn:</Text>
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    {pendingSelectedQuestion.options.map((option, optIndex) => (
                      <div
                        key={option.keyOption || optIndex}
                        style={{
                          padding: '12px',
                          borderRadius: '4px',
                          border: option.isCorrect ? '2px solid #52c41a' : '1px solid #d9d9d9',
                          backgroundColor: option.isCorrect ? '#f6ffed' : '#fff',
                        }}
                      >
                        <Space>
                          <Tag color={option.isCorrect ? 'green' : 'default'} style={{ fontSize: 12 }}>
                            {option.keyOption || String.fromCharCode(65 + optIndex)}
                          </Tag>
                          <Text style={{ flex: 1 }}>{option.content || '-'}</Text>
                          {option.isCorrect && (
                            <Tag color="green" style={{ fontSize: 12 }}>
                              Đáp án đúng
                            </Tag>
                          )}
                        </Space>
                      </div>
                    ))}
                  </Space>
                </div>
              )}

              {/* Giải thích */}
              {pendingSelectedQuestion.explanation && (
                <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#e6f7ff', borderRadius: '4px' }}>
                  <Text strong style={{ display: 'block', marginBottom: '8px' }}>Giải thích:</Text>
                  <Paragraph style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                    {pendingSelectedQuestion.explanation}
                  </Paragraph>
                </div>
              )}
            </div>
          ) : (
            <Text>Không có dữ liệu câu hỏi.</Text>
          )}
        </Modal>

        {/* Modal xem lại câu hỏi cũ */}
        <Modal
          title="Câu hỏi cũ"
          open={oldQuestionModalOpen}
          onCancel={() => setOldQuestionModalOpen(false)}
          width={800}
          destroyOnClose
          footer={[
            <Button key="close" onClick={() => setOldQuestionModalOpen(false)}>
              Đóng
            </Button>,
          ]}
        >
          {oldQuestionModalData ? (
            <div style={{ marginTop: 8 }}>
              {/* Media */}
              {oldQuestionModalData.mediaUrl && (
                <div style={{ marginBottom: '16px', textAlign: 'center' }}>
                  {oldQuestionModalData.mediaType === 'Image' ? (
                    <img
                      src={oldQuestionModalData.mediaUrl}
                      alt="Question media"
                      style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '4px' }}
                    />
                  ) : oldQuestionModalData.mediaType === 'Audio' ? (
                    <audio controls src={oldQuestionModalData.mediaUrl} style={{ width: '100%' }} />
                  ) : (
                    <a href={oldQuestionModalData.mediaUrl} target="_blank" rel="noopener noreferrer">
                      Xem media
                    </a>
                  )}
                </div>
              )}

              {/* Passage */}
              {oldQuestionModalData.passageContent && (
                <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
                  <Text strong style={{ display: 'block', marginBottom: '8px' }}>Đoạn văn:</Text>
                  <Paragraph style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{oldQuestionModalData.passageContent}</Paragraph>
                </div>
              )}

              {/* Nội dung câu hỏi */}
              {oldQuestionModalData.content && (
                <div style={{ marginBottom: '16px' }}>
                  <Text strong style={{ display: 'block', marginBottom: '8px' }}>Nội dung câu hỏi:</Text>
                  <Paragraph style={{ margin: 0, fontSize: '16px' }}>{oldQuestionModalData.content}</Paragraph>
                </div>
              )}

              {/* Options */}
              {oldQuestionModalData.options && oldQuestionModalData.options.length > 0 && (
                <div>
                  <Text strong style={{ display: 'block', marginBottom: '12px' }}>Các lựa chọn:</Text>
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    {oldQuestionModalData.options.map((option, optIndex) => (
                      <div
                        key={option.keyOption || optIndex}
                        style={{
                          padding: '12px',
                          borderRadius: '4px',
                          border: option.isCorrect ? '2px solid #52c41a' : '1px solid #d9d9d9',
                          backgroundColor: option.isCorrect ? '#f6ffed' : '#fff',
                        }}
                      >
                        <Space>
                          <Tag color={option.isCorrect ? 'green' : 'default'} style={{ fontSize: 12 }}>
                            {option.keyOption || String.fromCharCode(65 + optIndex)}
                          </Tag>
                          <Text style={{ flex: 1 }}>{option.content || '-'}</Text>
                          {option.isCorrect && (
                            <Tag color="green" style={{ fontSize: 12 }}>
                              Đáp án đúng
                            </Tag>
                          )}
                        </Space>
                      </div>
                    ))}
                  </Space>
                </div>
              )}

              {/* Giải thích */}
              {oldQuestionModalData.explanation && (
                <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#e6f7ff', borderRadius: '4px' }}>
                  <Text strong style={{ display: 'block', marginBottom: '8px' }}>Giải thích:</Text>
                  <Paragraph style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{oldQuestionModalData.explanation}</Paragraph>
                </div>
              )}
            </div>
          ) : (
            <Text>Không có dữ liệu câu hỏi.</Text>
          )}
        </Modal>

        {/* Thông tin cơ bản */}
        <Card
          title="Thông tin cơ bản"
          extra={
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={handleOpenEditInfoModal}
              disabled={isLockedExam}
            >
              Chỉnh sửa
            </Button>
          }
          style={{ marginBottom: '24px' }}
        >
          <Descriptions column={1} bordered size="middle">
            <Descriptions.Item label="ID Đề thi">
              {exam.examId || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Tiêu đề">
              {exam.title || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Loại đề">
              <Tag color="blue" style={{ fontSize: 12 }}>{typeText}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={statusInfo.color} style={{ fontSize: 12 }}>{statusInfo.text}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian (phút)">
              {exam.duration || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {exam.createdAt ? new Date(exam.createdAt).toLocaleString('vi-VN') : '-'}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Template Parts và Questions */}
        {templatePartsState && templatePartsState.length > 0 ? (
          templatePartsState.map((templatePart, partIndex) => (
            (() => {
              const partId = templatePart?.templatePartId
              const partPendingCount = Object.keys(pendingExamQuestionUpdates || {}).filter((k) => k.startsWith(`${partId}:`)).length
              const isRegenerating = regeneratingPartId === partId
              const canRegenerate = !!partId && !isRegenerating && !isLockedExam
              return (
            <Card
              key={templatePart.templatePartId || partIndex}
              title={
                <Space>
                  <Text strong>Phần {partIndex + 1} -</Text>
                  {templatePart.templatePartsTitle && (
                    <Text type="danger" style={{ fontSize: 14 }}>
                      {templatePart.templatePartsTitle}
                    </Text>
                  )}
                </Space>
              }
              extra={
                <Popconfirm
                  title={
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: 6 }}>Đổi lại bộ câu hỏi phần này?</div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>
                        Hệ thống sẽ random lại bộ câu hỏi trong phần.
                        {partPendingCount > 0 ? (
                          <div style={{ marginTop: 6, color: '#b45309' }}>
                            Lưu ý: Bạn đang có <b>{partPendingCount}</b> thay đổi chưa lưu ở phần này — đổi lại sẽ bỏ các thay đổi đó.
                          </div>
                        ) : null}
                      </div>
                    </div>
                  }
                  okText="Đổi lại"
                  cancelText="Hủy"
                  disabled={!canRegenerate}
                  onConfirm={() => handleRegenerateTemplatePart(partId)}
                >
                  <Tooltip title="Đổi lại bộ câu hỏi phần này">
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        cursor: canRegenerate ? 'pointer' : 'not-allowed',
                        opacity: canRegenerate ? 1 : 0.5,
                      }}
                    >
                      <SyncOutlined spin={isRegenerating} style={{ color: '#1890ff' }} />
                    </span>
                  </Tooltip>
                </Popconfirm>
              }
              style={{ marginBottom: '24px' }}
            >
              {templatePart.questions && templatePart.questions.length > 0 ? (
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  {templatePart.questions.map((question, qIndex) => (
                    (() => {
                      const highlightKey = `${templatePart.templatePartId}:${qIndex}`
                      const isHighlighted = highlightedQuestions.includes(highlightKey)
                      return (
                    <Card
                      key={question.questionNo || qIndex}
                      size="small"
                      title={
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: 8,
                          }}
                        >
                          <Space>
                            <Text strong>Câu {question.questionNo || qIndex + 1}</Text>
                            {question.isCorrect !== undefined && (
                              <Tag color={question.isCorrect ? 'green' : 'red'} style={{ fontSize: 12 }}>
                                {question.isCorrect ? 'Đúng' : 'Sai'}
                              </Tag>
                            )}
                          </Space>
                          <Space>
                            <EditOutlined
                              style={{
                                marginLeft: 8,
                                color: isLockedExam ? '#bfbfbf' : '#1890ff',
                                cursor: isLockedExam ? 'not-allowed' : 'pointer',
                              }}
                              onClick={() => {
                                if (!isLockedExam) {
                                  handleOpenQuestionSelectModal(templatePart.templatePartId, qIndex)
                                }
                              }}
                            />
                            <Tooltip title="Lưu đổi câu này">
                              <SaveOutlined
                                style={{
                                  marginLeft: 10,
                                  color: isLockedExam
                                    ? '#bfbfbf'
                                    : savingUpdateKey === `${templatePart.templatePartId}:${qIndex}`
                                      ? '#1890ff'
                                      : pendingExamQuestionUpdates?.[`${templatePart.templatePartId}:${qIndex}`]
                                        ? '#52c41a'
                                        : '#bfbfbf',
                                  cursor:
                                    !isLockedExam && pendingExamQuestionUpdates?.[`${templatePart.templatePartId}:${qIndex}`]
                                      ? 'pointer'
                                      : 'not-allowed',
                                }}
                                onClick={() => handleSaveSingleChange(templatePart.templatePartId, qIndex)}
                              />
                            </Tooltip>
                            <Tooltip title="Xem lại câu cũ">
                              <EyeOutlined
                                style={{ marginLeft: 10, color: '#595959', cursor: 'pointer' }}
                                onClick={() => handleViewOldQuestion(templatePart.templatePartId, qIndex)}
                              />
                            </Tooltip>
                            <Popconfirm
                              title="Hoàn tác về câu cũ?"
                              okText="Hoàn tác"
                              cancelText="Hủy"
                              disabled={isLockedExam}
                              onConfirm={() => handleUndoQuestion(templatePart.templatePartId, qIndex)}
                            >
                              <Tooltip title="Hoàn tác câu cũ">
                                <UndoOutlined
                                  style={{
                                    marginLeft: 10,
                                    color: isLockedExam ? '#ffd8bf' : '#fa8c16',
                                    cursor: isLockedExam ? 'not-allowed' : 'pointer',
                                  }}
                                />
                              </Tooltip>
                            </Popconfirm>
                          </Space>
                        </div>
                      }
                      style={{
                        border: isHighlighted ? '1px solid #ffe58f' : undefined,
                      }}
                      // Ensure the visible area (card body) also gets the background color
                      bodyStyle={{ backgroundColor: isHighlighted ? '#fffbe6' : '#fafafa' }}
                      styles={{ body: { backgroundColor: isHighlighted ? '#fffbe6' : '#fafafa' } }}
                    >
                      {/* Question Media */}
                      {question.mediaUrl && (
                        <div style={{ marginBottom: '16px', textAlign: 'center' }}>
                          {question.mediaType === 'Image' ? (
                            <img
                              src={question.mediaUrl}
                              alt="Question media"
                              style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '4px' }}
                            />
                          ) : question.mediaType === 'Audio' ? (
                            <audio controls src={question.mediaUrl} style={{ width: '100%' }} />
                          ) : (
                            <a href={question.mediaUrl} target="_blank" rel="noopener noreferrer">
                              Xem media
                            </a>
                          )}
                        </div>
                      )}

                      {/* Passage Content */}
                      {question.passageContent && (
                        <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
                          <Text strong style={{ display: 'block', marginBottom: '8px' }}>Đoạn văn:</Text>
                          <Paragraph style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                            {question.passageContent}
                          </Paragraph>
                        </div>
                      )}

                      {/* Passage Media */}
                      {question.passageImageUrl && (
                        <div style={{ marginBottom: '16px', textAlign: 'center' }}>
                          <img
                            src={question.passageImageUrl}
                            alt="Passage image"
                            style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '4px' }}
                          />
                        </div>
                      )}

                      {question.passageAudioUrl && (
                        <div style={{ marginBottom: '16px' }}>
                          <audio controls src={question.passageAudioUrl} style={{ width: '100%' }} />
                        </div>
                      )}

                      {/* Question Content */}
                      {question.content && (
                        <div style={{ marginBottom: '16px' }}>
                          <Text strong style={{ display: 'block', marginBottom: '8px' }}>Nội dung câu hỏi:</Text>
                          <Paragraph style={{ margin: 0, fontSize: '16px' }}>
                            {question.content}
                          </Paragraph>
                        </div>
                      )}

                      {/* Options */}
                      {question.options && question.options.length > 0 && (
                        <div>
                          <Text strong style={{ display: 'block', marginBottom: '12px' }}>Các lựa chọn:</Text>
                          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                            {question.options.map((option, optIndex) => (
                              <div
                                key={option.keyOption || optIndex}
                                style={{
                                  padding: '12px',
                                  borderRadius: '4px',
                                  border: option.isCorrect ? '2px solid #52c41a' : '1px solid #d9d9d9',
                                  backgroundColor: option.isCorrect ? '#f6ffed' : '#fff',
                                }}
                              >
                                <Space>
                                  <Tag color={option.isCorrect ? 'green' : 'default'} style={{ fontSize: 12 }}>
                                    {option.keyOption || String.fromCharCode(65 + optIndex)}
                                  </Tag>
                                  <Text style={{ flex: 1 }}>{option.content || '-'}</Text>
                                  {option.isCorrect && (
                                    <Tag color="green" style={{ fontSize: 12 }}>
                                      Đáp án đúng
                                    </Tag>
                                  )}
                                </Space>
                                {option.imageUrl && (
                                  <div style={{ marginTop: '8px', textAlign: 'center' }}>
                                    <img
                                      src={option.imageUrl}
                                      alt={`Option ${option.keyOption}`}
                                      style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '4px' }}
                                    />
                                  </div>
                                )}
                              </div>
                            ))}
                          </Space>
                        </div>
                      )}

                      {/* Explanation */}
                      {question.explanation && (
                        <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#e6f7ff', borderRadius: '4px' }}>
                          <Text strong style={{ display: 'block', marginBottom: '8px' }}>Giải thích:</Text>
                          <Paragraph style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                            {question.explanation}
                          </Paragraph>
                        </div>
                      )}

                      {partIndex < exam.templateParts.length - 1 || qIndex < templatePart.questions.length - 1 ? (
                        <Divider style={{ margin: '16px 0' }} />
                      ) : null}
                    </Card>
                      )
                    })()
                  ))}
                </Space>
              ) : (
                <Alert message="Không có câu hỏi" type="info" />
              )}
            </Card>
              )
            })()
          ))
        ) : (
          <Card>
            <Alert message="Không có phần nào" type="info" />
          </Card>
        )}

        {/* Bulk save footer */}
        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
          <Space>
            <Text type="secondary">
              Thay đổi chưa lưu: <b>{Object.keys(pendingExamQuestionUpdates || {}).length}</b>
            </Text>
            <Button
              type="primary"
              onClick={handleSaveBulkChanges}
              loading={bulkSaving}
              disabled={isLockedExam || Object.keys(pendingExamQuestionUpdates || {}).length === 0}
            >
              Lưu đổi hàng loạt
            </Button>
          </Space>
        </div>
      </div>
    </AdminLayout>
  )
}

export default ExamDetailScreen

