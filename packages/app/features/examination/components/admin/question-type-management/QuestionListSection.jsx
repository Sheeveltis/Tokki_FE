'use client'

import React, { useState, useEffect } from 'react'
import { Card, Typography, message } from 'antd'
import { submitQuestionBanksForApproval, approveQuestionBanks, rejectQuestionBanks } from '../../../../admin/screens/CreateQuestion/api/api'
import { getCurrentUserRole } from '../../../../provider/api/client'
import { QuestionFilter } from '../../../../admin/screens/QuestionBankManagement/components/QuestionFilter'
import { QuestionCardList } from '../../../../admin/screens/QuestionBankManagement/components/QuestionCardList'

const { Title } = Typography

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
      message.error('Không tìm thấy ID câu hỏi để gửi duyệt')
      return
    }

    try {
      setSubmitting(true)
      await submitQuestionBanksForApproval(questionBankIds)
      message.success(`Đã gửi ${questionBankIds.length} câu hỏi để phê duyệt`)
      setSelectedQuestions(new Set())
      if (onRefresh) {
        onRefresh()
      }
    } catch (error) {
      message.error(error?.message || 'Gửi duyệt thất bại')
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

      message.success(`Đã xử lý ${approveIds.length} duyệt, ${rejectItems.length} từ chối`)
      setApprovalStatuses({})
      setRejectReasons({})
      if (onRefresh) {
        onRefresh()
      }
    } catch (error) {
      message.error(error?.message || 'Xử lý phê duyệt thất bại')
    } finally {
      setSubmitting(false)
    }
  }

  // Đếm số câu hỏi đã chọn duyệt/từ chối
  const approvalCount = Object.values(approvalStatuses).filter((s) => s === 'approve' || s === 'reject').length

  return (
    <Card>
      <Title level={4} style={{ marginBottom: 16 }}>
        {title} ({total})
      </Title>

      <QuestionFilter 
        filters={filters} 
        onFilterChange={onFilterChange} 
        onSearchChange={onSearchChange}
        // Staff: nút gửi duyệt
        onSubmitSelectedForApproval={isStaff ? handleSubmitSelectedForApproval : null}
        selectedCount={selectedQuestions.size}
        // Admin: nút xác nhận duyệt/từ chối
        onConfirmApproval={isAdmin ? handleConfirmApproval : null}
        approvalCount={approvalCount}
        submitting={submitting}
      />

      <QuestionCardList
        data={data}
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

