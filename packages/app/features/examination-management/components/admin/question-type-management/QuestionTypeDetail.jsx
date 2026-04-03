import React, { useEffect, useState } from 'react'
import { useRouter } from 'solito/navigation'
import { useParams } from 'react-router-dom'
import { Card, Space, Typography, Spin, Alert, Modal, Button, Tabs, Divider, notification, message } from 'antd'
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

import { AdminLayout } from '../../../../back-office/components/admin/admin-layout.web.jsx'
import StaffLayout from '../../../../back-office/components/staff/staff-layout.web.jsx'
import { fetchQuestionBanksPaged } from '../../../api/question-bank-management.js'
import { deleteQuestionType, fetchQuestionTypeById } from '../../../api/question-type-management.js'

import QuestionTypeInfoCard from './QuestionTypeInfoCard'
import QuestionListSection from './QuestionListSection'
import QuestionTypeHeaderActions from './QuestionTypeHeaderActions'

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

  const LayoutComponent = layout === 'staff' ? StaffLayout : AdminLayout

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

  const detailContent = (
    <div
      style={{
        width: '100%',
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
      }}
    >
      {contextHolder}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            <Title level={3} style={{ marginBottom: 4, marginTop: 0 }}>
              Chi tiết loại câu hỏi
            </Title>
            <Text type="secondary" style={{ fontSize: 14 }}>ID: {questionTypeId}</Text>
          </div>

          <Space size="small" wrap>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => router.back()}
              style={{
                borderRadius: 20,
                height: 40,
                padding: '0 20px',
                fontWeight: 600
              }}
            >
              Quay lại
            </Button>

            <Divider orientation="vertical" style={{ height: 24, margin: '0 12px', borderLeft: '2px solid #e8e8e8ff' }} />

            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => setIsEditing(true)}
              style={{
                borderRadius: 20,
                height: 40,
                padding: '0 20px',
                fontWeight: 600
              }}
            >
              Chỉnh sửa
            </Button>

            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={async () => {
                Modal.confirm({
                  title: 'Xác nhận xóa loại câu hỏi',
                  content: `Bạn chắc chắn muốn xóa loại câu hỏi "${questionType?.title || questionTypeId}"? Tất cả câu hỏi thuộc loại này cũng sẽ bị xóa.`,
                  okText: 'Xóa',
                  cancelText: 'Hủy',
                  okButtonProps: { danger: true },
                  onOk: async () => {
                    try {
                      setDeleting(true)
                      await deleteQuestionType(questionTypeId)
                      messageApi.success('Đã xóa loại câu hỏi thành công')
                      router.push(`${basePath}?tab=question-bank`)
                    } catch (err) {
                      messageApi.error(err?.message || 'Xóa loại câu hỏi thất bại')
                    } finally {
                      setDeleting(false)
                    }
                  },
                })
              }}
              loading={deleting}
              style={{
                borderRadius: 20,
                height: 40,
                padding: '0 20px',
                fontWeight: 600
              }}
            >
              Xóa
            </Button>
          </Space>
        </div>

        <div style={{ backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0', overflow: 'hidden' }}>
          <Tabs
            defaultActiveKey="basic-info"
            tabBarStyle={{ padding: '4px 24px 0', borderBottom: '1px solid #f0f0f0', background: '#ffffff', margin: 0 }}
            items={[
              {
                key: 'basic-info',
                label: (
                  <Space>
                    <InfoCircleOutlined />
                    <span style={{ fontWeight: 500 }}>Thông tin cơ bản</span>
                  </Space>
                ),
                children: (
                  <div style={{ padding: 24 }}>
                    <QuestionTypeInfoCard
                      questionType={questionType}
                      isEditing={isEditing}
                      onCancelEdit={() => setIsEditing(false)}
                      onUpdate={async () => {
                        setIsEditing(false)
                        try {
                          const qt = await fetchQuestionTypeById(questionTypeId)
                          setQuestionType(qt)
                          messageApi.success('Đã cập nhật dữ liệu thành công')
                        } catch (err) {
                          messageApi.error('Không thể tải lại dữ liệu')
                        }
                      }}
                    />
                  </div>
                )
              },
              {
                key: 'pending-questions',
                label: (
                  <Space>
                    <CheckCircleOutlined />
                    <span style={{ fontWeight: 500 }}>Duyệt câu hỏi ({totalPending})</span>
                  </Space>
                ),
                children: (
                  <div style={{ padding: 24 }}>
                    <QuestionListSection
                      title="Câu hỏi chờ duyệt"
                      total={totalPending}
                      filters={pendingFilters}
                      onFilterChange={() => {}}
                      onSearchChange={setPendingSearch}
                      data={pendingQuestions}
                      loading={loadingPending}
                      pagination={{
                        current: pendingPageNumber,
                        pageSize: PAGE_SIZE,
                        total: totalPending,
                        onChange: (page) => setPendingPageNumber(page),
                      }}
                      hideStatusFilter={true}
                      showApprovalActions={true}
                      onRefresh={async () => {
                        try {
                          const searchTerm = pendingFilters.search?.trim() ? pendingFilters.search.trim() : undefined
                          const paged = await fetchQuestionBanksPaged({
                            QuestionTypeId: questionTypeId,
                            Status: PENDING_STATUS,
                            SearchTerm: searchTerm,
                            PageNumber: pendingPageNumber,
                            PageSize: PAGE_SIZE,
                          })
                          setPendingQuestions(paged?.items || [])
                          setTotalPending(paged?.total ?? (paged?.items?.length || 0))
                        } catch (err) {
                          messageApi.error(err?.message || 'Không thể tải lại danh sách')
                        }
                      }}
                      onDeleted={async () => {
                        try {
                          const searchTerm = pendingFilters.search?.trim() ? pendingFilters.search.trim() : undefined
                          const paged = await fetchQuestionBanksPaged({
                            QuestionTypeId: questionTypeId,
                            Status: PENDING_STATUS,
                            SearchTerm: searchTerm,
                            PageNumber: pendingPageNumber,
                            PageSize: PAGE_SIZE,
                          })
                          setPendingQuestions(paged?.items || [])
                          setTotalPending(paged?.total ?? (paged?.items?.length || 0))
                        } catch (err) {
                          messageApi.error(err?.message || 'Không thể tải lại danh sách')
                        }
                      }}
                    />
                  </div>
                )
              },
              {
                key: 'question-list',
                label: (
                  <Space>
                    <UnorderedListOutlined />
                    <span style={{ fontWeight: 500 }}>Danh sách câu hỏi ({totalQuestions})</span>
                  </Space>
                ),
                children: (
                  <div style={{ padding: 24 }}>
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
                      loading={loadingList}
                      pagination={{
                        current: pageNumber,
                        pageSize: PAGE_SIZE,
                        total: totalQuestions,
                        onChange: (page) => setPageNumber(page),
                      }}
                      hidePendingOption={true}
                      extraActions={
                        <QuestionTypeHeaderActions
                          questionTypeId={questionTypeId}
                          onBack={() => {}} 
                          onEdit={() => {}} 
                          deleting={deleting}
                          onDelete={() => {}} 
                          hideMainButtons={true}
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
                              messageApi.success('Import câu hỏi thành công')
                            } catch (err) {
                              messageApi.error(err?.message || 'Không thể tải lại danh sách câu hỏi')
                            }
                          }}
                        />
                      }
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
                          messageApi.error(err?.message || 'Không thể tải lại danh sách câu hỏi')
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
                          messageApi.success('Đã xóa câu hỏi thành công')
                        } catch (err) {
                          messageApi.error(err?.message || 'Không thể tải lại danh sách câu hỏi')
                        }
                      }}
                    />
                  </div>
                )
              }
            ]}
          />
        </div>
      </div>
    </div>
  )

  return detailContent
}

export default QuestionTypeDetailScreen
