import React, { useState, useEffect } from 'react'
import { Card, Typography, Tabs } from 'antd'
import { showAdminSuccess, showAdminError } from '../../../../../../components/HelperAdmin.jsx'
import { submitQuestionBanksForApproval, approveQuestionBanks, rejectQuestionBanks } from '../../../api/create-question.js'
import { getCurrentUserRole } from '../../../../../provider/api/client.js'
import { QuestionFilter } from '../question-bank-management/QuestionFilter'
import { QuestionCardList } from '../question-bank-management/QuestionCardList'

const { Title } = Typography

const QUESTION_BANK_STATUS = {
  DRAFT: 0,
  ACTIVE: 1,
  DELETED: 2,
  PENDING_APPROVAL: 3,
  REJECTED: 4,
  ASSIGNED: 5,
}

export function QuestionListSection({
  title,
  total,
  filters,
  onFilterChange,
  onSearchChange,
  data,
  loading,
  onDeleted,
  onRefresh,
  pagination,
}) {
  const [selectedQuestions, setSelectedQuestions] = useState(new Set())
  const [submitting, setSubmitting] = useState(false)
  
  // Admin approval state: { [questionId]: 'approve' | 'reject' | null }
  const [approvalStatuses, setApprovalStatuses] = useState({})
  // Admin reject reasons: { [questionId]: string }
  const [rejectReasons, setRejectReasons] = useState({})
  
  const role = getCurrentUserRole()
  const isAdmin = role === 'Admin'
  const isStaff = role === 'Staff'

  // Reset selected questions và approval statuses khi data thay đổi
  useEffect(() => {
    setSelectedQuestions(new Set())
    setApprovalStatuses({})
    setRejectReasons({})
  }, [data])

  const handleToggleSelect = (questionId, checked) => {
    setSelectedQuestions((prev) => {
      const next = new Set(prev)
      if (checked) {
        next.add(questionId)
      } else {
        next.delete(questionId)
      }
      return next
    })
  }

  const handleSetApprovalStatus = (questionId, status) => {
    setApprovalStatuses((prev) => ({
      ...prev,
      [questionId]: status,
    }))
    // Clear reject reason if not rejecting
    if (status !== 'reject') {
      setRejectReasons((prev) => {
        const next = { ...prev }
        delete next[questionId]
        return next
      })
    }
  }

  const handleSetRejectReason = (questionId, reason) => {
    setRejectReasons((prev) => ({
      ...prev,
      [questionId]: reason,
    }))
  }

  // Staff: Gửi duyệt các câu hỏi nháp đã chọn
  const handleSubmitSelectedForApproval = async () => {
    if (selectedQuestions.size === 0) return

    const questionBankIds = Array.from(selectedQuestions)
      .map((id) => {
        const question = data.find((q) => (q.questionBankId || q.id) === id)
        return question?.questionBankId || question?.id
      })
      .filter(Boolean)

    if (questionBankIds.length === 0) {
      showAdminError('Không tìm thấy ID câu hỏi để gửi duyệt')
      return
    }

    try {
      setSubmitting(true)
      await submitQuestionBanksForApproval(questionBankIds)
      showAdminSuccess(`Đã gửi ${questionBankIds.length} câu hỏi để phê duyệt`)
      setSelectedQuestions(new Set())
      if (onRefresh) {
        onRefresh()
      }
    } catch (error) {
      showAdminError(error?.message || 'Gửi duyệt thất bại')
    } finally {
      setSubmitting(false)
    }
  }

  // Admin: Xác nhận duyệt/từ chối các câu hỏi đã tick
  const handleConfirmApproval = async () => {
    const approveIds = []
    const rejectItems = []

    Object.entries(approvalStatuses).forEach(([questionId, status]) => {
      if (status === 'approve') {
        approveIds.push(questionId)
      } else if (status === 'reject') {
        const reason = rejectReasons[questionId] || ''
        rejectItems.push({ questionId, reason })
      }
    })

    if (approveIds.length === 0 && rejectItems.length === 0) {
      message.warning('Chưa có câu hỏi nào được chọn duyệt hoặc từ chối')
      return
    }

    try {
      setSubmitting(true)

      // Gọi API approve cho các câu hỏi được duyệt
      if (approveIds.length > 0) {
        await approveQuestionBanks(approveIds)
      }

      // Gọi API reject cho từng câu hỏi bị từ chối (vì mỗi câu có lí do riêng)
      for (const item of rejectItems) {
        await rejectQuestionBanks([item.questionId], item.reason)
      }

      showAdminSuccess(`Đã xử lý ${approveIds.length} duyệt, ${rejectItems.length} từ chối`)
      setApprovalStatuses({})
      setRejectReasons({})
      if (onRefresh) {
        onRefresh()
      }
    } catch (error) {
      showAdminError(error?.message || 'Xử lý phê duyệt thất bại')
    } finally {
      setSubmitting(false)
    }
  }

  // Đếm số câu hỏi đã chọn duyệt/từ chối
  const approvalCount = Object.values(approvalStatuses).filter((s) => s === 'approve' || s === 'reject').length

  // Tabs: All vs Pending Approval
  const tabItems = [
    { key: 'all', label: 'Tất cả các câu hỏi' },
    { key: 'pending', label: 'Các câu hỏi đang chờ duyệt' },
  ]

  const activeTabKey =
    filters.status === QUESTION_BANK_STATUS.PENDING_APPROVAL ? 'pending' : 'all'

  const handleTabChange = (key) => {
    const nextStatus = key === 'pending' ? QUESTION_BANK_STATUS.PENDING_APPROVAL : null
    onFilterChange?.({
      ...filters,
      status: nextStatus,
    })
  }

  // Filter data based on active tab
  const filteredData =
    activeTabKey === 'pending'
      ? (data || []).filter((q) => (q.status ?? null) === QUESTION_BANK_STATUS.PENDING_APPROVAL)
      : (data || []).filter((q) => (q.status ?? null) !== QUESTION_BANK_STATUS.PENDING_APPROVAL)

  const displayTotal = filteredData.length

  return (
    <Card>
      <Title level={4} style={{ marginBottom: 16 }}>
        {title} ({displayTotal})
      </Title>

      <Tabs
        items={tabItems}
        activeKey={activeTabKey}
        onChange={handleTabChange}
        style={{ marginBottom: 12 }}
      />

      <QuestionFilter 
        filters={filters} 
        onFilterChange={(next) => {
          // Ở tab "pending": luôn giữ status = PendingApproval, không cho chọn status khác
          if (activeTabKey === 'pending') {
            onFilterChange?.({ ...next, status: QUESTION_BANK_STATUS.PENDING_APPROVAL })
            return
          }
          // Ở tab "all": không cho chọn PendingApproval (đã có tab riêng), chuyển về null
          if (next.status === QUESTION_BANK_STATUS.PENDING_APPROVAL) {
            onFilterChange?.({ ...next, status: null })
            return
          }
          onFilterChange?.(next)
        }} 
        onSearchChange={onSearchChange}
        // Staff: nút gửi duyệt
        onSubmitSelectedForApproval={isStaff ? handleSubmitSelectedForApproval : null}
        selectedCount={selectedQuestions.size}
        // Admin: nút xác nhận duyệt/từ chối
        onConfirmApproval={isAdmin ? handleConfirmApproval : null}
        approvalCount={approvalCount}
        submitting={submitting}
        // Ẩn filter status ở tab pending; ở tab all thì bỏ option pending
        hideStatusFilter={activeTabKey === 'pending'}
        hidePendingOption={activeTabKey === 'all'}
      />

      <QuestionCardList
        data={filteredData}
        loading={loading}
        onDeleted={onDeleted}
        onRefresh={onRefresh}
        pagination={pagination}
        selectedQuestions={selectedQuestions}
        onToggleSelect={handleToggleSelect}
        // Admin approval props
        approvalStatuses={approvalStatuses}
        rejectReasons={rejectReasons}
        onSetApprovalStatus={handleSetApprovalStatus}
        onSetRejectReason={handleSetRejectReason}
      />
    </Card>
  )
}

export default QuestionListSection

