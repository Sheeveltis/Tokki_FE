import React, { useEffect, useState } from 'react'
import { Typography, Spin, Pagination, Modal } from 'antd'
import { fetchPassageById, fetchPassages, fetchQuestionTypes, updateQuestionBank, activateQuestionBanks, deleteQuestionBank } from '../../../api/question-bank-management.js'
import { submitQuestionBanksForApproval } from '../../../api/create-question.js'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import { uploadOptionImageToCloudinary, uploadQuestionAudioToCloudinary, uploadQuestionImageToCloudinary } from '../../../../back-office/api/cloudinary.js'
import { showAdminSuccess, showAdminError } from '../../../../../../components/HelperAdmin.jsx'
import { QuestionCard } from './QuestionCard'
import { QuestionTypeSelectorModal } from './QuestionTypeSelectorModal'
import { QuestionUpdateModal } from './QuestionUpdateModal'

const { Text } = Typography

const QUESTION_BANK_STATUS = {
  DRAFT: 0,
  ACTIVE: 1,
  DELETED: 2,
  PENDING_APPROVAL: 3,
  REJECTED: 4,
  ASSIGNED: 5,
}

/**
 * QuestionCardList Component
 * Hiển thị danh sách câu hỏi dưới dạng các card, mỗi card là một câu hỏi và các đáp án.
 * Nếu câu hỏi có passageId thì hiển thị passageTitle trong title.
 */
export function QuestionCardList({
  data,
  loading,
  onEdit,
  onDelete,
  onDeleted,
  onRefresh,
  pagination,
  selectedQuestions = new Set(),
  onToggleSelect,
  // Admin approval props
  approvalStatuses = {},
  rejectReasons = {},
  onSetApprovalStatus,
  onSetRejectReason,
}) {
  const [passageMap, setPassageMap] = useState({})
  const [loadingPassage, setLoadingPassage] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [questionToEdit, setQuestionToEdit] = useState(null)
  const [mediaObjectUrl, setMediaObjectUrl] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  // Fetch passages whenever data changes
  useEffect(() => {
    const fetchPassagesForDisplay = async () => {
      if (!Array.isArray(data) || data.length === 0) return
      const ids = Array.from(new Set(data.filter((q) => q.passageId).map((q) => q.passageId)))
      if (ids.length === 0) return
      // Skip if already loaded all ids
      const idsToFetch = ids.filter((id) => !passageMap[id])
      if (idsToFetch.length === 0) return
      try {
        setLoadingPassage(true)
        const results = await Promise.all(
          idsToFetch.map((id) => fetchPassageById(id).catch(() => null)),
        )
        const newMap = {}
        idsToFetch.forEach((id, idx) => {
          if (results[idx]) newMap[id] = results[idx]
        })
        setPassageMap((prev) => ({ ...prev, ...newMap }))
      } finally {
        setLoadingPassage(false)
      }
    }
    fetchPassagesForDisplay()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])



  const handleEdit = (questionId) => {
    const question = data.find(q => (q.questionBankId || q.id) === questionId)
    if (!question) return
    setQuestionToEdit(question)
    setIsEditModalOpen(true)
  }

  const handleCancelEdit = () => {
    setIsEditModalOpen(false)
    setQuestionToEdit(null)
  }



  const handleDeleteQuestion = async (questionId) => {
    const question = data.find((q) => (q.questionBankId || q.id) === questionId)
    if (!question) return

    const questionBankId = question.questionBankId || question.id
    const status = question.status ?? QUESTION_BANK_STATUS.DRAFT

    Modal.confirm({
      title: 'Xác nhận xóa câu hỏi',
      icon: <ExclamationCircleOutlined />,
      content: 'Bạn có chắc chắn muốn xóa câu hỏi này không? Thao tác này có thể không hoàn tác được.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      centered: true,
      onOk: async () => {
        try {
          setDeletingId(questionId)
          if (status === QUESTION_BANK_STATUS.ASSIGNED) {
            // Assigned: chỉ chuyển status -> Deleted, giữ nguyên options
            await updateQuestionBank({ questionBankId, status: QUESTION_BANK_STATUS.DELETED })
            showAdminSuccess('Đã chuyển câu hỏi sang trạng thái Đã xóa')
          } else if (status === QUESTION_BANK_STATUS.DRAFT || status === QUESTION_BANK_STATUS.ACTIVE) {
            // Draft/Active: xóa hẳn (backend sẽ xóa luôn options)
            await deleteQuestionBank(questionBankId)
            showAdminSuccess('Đã xóa câu hỏi thành công')
          } else {
            showAdminError('Chỉ có thể xóa câu hỏi ở trạng thái Nháp, Hoạt động hoặc Đã gán (Assigned)')
          }
          if (onDeleted) {
            onRefresh ? onRefresh() : onDeleted?.(questionId)
          }
        } catch (error) {
          showAdminError(error?.message || 'Xóa câu hỏi thất bại')
        } finally {
          setDeletingId(null)
        }
      }
    })
  }

  const handleResubmitForApproval = async (questionId) => {
    const question = data.find((q) => (q.questionBankId || q.id) === questionId)
    if (!question) return

    const questionBankId = question.questionBankId || question.id

    try {
      setDeletingId(questionId) // Tạm dùng để hiển thị loading
      await submitQuestionBanksForApproval([questionBankId])
      showAdminSuccess('Đã gửi câu hỏi để phê duyệt lại')
      if (onRefresh) {
        onRefresh()
      }
    } catch (error) {
      showAdminError(error?.message || 'Gửi duyệt lại thất bại')
    } finally {
      setDeletingId(null)
    }
  }




  if (loading || loadingPassage) {
    return <Spin size="large" style={{ display: 'block', marginTop: 50 }} />
  }

  if (!data || data.length === 0) {
    return <Text type="secondary">Không có câu hỏi nào phù hợp.</Text>
  }

  // Tính số thứ tự dựa trên pagination
  const getQuestionNumber = (index) => {
    if (!pagination || !pagination.current || !pagination.pageSize) {
      return index + 1
    }
    return (pagination.current - 1) * pagination.pageSize + index + 1
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <QuestionUpdateModal
        open={isEditModalOpen}
        question={questionToEdit}
        onCancel={handleCancelEdit}
        onUpdated={() => {
          setIsEditModalOpen(false)
          setQuestionToEdit(null)
          if (onRefresh) onRefresh()
        }}
      />

      {data.map((question, index) => {
        const key = question.questionBankId || question.id || index
        const passage = question.passageId ? passageMap[question.passageId] : null
        const questionNumber = getQuestionNumber(index)

        return (
          <QuestionCard
            key={key}
            question={question}
            index={questionNumber - 1}
            deletingId={deletingId}
            passage={passage}
            onEdit={handleEdit}
            onDeleteQuestion={handleDeleteQuestion}
            onSubmitForApproval={handleResubmitForApproval}
            isSelected={selectedQuestions.has(key)}
            onToggleSelect={onToggleSelect}
            // Admin approval props
            approvalStatus={approvalStatuses[key]}
            rejectReason={rejectReasons[key]}
            onSetApprovalStatus={onSetApprovalStatus}
            onSetRejectReason={onSetRejectReason}
          />
        )
      })}

      {pagination?.total > pagination?.pageSize ? (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
          <Pagination
            current={pagination.current}
            pageSize={pagination.pageSize}
            total={pagination.total}
            showSizeChanger={false}
            onChange={(page) => pagination.onChange?.(page)}
          />
        </div>
      ) : null}
    </div>
  )
}
