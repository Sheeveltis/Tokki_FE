'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'solito/navigation'
import { Space, Spin, Alert, message, Modal, Row, Col, Tabs, Typography, Button, Descriptions, FloatButton, Table } from 'antd'
import { FileTextOutlined, AreaChartOutlined, InfoCircleOutlined, BookOutlined, ClockCircleOutlined, CalendarOutlined, UserOutlined, TeamOutlined } from '@ant-design/icons'
import { useExamDetailAdmin, useExamStatsAdmin } from '../../api/exam-hooks.js'
import { fetchExamDetailAdmin, regenerateExamPart, updateExamQuestion, updateExamStatus } from '../../api/exam-management.js'
import { useQueryClient } from '@tanstack/react-query'

// Global Modals
import ExamStatusChangeModal from '../../components/admin/exam-detail/exam-status-change-modal.jsx'
import ExamQuestionSelectModal from '../../components/admin/exam-detail/exam-question-select-modal.jsx'
import EditExamInfoModal from '../../components/admin/exam-detail/edit-exam-info-modal.jsx'

// New Modular Components
import ExamDetailHeader from '../../components/admin/exam-detail/exam-detail-header.jsx'
import ExamStatisticsBar from '../../components/admin/exam-detail/exam-statistics-bar.jsx'
import ExamContentTab from '../../components/admin/exam-detail/exam-content-tab.jsx'
import ExamAnalysisTab from '../../components/admin/exam-detail/exam-analysis-tab.jsx'
import ExamParticipantsTab from '../../components/admin/exam-detail/exam-participants-tab.jsx'
import QuestionNavigator from '../../components/admin/exam-detail/question-navigator.jsx'

const { Text: AntdText, Title } = Typography

