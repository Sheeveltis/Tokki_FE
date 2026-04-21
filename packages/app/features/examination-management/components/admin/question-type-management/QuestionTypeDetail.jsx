import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'solito/navigation'
import { showAdminSuccess, showAdminError } from '../../../../../../components/HelperAdmin.jsx'
import { Card, Space, Typography, Spin, Alert, Modal, Button, Tabs, Divider, notification, message, Descriptions, Tag } from 'antd'
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  InfoCircleOutlined,
  UnorderedListOutlined,
  FileExcelOutlined,
  CheckCircleOutlined
} from '@ant-design/icons'

import { fetchQuestionBanksPaged } from '../../../api/question-bank-management.js'
import { deleteQuestionType, fetchQuestionTypeById } from '../../../api/question-type-management.js'

import QuestionListSection from './QuestionListSection'
import QuestionTypeHeaderActions from './QuestionTypeHeaderActions'
import { EditQuestionTypeModal } from './EditQuestionTypeModal'

const { Title, Text } = Typography

export function QuestionTypeDetailScreen({ basePath = '/admin', layout = 'admin' }) {
  const router = useRouter()
  const [messageApi, contextHolder] = message.useMessage()
  const params = useParams()
  const questionTypeId = params?.id

  const [questionType, setQuestionType] = useState(null)
  const [allQuestions, setAllQuestions] = useState([])
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [pendingQuestions, setPendingQuestions] = useState([])
  const [totalPending, setTotalPending] = useState(0)
  
  const [loading, setLoading] = useState(true)
  const [loadingList, setLoadingList] = useState(false)
  const [loadingPending, setLoadingPending] = useState(false)
  
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  const [deleting, setDeleting] = useState(false)
  const [pageNumber, setPageNumber] = useState(1)
  const [pendingPageNumber, setPendingPageNumber] = useState(1)

  const PAGE_SIZE = 5
  const PENDING_STATUS = 3

  useEffect(() => {
    let mounted = true

    const load = async () => {
      try {
        setLoading(true)
        setError('')

        const [qt, paged, pagedPending] = await Promise.all([
          fetchQuestionTypeById(questionTypeId),
          fetchQuestionBanksPaged({ QuestionTypeId: questionTypeId, PageNumber: 1, PageSize: PAGE_SIZE }),
          fetchQuestionBanksPaged({ QuestionTypeId: questionTypeId, Status: PENDING_STATUS, PageNumber: 1, PageSize: PAGE_SIZE }),
        ])

        if (!mounted) return
        setQuestionType(qt)
        setAllQuestions(paged?.items || [])
        setTotalQuestions(paged?.total ?? (paged?.items?.length || 0))
        setPendingQuestions(pagedPending?.items || [])
        setTotalPending(pagedPending?.total ?? (pagedPending?.items?.length || 0))
        setPageNumber(1)
        setPendingPageNumber(1)
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

  const [pendingFilters, setPendingFilters] = useState({
    search: '',
    status: PENDING_STATUS,
  })

  // Load questions via GET /api/QuestionBanks with paging (PageSize=5)
  useEffect(() => {
    let mounted = true

    const loadPaged = async () => {
      if (!questionTypeId) return
      try {
        setLoadingList(true)
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
        messageApi.error(err?.message || 'Không thể tải danh sách câu hỏi')
      } finally {
        if (!mounted) return
        setLoadingList(false)
      }
    }

    loadPaged()

    return () => {
      mounted = false
    }
  }, [questionTypeId, filters.status, filters.search, pageNumber])

  // Load pending questions
  useEffect(() => {
    let mounted = true
    const loadPending = async () => {
      if (!questionTypeId) return
      try {
        setLoadingPending(true)
        const searchTerm = pendingFilters.search?.trim() ? pendingFilters.search.trim() : undefined
        const paged = await fetchQuestionBanksPaged({
          QuestionTypeId: questionTypeId,
          Status: PENDING_STATUS,
          SearchTerm: searchTerm,
          PageNumber: pendingPageNumber,
          PageSize: PAGE_SIZE,
        })
        if (!mounted) return
        setPendingQuestions(paged?.items || [])
        setTotalPending(paged?.total ?? (paged?.items?.length || 0))
      } catch (err) {
        if (!mounted) return
        messageApi.error(err?.message || 'Không thể tải danh sách chờ duyệt')
      } finally {
        if (!mounted) return
        setLoadingPending(false)
      }
    }
    loadPending()
    return () => { mounted = false }
  }, [questionTypeId, pendingFilters.search, pendingPageNumber])

  const setSearch = (search) => {
    setPageNumber(1)
    setFilters((prev) => ({ ...prev, search }))
  }

  const setPendingSearch = (search) => {
    setPendingPageNumber(1)
    setPendingFilters((prev) => ({ ...prev, search }))
  }

  const handleNavigate = (key) => {
    const prefix = layout === 'staff' ? '/staff' : '/admin'
    router.push(`${prefix}?tab=${key}`)
  }




  if (loading) {
    return (
      <div style={{ padding: '80px 24px', textAlign: 'center' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text type="secondary">Đang tải dữ liệu...</Text>
        </div>     
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

  const skillEnumMap = {
    1: { label: 'Nghe' },
    2: { label: 'Đọc' },
    3: { label: 'Viết' },
  }

  const examTypeLabelMap = {
    1: 'TOPIK I',
    2: 'TOPIK II',
  }

  const difficultyLabelMap = {
    1: 'Dễ',
    2: 'Trung bình',
    3: 'Khó',
    4: 'Rất khó',
  }

  const infoItems = [
    { label: 'Tên bộ câu hỏi', value: questionType?.name },
    { label: 'Mã bộ câu hỏi', value: questionType?.code, isCode: true },
    { label: 'Kỹ năng', value: skillEnumMap[questionType?.skill]?.label },
    { label: 'Loại đề', value: examTypeLabelMap[questionType?.examType] },
    { label: 'Mức độ', value: difficultyLabelMap[questionType?.difficulty] },
    { label: 'Trạng thái', value: questionType?.isActive ? 'Đã xuất bản' : 'Tạm ẩn' },
    { label: 'Mô tả', value: questionType?.description || 'Chưa có mô tả', span: 2 },
  ]

  return (
    <div style={{ padding: 24, width: '100%' }}>
      {contextHolder}
      
      {/* Header section similar to reference */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <Title level={3} style={{ margin: 0, fontWeight: 700 }}>Chi tiết bộ câu hỏi</Title>
          <Text type="secondary" style={{ fontSize: 13 }}>ID: {questionTypeId}</Text>
        </div>
        <QuestionTypeHeaderActions
          questionTypeId={questionTypeId}
          onBack={() => router.back()}
          onEdit={() => setIsEditing(true)}
          deleting={deleting}
          onDelete={async () => {
            try {
              setDeleting(true)
              await deleteQuestionType(questionTypeId)
              showAdminSuccess('Đã xóa loại câu hỏi thành công')
              router.push(`${basePath}?tab=question-bank`)
            } catch (err) {
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
      </div>

      <Card styles={{ body: { padding: '0 24px 24px 24px' } }} variant="borderless" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.05)', borderRadius: 12 }}>
        <Tabs 
          defaultActiveKey="info" 
          size="large"
          items={[
            {
              key: 'info',
              label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <InfoCircleOutlined />
                  Thông tin cơ bản
                </span>
              ),
              children: (
                <div style={{ paddingTop: 16 }}>
                  <Descriptions column={2} bordered size="middle" labelStyle={{ backgroundColor: '#fafafa', fontWeight: 600, width: '20%' }}>
                    {infoItems.map((item, idx) => (
                      <Descriptions.Item key={idx} label={item.label} span={item.span || 1}>
                        {item.label === 'Trạng thái' ? (
                          <Space>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: questionType?.isActive ? '#52c41a' : '#bfbfbf' }} />
                            <Text style={{ color: questionType?.isActive ? '#52c41a' : '#8c8c8c', fontWeight: 600 }}>{item.value}</Text>
                          </Space>
                        ) : item.label === 'Loại đề' ? (
                          <Tag color="blue">{item.value}</Tag>
                        ) : (
                          <Text style={{ fontWeight: item.isCode ? 400 : 500 }}>{item.value || '-'}</Text>
                        )}
                      </Descriptions.Item>
                    ))}
                  </Descriptions>
                </div>
              )
            },
            {
              key: 'questions',
              label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <UnorderedListOutlined />
                  Danh sách câu hỏi
                </span>
              ),
              children: (
                <div style={{ paddingTop: 16 }}>
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
                </div>
              )
            }
          ]} 
        />
      </Card>
      
      {/* Edit Modal (used when editing from info card) */}
      <EditQuestionTypeModal
        open={isEditing}
        questionType={questionType}
        onCancel={() => setIsEditing(false)}
        onUpdate={async () => {
          setIsEditing(false)
          try {
            const qt = await fetchQuestionTypeById(questionTypeId)
            setQuestionType(qt)
          } catch (err) {
            showAdminError('Không thể tải lại dữ liệu')
          }
        }}
      />
    </div>
  )
}

export default QuestionTypeDetailScreen