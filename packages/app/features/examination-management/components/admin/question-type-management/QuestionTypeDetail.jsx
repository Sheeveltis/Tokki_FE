import React, { useEffect, useState } from 'react'
import { useRouter } from 'solito/navigation'
import { useParams } from 'react-router-dom'
import { Typography } from 'antd'

import { AdminLayout } from '../../../../back-office/components/admin/admin-layout.web.jsx'
import StaffLayout from '../../../../back-office/components/staff/staff-layout.web.jsx'
import { showAdminSuccess, showAdminError } from '../../../../../../components/HelperAdmin.jsx'
import { fetchQuestionBanksPaged } from '../../../api/question-bank-management.js'
import { deleteQuestionType, fetchQuestionTypeById } from '../../../api/question-type-management.js'

import QuestionTypeHeaderActions from './QuestionTypeHeaderActions'
import QuestionTypeInfoCard from './QuestionTypeInfoCard'
import QuestionListSection from './QuestionListSection'

const { Text } = Typography

export function QuestionTypeDetailScreen({ basePath = '/admin', layout = 'admin' }) {
  const router = useRouter()
  const params = useParams()
  const questionTypeId = params?.id

  const [questionType, setQuestionType] = useState(null)
  const [allQuestions, setAllQuestions] = useState([])
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [pageNumber, setPageNumber] = useState(1)

  const PAGE_SIZE = 5

  useEffect(() => {
    let mounted = true

    const load = async () => {
      try {
        setLoading(true)
        setError('')

        const [qt, paged] = await Promise.all([
          fetchQuestionTypeById(questionTypeId),
          fetchQuestionBanksPaged({ QuestionTypeId: questionTypeId, PageNumber: 1, PageSize: PAGE_SIZE }),
        ])

        if (!mounted) return
        setQuestionType(qt)
        setAllQuestions(paged?.items || [])
        setTotalQuestions(paged?.total ?? (paged?.items?.length || 0))
        setPageNumber(1)
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

  // Load questions via GET /api/QuestionBanks with paging (PageSize=5)
  useEffect(() => {
    let mounted = true

    const loadPaged = async () => {
      if (!questionTypeId) return
      try {
        setLoading(true)
        const status = filters.status !== null && filters.status !== undefined ? filters.status : undefined
        const searchTerm = filters.search?.trim() ? filters.search.trim() : undefined
        const paged = await fetchQuestionBanksPaged({
          QuestionTypeId: questionTypeId,
          Status: status,
          SearchTerm: searchTerm,
          PageNumber: pageNumber,
          PageSize: PAGE_SIZE,
        })
        if (!mounted) return
        setAllQuestions(paged?.items || [])
        setTotalQuestions(paged?.total ?? (paged?.items?.length || 0))
      } catch (err) {
        if (!mounted) return
        showAdminError(err?.message || 'Không thể tải danh sách câu hỏi')
      } finally {
        if (!mounted) return
        setLoading(false)
      }
    }

    loadPaged()

    return () => {
      mounted = false
    }
  }, [questionTypeId, filters.status, filters.search, pageNumber])

  const setSearch = (search) => {
    setPageNumber(1)
    setFilters((prev) => ({ ...prev, search }))
  }

  const handleNavigate = (key) => {
    const prefix = layout === 'staff' ? '/staff' : '/admin'
    router.push(`${prefix}?tab=${key}`)
  }

  const LayoutComponent = layout === 'staff' ? StaffLayout : AdminLayout

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Text type="secondary">Đang tải...</Text>
      </div>
    )
  }

  if (error || !questionType) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Text type="secondary">{error || 'Không tìm thấy loại câu hỏi'}</Text>
      </div>
    )
  }

  return (
    <div style={{ padding: 24 }}>
        <QuestionTypeHeaderActions
          questionTypeId={questionTypeId}
          onBack={() => router.push(`${basePath}?tab=question-bank`)}
          onEdit={() => setIsEditing(true)}
          deleting={deleting}
          onDelete={async () => {
            try {
              setDeleting(true)
              await deleteQuestionType(questionTypeId)
              showAdminSuccess('Đã xóa loại câu hỏi thành công')
              router.push(`${basePath}?tab=question-bank`)
            } catch (err) {
              // message từ backend đã được map qua handleApiError
              showAdminError(err?.message || 'Xóa loại câu hỏi thất bại')
            } finally {
              setDeleting(false)
            }
          }}
          onAddQuestion={() => {
            router.push(`${basePath}/question-bank/create?questionTypeId=${questionTypeId}`)
          }}
          onImported={async () => {
            try {
              const status = filters.status !== null && filters.status !== undefined ? filters.status : undefined
              const searchTerm = filters.search?.trim() ? filters.search.trim() : undefined
              const paged = await fetchQuestionBanksPaged({
                QuestionTypeId: questionTypeId,
                Status: status,
                SearchTerm: searchTerm,
                PageNumber: 1,
                PageSize: PAGE_SIZE,
              })
              setAllQuestions(paged?.items || [])
              setTotalQuestions(paged?.total ?? (paged?.items?.length || 0))
              setPageNumber(1)
            } catch (err) {
              showAdminError(err?.message || 'Không thể tải lại danh sách câu hỏi')
            }
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
              showAdminError('Không thể tải lại dữ liệu')
            }
          }}
        />

        <QuestionListSection
          title="Danh sách câu hỏi"
          total={totalQuestions}
          filters={filters}
          onFilterChange={(next) => {
            setPageNumber(1)
            setFilters(next)
          }}
          onSearchChange={setSearch}
          data={allQuestions}
          loading={loading}
          pagination={{
            current: pageNumber,
            pageSize: PAGE_SIZE,
            total: totalQuestions,
            onChange: (page) => setPageNumber(page),
          }}
          onRefresh={async () => {
            try {
              const status = filters.status !== null && filters.status !== undefined ? filters.status : undefined
              const searchTerm = filters.search?.trim() ? filters.search.trim() : undefined
              const paged = await fetchQuestionBanksPaged({
                QuestionTypeId: questionTypeId,
                Status: status,
                SearchTerm: searchTerm,
                PageNumber: pageNumber,
                PageSize: PAGE_SIZE,
              })
              setAllQuestions(paged?.items || [])
              setTotalQuestions(paged?.total ?? (paged?.items?.length || 0))
            } catch (err) {
              showAdminError(err?.message || 'Không thể tải lại danh sách câu hỏi')
            }
          }}
          onDeleted={async () => {
            try {
              const status = filters.status !== null && filters.status !== undefined ? filters.status : undefined
              const searchTerm = filters.search?.trim() ? filters.search.trim() : undefined
              const paged = await fetchQuestionBanksPaged({
                QuestionTypeId: questionTypeId,
                Status: status,
                SearchTerm: searchTerm,
                PageNumber: pageNumber,
                PageSize: PAGE_SIZE,
              })
              setAllQuestions(paged?.items || [])
              setTotalQuestions(paged?.total ?? (paged?.items?.length || 0))
            } catch (err) {
              showAdminError(err?.message || 'Không thể tải lại danh sách câu hỏi')
            }
          }}
        />

        {/* Pagination handled inside QuestionCardList via props */} 
      </div>
  )
}

export default QuestionTypeDetailScreen
