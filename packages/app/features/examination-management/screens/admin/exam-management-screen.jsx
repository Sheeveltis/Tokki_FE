'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'solito/navigation'
import { Space, Tag, Select, Tooltip, Card, Button } from 'antd'
import { EyeOutlined, FilterOutlined, PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, DownloadOutlined } from '@ant-design/icons'
import { message, Modal } from 'antd'
import ManagementLayout from '../../../../../components/layout/management-layout.jsx'
import { useExamsAdmin } from '../../api/exam-hooks.js'
import { deleteExam, importExams, exportExams } from '../../api/exam-management.js'
import CreateExamModal from '../../components/admin/create-exam-modal.jsx'
import { useQueryClient } from '@tanstack/react-query'

import { useManagementFilters } from '../../../back-office/hooks/use-management-filters.js'

const { Option } = Select

// Map status enum values to display text
const STATUS_MAP = {
  0: { color: '#8c8c8c', text: 'Nháp' },
  1: { color: '#52c41a', text: 'Đã xuất bản' },
  2: { color: '#f5222d', text: 'Đã xóa' },
}

// Map type enum values to display text
const TYPE_MAP = {
  1: 'TOPIK I',
  2: 'TOPIK II',
}

// Map creator filter enum
const CREATOR_FILTER_MAP = {
  0: 'Tất cả',
  1: 'Hệ thống A.I',
  2: 'Người tạo',
}

// Map sort by enum
const SORT_BY_MAP = {
  0: 'Ngày tạo',
  1: 'Số người tham gia',
  2: 'Lượt tải PDF',
  3: 'Điểm trung bình',
}

