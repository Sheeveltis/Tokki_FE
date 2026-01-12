'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'solito/navigation'
import { useParams } from 'react-router-dom'
import { Typography, message } from 'antd'

import { AdminLayout } from '../../../components/admin-layout.web.jsx'
import { fetchQuestionBanks } from '../../QuestionBankManagement/api/api'
import { deleteQuestionType, fetchQuestionTypeById } from '../api/api'

import QuestionTypeHeaderActions from './QuestionTypeHeaderActions'
import QuestionTypeInfoCard from './QuestionTypeInfoCard'
import QuestionListSection from './QuestionListSection'

const { Text } = Typography

export function QuestionTypeDetailScreen() {
  const router = useRouter()
  const params = useParams()
  const questionTypeId = params?.id

  const [questionType, setQuestionType] = useState(null)
  const [allQuestions, setAllQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let mounted = true

    const load = async () => {
      try {
        setLoading(true)
        setError('')

        const [qt, qs] = await Promise.all([
          fetchQuestionTypeById(questionTypeId),
          fetchQuestionBanks({ questionTypeId }),
        ])

        if (!mounted) return
        setQuestionType(qt)
        setAllQuestions(qs || [])
      } catch (err) {
        if (!mounted) return
        setError(err?.message || 'Không thể tải dữ liệu')
      } finally {
        if (!mounted) return
        setLoading(false)
      }
    }

    if (questionTypeId) load()

    return () => {
      mounted = false
    }
  }, [questionTypeId])

  const [filters, setFilters] = useState({
    search: '',
    status: null,
  })

  const filteredData = useMemo(() => {
    let result = allQuestions || []

    if (filters.search) {
      const searchLower = filters.search.trim().toLowerCase()
      result = result.filter(
        (item) =>
          (item.content || '').toLowerCase().includes(searchLower) ||
          (item.explanation || '').toLowerCase().includes(searchLower) ||
          (item.questionTypeName || '').toLowerCase().includes(searchLower),
      )
    }

    if (filters.status !== null && filters.status !== undefined) {
      result = result.filter((item) => item.status === filters.status)
    }

    return result
  }, [allQuestions, filters])

  const setSearch = (search) => setFilters((prev) => ({ ...prev, search }))

  const handleNavigate = (key) => {
    router.push(`/admin?tab=${key}`)
  }

  if (loading) {
    return (
      <AdminLayout defaultKey="question-bank" onNavigate={handleNavigate}>
        <div style={{ padding: 24, textAlign: 'center' }}>
          <Text type="secondary">Đang tải...</Text>
        </div>
      </AdminLayout>
    )
  }

  if (error || !questionType) {
    return (
      <AdminLayout defaultKey="question-bank" onNavigate={handleNavigate}>
        <div style={{ padding: 24, textAlign: 'center' }}>
          <Text type="secondary">{error || 'Không tìm thấy loại câu hỏi'}</Text>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout defaultKey="question-bank" onNavigate={handleNavigate}>
      <div style={{ padding: 24 }}>
        <QuestionTypeHeaderActions
          onBack={() => router.push('/admin?tab=question-bank')}
          onEdit={() => setIsEditing(true)}
          deleting={deleting}
          onDelete={async () => {
            try {
              setDeleting(true)
              await deleteQuestionType(questionTypeId)
            message.success('Đã xóa loại câu hỏi thành công')
            router.push('/admin?tab=question-bank')
            } catch (err) {
              // message từ backend đã được map qua handleApiError
              message.error(err?.message || 'Xóa loại câu hỏi thất bại')
            } finally {
              setDeleting(false)
            }
          }}
          onAddQuestion={() => {
            router.push(`/admin/question-bank/create?questionTypeId=${questionTypeId}`)
          }}
        />

        <QuestionTypeInfoCard
          questionType={questionType}
          isEditing={isEditing}
          onCancelEdit={() => setIsEditing(false)}
          onUpdate={async () => {
            setIsEditing(false)
            // Reload question type data
            try {
              const qt = await fetchQuestionTypeById(questionTypeId)
              setQuestionType(qt)
            } catch (err) {
              message.error('Không thể tải lại dữ liệu')
            }
          }}
        />

        <QuestionListSection
          title="Danh sách câu hỏi"
          total={filteredData.length}
          filters={filters}
          onFilterChange={setFilters}
          onSearchChange={setSearch}
          data={filteredData}
            loading={false}
        />
      </div>
    </AdminLayout>
  )
}

export default QuestionTypeDetailScreen