export function ExamDetailScreen() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const params = useParams()
  const examId = params?.id

  // State from original file
  const [statusChangeModalOpen, setStatusChangeModalOpen] = useState(false)
  const [statusChangeLoading, setStatusChangeLoading] = useState(false)
  const [editInfoModalOpen, setEditInfoModalOpen] = useState(false)
  const [templatePartsState, setTemplatePartsState] = useState(null)
  const [questionSelectModalOpen, setQuestionSelectModalOpen] = useState(false)
  const [currentTemplatePartId, setCurrentTemplatePartId] = useState(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(null)
  const [pendingSelectedQuestion, setPendingSelectedQuestion] = useState(null)
  const [confirmQuestionModalOpen, setConfirmQuestionModalOpen] = useState(false)
  const [highlightedQuestions, setHighlightedQuestions] = useState([])
  const [previousQuestionsMap, setPreviousQuestionsMap] = useState({})
  const [oldQuestionModalOpen, setOldQuestionModalOpen] = useState(false)
  const [oldQuestionModalData, setOldQuestionModalData] = useState(null)
  const [pendingExamQuestionUpdates, setPendingExamQuestionUpdates] = useState({})
  const [savingUpdateKey, setSavingUpdateKey] = useState(null)
  const [bulkSaving, setBulkSaving] = useState(false)
  const [regeneratingPartId, setRegeneratingPartId] = useState(null)
  const [currentSkill, setCurrentSkill] = useState('Listening')
  const [activeTab, setActiveTab] = useState('info')
  const pendingUpdatesRef = useRef(pendingExamQuestionUpdates)

  const { data: exam, isLoading: examLoading, error } = useExamDetailAdmin(examId)
  const { data: statsData, isLoading: statsLoading } = useExamStatsAdmin(examId)

  const isLoading = examLoading || statsLoading

  useEffect(() => {
    if (exam && !templatePartsState) {
      setTemplatePartsState(exam.templateParts || [])
    }
  }, [exam, templatePartsState])

  useEffect(() => {
    pendingUpdatesRef.current = pendingExamQuestionUpdates
  }, [pendingExamQuestionUpdates])

  useEffect(() => {
    const handleOpenEditInfo = () => setEditInfoModalOpen(true)
    window.addEventListener('OPEN_EDIT_INFO_MODAL', handleOpenEditInfo)
    return () => window.removeEventListener('OPEN_EDIT_INFO_MODAL', handleOpenEditInfo)
  }, [])

  const applyPendingUpdatesToParts = (parts, pendingMap) => {
    if (!Array.isArray(parts)) return parts
    const entries = Object.entries(pendingMap || {})
    if (entries.length === 0) return parts

    return parts.map((part) => {
      const partId = part?.templatePartId
      if (!partId) return part
      const questions = Array.isArray(part.questions) ? part.questions : []
      if (questions.length === 0) return part

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
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Spin size="large" tip={<AntdText style={{ display: 'block', marginTop: 16 }}>Đang tải dữ liệu kỳ thi...</AntdText>} />
      </div>
    )
  }

  if (error || !exam) {
    return (
      <div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}>
        <div style={{ maxWidth: 600, width: '100%' }}>
          <Alert
            message={<span style={{ fontWeight: 500, fontSize: 16 }}>{error ? "Lỗi hệ thống" : "Không tìm thấy dữ liệu"}</span>}
            description={error?.message || "Đề thi bạn đang tìm kiếm có thể đã bị xóa hoặc di chuyển sang vị trí khác."}
            type="error"
            showIcon
            action={
              <Button size="small" type="primary" danger onClick={() => router.back()}>
                Quay lại
              </Button>
            }
            style={{ borderRadius: 8, padding: 24 }}
          />
        </div>
      </div>
    )
  }

  const isLockedExam = exam.status === 1 || exam.status === 2

  // Handlers
  const handleOpenStatusModal = () => {
    setStatusChangeModalOpen(true)
  }

  const handleSubmitStatusChange = async (values) => {
    const idToUpdate = exam?.examId || examId
    if (!idToUpdate) return
    const newStatus = values?.status
    try {
      setStatusChangeLoading(true)
      await updateExamStatus(idToUpdate, newStatus)
      message.success(`Đã cập nhật trạng thái đề thi thành công`)
      await queryClient.invalidateQueries({ queryKey: ['exam', 'admin', 'detail', idToUpdate] })
      await queryClient.invalidateQueries({ queryKey: ['exams', 'admin'] })
      setStatusChangeModalOpen(false)
    } catch (err) {
      message.error(err?.response?.data?.message || err?.message || 'Cập nhật trạng thái thất bại')
    } finally {
      setStatusChangeLoading(false)
    }
  }

  const handleSubmitEditInfo = async () => {
    const idToUpdate = exam?.examId || examId
    if (!idToUpdate) return
    try {
      await queryClient.invalidateQueries({ queryKey: ['exam', 'admin', 'detail', idToUpdate] })
      await queryClient.invalidateQueries({ queryKey: ['exams', 'admin'] })
      await refreshTemplatePartsFromServer(idToUpdate, pendingUpdatesRef.current)
    } catch (err) {
      console.error('Failed to refresh exam data after edit', err)
    }
  }

  const handleOpenQuestionSelectModal = (templatePartId, questionIndex) => {
    if (isLockedExam) {
      message.warning('Đề thi đã xuất bản hoặc hết hạn, không thể chỉnh sửa nội dung.')
      return
    }
    setCurrentTemplatePartId(templatePartId)
    setCurrentQuestionIndex(questionIndex)
    setQuestionSelectModalOpen(true)
  }

  const handleSelectQuestion = (selectedQuestion) => {
    setPendingSelectedQuestion(selectedQuestion)
    setConfirmQuestionModalOpen(true)
    setQuestionSelectModalOpen(false)
  }

  const handleConfirmSelectedQuestion = () => {
    if (!currentTemplatePartId || currentQuestionIndex == null || !pendingSelectedQuestion) {
      setConfirmQuestionModalOpen(false)
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
          return { ...pendingSelectedQuestion, questionNo: q.questionNo || idx + 1 }
        })
        return { ...part, questions: updatedQuestions }
      })
    })

    setHighlightedQuestions((prev) => (prev.includes(key) ? prev : [...prev, key]))

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

  const handleUndoQuestion = (templatePartId, questionIndex) => {
    const key = `${templatePartId}:${questionIndex}`
    const oldQ = previousQuestionsMap?.[key]
    if (!oldQ) return
    setTemplatePartsState((prev) => {
      if (!prev) return prev
      return prev.map((part) => {
        if (part.templatePartId !== templatePartId) return part
        const updatedQuestions = (part.questions || []).map((q, idx) => {
          if (idx !== questionIndex) return q
          return { ...oldQ, questionNo: q.questionNo || idx + 1 }
        })
        return { ...part, questions: updatedQuestions }
      })
    })
    setHighlightedQuestions((prev) => prev.filter((k) => k !== key))
    setPendingExamQuestionUpdates((prev) => {
      const next = { ...prev }; delete next[key]; return next
    })
    setPreviousQuestionsMap((prev) => {
      const next = { ...prev }; delete next[key]; return next
    })
    message.success('Đã hoàn tác biến động.')
  }

  const handleSaveSingleChange = (templatePartId, questionIndex) => {
    const key = `${templatePartId}:${questionIndex}`
    const payload = pendingExamQuestionUpdates?.[key]
    const idToUpdate = exam?.examId || examId

    Modal.confirm({
      title: 'Lưu thay đổi câu hỏi',
      content: `Xác nhận áp dụng thay đổi mới cho câu hỏi số ${payload?.questionNo}?`,
      okText: 'Áp dụng',
      onOk: async () => {
        try {
          setSavingUpdateKey(key)
          await updateExamQuestion({
            examId: idToUpdate,
            questionBankId: payload.questionBankId,
            questionNo: payload.questionNo,
          })
          message.success('Cập nhật nội dung câu hỏi thành công.')
          const nextPending = { ...(pendingUpdatesRef.current || {}) }
          delete nextPending[key]
          setPendingExamQuestionUpdates(nextPending)
          setHighlightedQuestions((prev) => prev.filter((k) => k !== key))
          await refreshTemplatePartsFromServer(idToUpdate, nextPending)
        } catch (err) {
          message.error('Có lỗi xảy ra khi lưu thay đổi.')
        } finally {
          setSavingUpdateKey(null)
        }
      },
    })
  }

  const handleSaveBulkChanges = () => {
    const idToUpdate = exam?.examId || examId
    const entries = Object.entries(pendingExamQuestionUpdates || {})
    if (entries.length === 0) return

    Modal.confirm({
      title: 'Lưu thay đổi hàng loạt',
      content: `Hệ thống sẽ cập nhật ${entries.length} câu hỏi mới vào đề thi này. Bạn có chắc chắn?`,
      okText: 'Lưu toàn bộ',
      onOk: async () => {
        try {
          setBulkSaving(true)
          for (const [, payload] of entries) {
            await updateExamQuestion({
              examId: idToUpdate,
              questionBankId: payload.questionBankId,
              questionNo: payload.questionNo,
            })
          }
          message.success('Đã cập nhật toàn bộ thay đổi.')
          setPendingExamQuestionUpdates({})
          setHighlightedQuestions([])
          setPreviousQuestionsMap({})
          await refreshTemplatePartsFromServer(idToUpdate, {})
        } catch (err) {
          message.error('Lưu thất bại.')
        } finally {
          setBulkSaving(false)
        }
      },
    })
  }

  const handleRegenerateTemplatePart = async (templatePartId) => {
    const idToUpdate = exam?.examId || examId
    try {
      setRegeneratingPartId(templatePartId)
      await regenerateExamPart({ examId: idToUpdate, templatePartId })
      const nextPending = { ...pendingUpdatesRef.current }
      for (const key of Object.keys(nextPending)) {
        if (key.startsWith(`${templatePartId}:`)) delete nextPending[key]
      }
      setPendingExamQuestionUpdates(nextPending)
      setHighlightedQuestions((prev) => prev.filter((k) => !k.startsWith(`${templatePartId}:`)))
      message.success('Đã tải lại câu hỏi.')
      await refreshTemplatePartsFromServer(idToUpdate, nextPending)
    } catch (err) {
      message.error('Không thể tạo lại phần thi.')
    } finally {
      setRegeneratingPartId(null)
    }
  }

  const handleQuestionNavigate = (partId, qIndex) => {
    const element = document.getElementById(`q-${partId}-${qIndex}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      let bg = element.style.backgroundColor;
      let border = element.style.borderColor;
      element.style.transition = 'all 0.5s ease';
      element.style.boxShadow = '0 0 0 4px rgba(24, 144, 255, 0.4)';
      element.style.borderColor = '#1890ff';
      setTimeout(() => {
        element.style.boxShadow = 'none';
        element.style.borderColor = border;
      }, 2000)
    }
  }

  const getQuestionStatus = (partId, qIndex) => {
    const key = `${partId}:${qIndex}`
    if (savingUpdateKey === key) return 'processing'
    if (pendingExamQuestionUpdates?.[key]) return 'warning'
    if (highlightedQuestions.includes(key)) return 'success'
    return 'default'
  }

  const statsDataForAnalysis = statsData || {
    totalParticipants: 0,
    averageScore: 0,
    pdfDownloadCount: 0,
    topScore: 0,
    averageDurationMinutes: 0,
    inProgressCount: 0,
    completedCount: 0,
    skillQuestionCounts: {
      listening: 0,
      reading: 0,
      writing: 0
    }
  }

  const tabItems = [
    {
      key: 'info',
      label: <Space><InfoCircleOutlined /><span style={{ fontWeight: 500 }}>Thông tin cơ bản</span></Space>,
      children: (() => {
        const generalDataSource = [
          {
            key: '1',
            label: 'Mã đề',
            value: (
              <Space size="large">
                <AntdText>{exam.examId}</AntdText>
                <AntdText style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{
                    height: '8px',
                    width: '8px',
                    backgroundColor: exam.status === 1 ? '#52c41a' : '#bfbfbf',
                    borderRadius: '50%',
                    display: 'inline-block'
                  }} />
                  <span style={{ color: exam.status === 1 ? '#52c41a' : '#8c8c8c' }}>
                    {/* {exam.status === 1 ? 'Đang hoạt động' : 'Ngừng hoạt động'} */}
                  </span>
                </AntdText>
              </Space>
            )
          },
          { key: '2', label: 'Tên đề', value: <AntdText strong>{exam.title}</AntdText> },
          { key: '3', label: 'Mẫu đề', value: `${exam.examTemplateName || '-'} (${exam.examTemplateId || '-'})` },
          { key: '5', label: 'Loại đề', value: exam.type === 1 ? 'TOPIK I' : exam.type === 2 ? 'TOPIK II' : 'Khác' },
          { key: '6', label: 'Người tạo', value: <Space><UserOutlined style={{ color: '#bfbfbf' }} />{exam.createdBy || 'Hệ thống'}</Space> },
          { key: '7', label: 'Ngày tạo', value: <Space><CalendarOutlined style={{ color: '#bfbfbf' }} />{exam.createdAt ? new Date(exam.createdAt).toLocaleString('vi-VN') : '-'}</Space> },
        ];

        const skillDataSource = [
          {
            key: 'listening',
            skill: 'Nghe (Listening)',
            questions: statsDataForAnalysis?.skillQuestionCounts?.listening || 0,
            duration: exam?.skillDurations?.listening || 0,
          },
          {
            key: 'reading',
            skill: 'Đọc (Reading)',
            questions: statsDataForAnalysis?.skillQuestionCounts?.reading || 0,
            duration: exam?.skillDurations?.reading || 0,
          },
          {
            key: 'writing',
            skill: 'Viết (Writing)',
            questions: statsDataForAnalysis?.skillQuestionCounts?.writing || 0,
            duration: exam?.skillDurations?.writing || 0,
          }
        ];

        const skillColumns = [
          {
            title: 'Kỹ năng',
            dataIndex: 'skill',
            key: 'skill',
            render: (text) => <AntdText strong>{text}</AntdText>,
          },
          {
            title: 'Số câu hỏi',
            dataIndex: 'questions',
            key: 'questions',
            align: 'center',
            render: (val) => <AntdText>{val} câu</AntdText>
          },
          {
            title: 'Thời gian làm bài',
            dataIndex: 'duration',
            key: 'duration',
            align: 'center',
            render: (val) => <AntdText>{val} phút</AntdText>
          },
        ];

        return (
          <div style={{ padding: 24, backgroundColor: '#fff' }}>
            <Row gutter={[0, 32]}>
              <Col span={24}>
                <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', borderBottom: '1px solid #f0f0f0', paddingBottom: 8 }}>
                  <InfoCircleOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                  <AntdText strong style={{ color: '#595959', textTransform: 'uppercase', fontSize: 12, letterSpacing: 1 }}>Thông tin chi tiết đề</AntdText>
                </div>
                <Table
                  dataSource={generalDataSource}
                  columns={[
                    {
                      title: 'Trường thông tin',
                      dataIndex: 'label',
                      key: 'label',
                      width: '250px',
                      render: (text) => <AntdText type="secondary" style={{ fontWeight: 500 }}>{text}</AntdText>
                    },
                    {
                      title: 'Giá trị',
                      dataIndex: 'value',
                      key: 'value'
                    },
                  ]}
                  pagination={false}
                  bordered
                  size="middle"
                  showHeader={false}
                />
              </Col>

              <Col span={24}>
                <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', borderBottom: '1px solid #f0f0f0', paddingBottom: 8 }}>
                  <ClockCircleOutlined style={{ marginRight: 8, color: '#fa8c16' }} />
                  <AntdText strong style={{ color: '#595959', textTransform: 'uppercase', fontSize: 12, letterSpacing: 1 }}>Cấu trúc đề thi & Thời gian</AntdText>
                </div>
                <Table
                  dataSource={skillDataSource}
                  columns={skillColumns}
                  pagination={false}
                  bordered
                  size="middle"
                  summary={() => (
                    <Table.Summary fixed>
                      <Table.Summary.Row style={{ backgroundColor: '#fafafa' }}>
                        <Table.Summary.Cell index={0}>
                          <AntdText strong>TỔNG CỘNG</AntdText>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={1} align="center">
                          <AntdText type="danger" strong>{exam.totalQuestions || 0} câu</AntdText>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={2} align="center">
                          <AntdText strong>{exam.duration || 0} phút</AntdText>
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                    </Table.Summary>
                  )}
                />
              </Col>
            </Row>
          </div>
        );
      })()
    },
    {
      key: 'content',
      label: <Space><BookOutlined /><span style={{ fontWeight: 500 }}>Danh sách Câu hỏi</span></Space>,
      children: (
        <ExamContentTab
          templateParts={templatePartsState}
          currentSkill={currentSkill}
          setCurrentSkill={setCurrentSkill}
          isLockedExam={isLockedExam}
          highlightedQuestions={highlightedQuestions}
          pendingUpdates={pendingExamQuestionUpdates}
          savingUpdateKey={savingUpdateKey}
          previousQuestionsMap={previousQuestionsMap}
          regeneratingPartId={regeneratingPartId}
          onEditQuestion={handleOpenQuestionSelectModal}
          onUndoQuestion={handleUndoQuestion}
          onViewOldQuestion={(pid, idx) => {
            setOldQuestionModalData(previousQuestionsMap[`${pid}:${idx}`])
            setOldQuestionModalOpen(true)
          }}
          onSaveQuestion={handleSaveSingleChange}
          onRegeneratePart={handleRegenerateTemplatePart}
        />
      )
    },
    {
      key: 'analysis',
      label: <Space><AreaChartOutlined /><span style={{ fontWeight: 500 }}>Phân tích chuyên sâu</span></Space>,
      children: <ExamAnalysisTab exam={exam} statsData={statsDataForAnalysis} />
    },
    {
      key: 'participants',
      label: <Space><TeamOutlined /><span style={{ fontWeight: 500 }}>Danh sách làm bài</span></Space>,
      children: <ExamParticipantsTab examId={examId} />
    },
  ]

  return (
    <div style={{ height: 'calc(100vh - 90px)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
        <ExamDetailHeader
          exam={exam}
          statusLoading={statusChangeLoading}
          onStatusClick={handleOpenStatusModal}
        />

        <ExamStatisticsBar exam={exam} statsData={statsDataForAnalysis} />

        <Row gutter={[24, 24]} style={{ flex: 1, minHeight: 0, paddingBottom: 24 }}>
          <Col xs={24} lg={18} style={{ height: '100%' }}>
            <div style={{ backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0', height: '100%', overflowY: 'auto' }}>
              <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={tabItems}
                centered={false}
                tabBarStyle={{ padding: '16px 24px 0', borderBottom: '1px solid #f0f0f0', background: '#ffffff', position: 'sticky', top: 0, zIndex: 10, margin: 0 }}
              />
            </div>
          </Col>

          <Col xs={24} lg={6} style={{ height: '100%' }}>
            <QuestionNavigator
              templateParts={templatePartsState}
              currentSkill={activeTab === 'content' ? currentSkill : 'all'}
              pendingCount={Object.keys(pendingExamQuestionUpdates).length}
              isLockedExam={isLockedExam}
              isSaving={bulkSaving}
              getQuestionStatus={getQuestionStatus}
              onQuestionClick={handleQuestionNavigate}
              onSaveAll={handleSaveBulkChanges}
            />
          </Col>
        </Row>
      </div>

      {/* Global Modals */}
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

      <Modal
        title={<span style={{ fontWeight: 500 }}>Xác nhận chọn câu hỏi mới</span>}
        open={confirmQuestionModalOpen}
        onOk={handleConfirmSelectedQuestion}
        onCancel={() => { setConfirmQuestionModalOpen(false); setPendingSelectedQuestion(null); }}
        width={750}
        destroyOnClose
        okText="Chọn câu hỏi này"
        cancelText="Hủy bỏ"
        style={{ borderRadius: 8 }}
      >
        {pendingSelectedQuestion && (
          <div style={{ padding: '24px 0' }}>
            <div style={{ marginBottom: 24, backgroundColor: '#f5f5f5', padding: 24, borderRadius: 8, border: '1px dashed #d9d9d9' }}>
              <AntdText type="secondary" style={{ display: 'block', marginBottom: 8, fontSize: 13 }}>Nội dung đề xuất</AntdText>
              <div
                style={{ fontSize: 16, color: '#262626' }}
                dangerouslySetInnerHTML={{ __html: pendingSelectedQuestion.content || pendingSelectedQuestion.explanation }}
              />
            </div>
            <Row gutter={[16, 16]}>
              {pendingSelectedQuestion.options?.map((opt, idx) => (
                <Col span={12} key={idx}>
                  <div style={{
                    padding: 16, borderRadius: 8, border: '1px solid', display: 'flex', alignItems: 'center', gap: 12,
                    borderColor: opt.isCorrect ? '#b7eb8f' : '#f0f0f0', backgroundColor: opt.isCorrect ? '#f6ffed' : '#fff',
                    color: opt.isCorrect ? '#389e0d' : '#262626', fontWeight: opt.isCorrect ? 'bold' : 'normal'
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, fontSize: 13,
                      backgroundColor: opt.isCorrect ? '#52c41a' : '#f5f5f5',
                      color: opt.isCorrect ? '#fff' : '#595959'
                    }}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span>{opt.content}</span>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        )}
      </Modal>

      <Modal
        title={<span style={{ fontWeight: 500 }}>Nội dung câu hỏi gốc (Gần nhất)</span>}
        open={oldQuestionModalOpen}
        onCancel={() => setOldQuestionModalOpen(false)}
        footer={null}
        width={750}
        destroyOnClose
        style={{ borderRadius: 8 }}
      >
        {oldQuestionModalData && (
          <div style={{ padding: '24px 0' }}>
            <div style={{ marginBottom: 24, backgroundColor: '#fafafa', padding: 24, borderRadius: 8, border: '1px dashed #d9d9d9' }}>
              <div
                style={{ fontSize: 16, color: '#262626' }}
                dangerouslySetInnerHTML={{ __html: oldQuestionModalData.content || oldQuestionModalData.explanation }}
              />
            </div>
            <Row gutter={[16, 16]}>
              {oldQuestionModalData.options?.map((opt, idx) => (
                <Col span={12} key={idx}>
                  <div style={{
                    padding: 16, borderRadius: 8, border: '1px solid', display: 'flex', alignItems: 'center', gap: 12,
                    borderColor: opt.isCorrect ? '#b7eb8f' : '#f0f0f0', backgroundColor: opt.isCorrect ? '#f6ffed' : '#fff',
                    color: opt.isCorrect ? '#389e0d' : '#262626', fontWeight: opt.isCorrect ? 'bold' : 'normal'
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, fontSize: 13,
                      backgroundColor: opt.isCorrect ? '#52c41a' : '#f5f5f5',
                      color: opt.isCorrect ? '#fff' : '#595959'
                    }}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span>{opt.content}</span>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        )}
      </Modal>

      <FloatButton.BackTop visibilityHeight={400} />
    </div>
  )
}

export default ExamDetailScreen