export function ExamManagement({ initialData = null }) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const [filters, setFilters] = useManagementFilters({
    search: '',
    status: undefined,
    type: undefined,
    creatorFilter: 0,
    sortBy: 0,
    isDescending: true,
    page: 1,
    size: 20,
  })

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [importing, setImporting] = useState(false)
  const [exporting, setExporting] = useState(false)
  const fileInputRef = React.useRef(null)

  // Fetch exams from API
  const { data: examsData, isLoading } = useExamsAdmin({
    PageNumber: filters.page,
    PageSize: filters.size,
    SearchTerm: filters.search || undefined,
    Status: filters.status,
    Type: filters.type,
    CreatorFilter: filters.creatorFilter,
    SortBy: filters.sortBy,
    IsDescending: filters.isDescending,
  })

  const data = examsData?.items || initialData || []

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const handlePaginationChange = (newPage, newSize) => {
    setFilters(prev => {
      const isSizeChanged = prev.size !== newSize;
      return {
        ...prev,
        size: newSize,
        page: isSizeChanged ? 1 : newPage
      }
    })
  }

  // Refetch when component mounts to ensure data is fresh (especially when coming back from detail)
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['exams', 'admin'] })
  }, [queryClient])

  const columns = useMemo(() => [
    {
      title: <span style={{ fontSize: 'clamp(13px, 1vw, 15px)' }}>STT</span>,
      key: 'stt',
      align: 'center',
      width: '5%',
      render: (_, __, index) => (
        <span style={{ fontSize: 'clamp(13px, 1vw, 15px)' }}>
          {(filters.page - 1) * filters.size + index + 1}
        </span>
      )
    },
    {
      title: <span style={{ fontSize: 'clamp(13px, 1vw, 15px)' }}>Tiêu đề</span>,
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      width: '25%',
      render: (text) => <span style={{ fontWeight: 600, fontSize: 'clamp(13px, 1vw, 15px)' }}>{text}</span>
    },
    {
      title: <span style={{ fontSize: 'clamp(13px, 1vw, 15px)' }}>Cấu trúc đề</span>,
      dataIndex: 'examTemplateName',
      key: 'examTemplateName',
      ellipsis: true,
      width: '25%',
      render: (text) => <span style={{ color: '#595959', fontSize: 'clamp(12px, 0.9vw, 14px)' }}>{text}</span>
    },
    {
      title: <span style={{ fontSize: 'clamp(13px, 1vw, 15px)' }}>Loại đề</span>,
      dataIndex: 'type',
      key: 'type',
      width: '12%',
      render: (type) => {
        return <Tag color="blue" style={{ fontSize: 'clamp(11px, 0.8vw, 13px)', borderRadius: 4 }}>{TYPE_MAP[type] || type}</Tag>
      }
    },
    {
      title: <span style={{ fontSize: 'clamp(13px, 1vw, 15px)' }}>Trạng thái</span>,
      dataIndex: 'status',
      key: 'status',
      width: '11%',
      align: 'center',
      render: (status) => {
        const statusInfo = STATUS_MAP[status] || { color: '#8c8c8c', text: `Status ${status}` }
        return (
          <Tooltip title={statusInfo.text}>
            <div
              style={{
                width: 'clamp(14px, 1.1vw, 18px)',
                height: 'clamp(14px, 1.1vw, 18px)',
                borderRadius: '50%',
                backgroundColor: statusInfo.color,
                margin: '0 auto',
                boxShadow: '0 0 4px rgba(0,0,0,0.3)',
                cursor: 'pointer'
              }}
            />
          </Tooltip>
        )
      }
    },
    {
      title: <span style={{ fontSize: 'clamp(13px, 1vw, 15px)' }}>Hành động</span>,
      key: 'actions',
      align: 'center',
      width: '17%',
      render: (_, record) => {
        const iconStyle = { fontSize: 'clamp(18px, 1.4vw, 22px)', cursor: 'pointer', color: '#1890ff' }
        return (
          <Space size="large">
            <Tooltip title="Xem chi tiết">
              <EyeOutlined
                style={iconStyle}
                onClick={(e) => {
                  e?.stopPropagation?.()
                  router.push(`/admin/exams/${record.examId}`)
                }}
              />
            </Tooltip>
            <Tooltip title="Chỉnh sửa">
              <EditOutlined
                style={iconStyle}
                onClick={(e) => {
                  e?.stopPropagation?.()
                  router.push(`/admin/exams/${record.examId}`)
                }}
              />
            </Tooltip>
            <Tooltip title="Xóa">
              <DeleteOutlined
                style={iconStyle}
                onClick={(e) => {
                  e?.stopPropagation?.()
                  Modal.confirm({
                    title: 'Xác nhận xóa',
                    centered: true,
                    content: `Bạn có chắc chắn muốn xóa đề thi "${record.title}"?`,
                    okText: 'Xóa',
                    okType: 'danger',
                    cancelText: 'Hủy',
                    okButtonProps: { 
                      style: { borderRadius: '2rem', height: 40, padding: '0 24px', fontWeight: 600 } 
                    },
                    cancelButtonProps: { 
                      style: { borderRadius: '2rem', height: 40, padding: '0 24px', fontWeight: 600 } 
                    },
                    onOk: async () => {
                      try {
                        await deleteExam(record.examId)
                        message.success('Xóa đề thi thành công')
                        queryClient.invalidateQueries({ queryKey: ['exams', 'admin'] })
                      } catch (error) {
                        message.error('Lỗi khi xóa đề thi')
                      }
                    }
                  })
                }}
              />
            </Tooltip>
          </Space>
        )
      }
    },
  ], [filters, router, queryClient])

  const renderCard = (record) => {
    const statusInfo = STATUS_MAP[record.status] || { color: '#8c8c8c', text: `Status ${record.status}` }
    return (
      <Card
        hoverable
        style={{
          borderRadius: 16,
          overflow: 'hidden',
          border: '1px solid #f0f0f0',
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}
        styles={{ body: { padding: 16, flex: 1, display: 'flex', flexDirection: 'column' } }}
        onClick={() => router.push(`/admin/exams/${record.examId}`)}
      >
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Tag color="blue" style={{ borderRadius: 4 }}>{TYPE_MAP[record.type] || record.type}</Tag>
          <Tooltip title={statusInfo.text}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: statusInfo.color,
                boxShadow: `0 0 6px ${statusInfo.color}80`
              }}
            />
          </Tooltip>
        </div>

        <Tooltip title={record.title}>
          <div style={{
            fontSize: 16,
            fontWeight: 600,
            marginBottom: 8,
            color: '#262626',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: '1.4',
            minHeight: '2.8em'
          }}>
            {record.title}
          </div>
        </Tooltip>

        <div style={{ marginTop: 'auto' }}>
          <div style={{ marginBottom: 12, fontSize: 13, color: '#595959' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span>Số người tham gia:</span>
              <span style={{ fontWeight: 600, color: '#262626' }}>{record.totalParticipants || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span>Tổng số câu hỏi:</span>
              <span style={{ fontWeight: 600, color: '#262626' }}>{record.totalQuestions || 0}</span>
            </div>
            {record.inProgressCount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span>Đang làm bài:</span>
                <span style={{ fontWeight: 600, color: '#1890ff' }}>{record.inProgressCount}</span>
              </div>
            )}
          </div>
          <div style={{ fontSize: 13, color: '#8c8c8c', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {record.examTemplateName}
          </div>
        </div>
      </Card>
    )
  }

  const extraFilters = (
    <Space wrap>
      <Select
        allowClear
        placeholder="Tất cả nguồn"
        suffixIcon={<FilterOutlined />}
        style={{ width: 'clamp(140px, 12vw, 180px)', height: 'clamp(32px, 4vh, 40px)', borderRadius: '1rem', fontSize: 'clamp(13px, 1.1vw, 14px)' }}
        value={filters.creatorFilter}
        onChange={(val) => handleFilterChange('creatorFilter', val)}
      >
        {Object.entries(CREATOR_FILTER_MAP).map(([val, label]) => (
          <Option key={val} value={Number(val)}>{label}</Option>
        ))}
      </Select>

      <Select
        allowClear
        placeholder="Tất cả trạng thái"
        suffixIcon={<FilterOutlined />}
        style={{ width: 'clamp(140px, 12vw, 180px)', height: 'clamp(32px, 4vh, 40px)', borderRadius: '1rem', fontSize: 'clamp(13px, 1.1vw, 14px)' }}
        value={filters.status}
        onChange={(val) => handleFilterChange('status', val)}
      >
        <Option value={0}>Nháp</Option>
        <Option value={1}>Đã xuất bản</Option>
        <Option value={2}>Đã xóa</Option>
      </Select>

      <Select
        allowClear
        placeholder="Tất cả loại đề"
        suffixIcon={<FilterOutlined />}
        style={{ width: 'clamp(140px, 12vw, 180px)', height: 'clamp(32px, 4vh, 40px)', borderRadius: '1rem', fontSize: 'clamp(13px, 1.1vw, 14px)' }}
        value={filters.type}
        onChange={(val) => handleFilterChange('type', val)}
      >
        <Option value={1}>TOPIK I</Option>
        <Option value={2}>TOPIK II</Option>
      </Select>

      <Select
        placeholder="Sắp xếp theo"
        style={{ width: 'clamp(140px, 12vw, 180px)', height: 'clamp(32px, 4vh, 40px)', borderRadius: '1rem', fontSize: 'clamp(13px, 1.1vw, 14px)' }}
        value={filters.sortBy}
        onChange={(val) => handleFilterChange('sortBy', val)}
      >
        {Object.entries(SORT_BY_MAP).map(([val, label]) => (
          <Option key={val} value={Number(val)}>{label}</Option>
        ))}
      </Select>
    </Space>
  )

  const handleImport = async (file) => {
    try {
      setImporting(true)
      const res = await importExams(file)
      if (res?.isSuccess) {
        message.success(res.message || 'Import đề thi thành công')
        queryClient.invalidateQueries({ queryKey: ['exams', 'admin'] })
      } else if (res?.message) {
        Modal.error({
          title: 'Lỗi Import Excel',
          content: <div style={{ whiteSpace: 'pre-line' }}>{res.message}</div>,
          width: 600,
        })
      }
    } catch (e) {
      const apiData = e?.response?.data
      if (apiData?.message) {
        Modal.error({
          title: 'Lỗi Import Excel',
          content: <div style={{ whiteSpace: 'pre-line' }}>{apiData.message}</div>,
          width: 600,
        })
      } else {
        message.error('Không thể import đề thi')
      }
    } finally {
      setImporting(false)
    }
  }

  const handleExport = async () => {
    try {
      setExporting(true)
      const blob = await exportExams()
      const url = window.URL.createObjectURL(new Blob([blob]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `DS_DeThi_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '')}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
      message.success('Xuất file Excel thành công')
    } catch (e) {
      message.error('Không thể xuất file Excel')
    } finally {
      setExporting(false)
    }
  }

  const actions = [
    {
      label: 'Import',
      icon: <UploadOutlined />,
      type: 'dashed',
      loading: importing,
      onPress: () => fileInputRef.current?.click()
    },
    {
      label: 'Export',
      icon: <DownloadOutlined />,
      type: 'dashed',
      loading: exporting,
      onPress: handleExport
    },
    {
      label: 'Thêm mới',
      icon: <PlusOutlined />,
      type: 'primary',
      onPress: () => setCreateModalOpen(true)
    }
  ]

  return (
    <>
      <ManagementLayout
        searchPlaceholder="Tìm kiếm tiêu đề, cấu trúc đề..."
        searchValue={filters.search}
        onSearchChange={val => setFilters(prev => ({ ...prev, search: val }))}
        onSearchSubmit={() => handleFilterChange('search', filters.search)}
        extraFilters={extraFilters}
        actions={actions}
        renderCard={renderCard}
        tableProps={{
          columns,
          dataSource: data,
          loading: isLoading && !initialData,
          rowKey: "examId",
          pagination: {
            current: filters.page,
            pageSize: filters.size,
            total: examsData?.total || 0,
            showSizeChanger: true,
            onChange: handlePaginationChange
          }
        }}
      />
      <CreateExamModal
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        onSuccess={async (examId) => {
          await queryClient.invalidateQueries({ queryKey: ['exams', 'admin'] })
          router.push(`/admin/exams/${examId}`)
        }}
      />

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".xlsx, .xls"
        onChange={(e) => {
          const file = e.target.files[0]
          if (file) {
            handleImport(file)
            e.target.value = ''
          }
        }}
      />
    </>
  )
}

export default ExamManagement
