import React, { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'solito/navigation'
import { Space, Select, message, Modal, Tooltip, Button } from 'antd'
import { EyeOutlined, CopyOutlined, FilterOutlined, PlusOutlined, EditOutlined, SearchOutlined, UploadOutlined, DownloadOutlined } from '@ant-design/icons'
import CreateExamTemplateModal from '../../components/admin/create-exam-template/CreateExamTemplateModal.jsx'
import EditExamTemplateModal from '../../components/admin/exam-template-detail/EditExamTemplateModal.jsx'
import { useExamTemplatesQuery } from '../../../back-office/api/useAdminQueries.js'
import { duplicateExamTemplate, importExamTemplates, exportExamTemplates, updateExamTemplate } from '../../../back-office/api/admin-index.js'
import ManagementLayout from '../../../../../components/layout/management-layout.jsx'
import { useQueryClient } from '@tanstack/react-query'

import { useManagementFilters } from '../../../back-office/hooks/use-management-filters.js'


// Mapping trạng thái theo enum ExamTemplateStatus
const STATUS_CONFIG = {
  0: { label: 'Nháp', color: 'default', colorHex: '#8c8c8c' },
  1: { label: 'Đã xuất bản', color: 'success', colorHex: '#52c41a' },
  2: { label: 'Đã xóa', color: 'error', colorHex: '#f5222d' },
  3: { label: 'Chờ phê duyệt', color: 'warning', colorHex: '#fa8c16' },
  4: { label: 'Từ chối', color: 'volcano', colorHex: '#f5222d' },
}

export function ExamTemplateManagement({ initialData = null, basePath = '/admin' }) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const [filters, setFilters] = useManagementFilters({
    search: '',
    status: 1, // Default status is Published (Active)
    type: null,
    creatorFilter: 2, // Default to Human (Người tạo)
    page: 1,
    size: 20,
  })

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [importing, setImporting] = useState(false)
  const [exporting, setExporting] = useState(false)
  const fileInputRef = React.useRef(null)

  // Gọi API với các filter
  const { data: examTemplatesData, isLoading, refetch } = useExamTemplatesQuery(
    {
      pageNumber: filters.page,
      pageSize: filters.size,
      searchTerm: filters.search,
      status: filters.status,
      type: filters.type,
      creatorFilter: filters.creatorFilter,
    },
    initialData
  )

  const items = examTemplatesData?.items || []
  const total = examTemplatesData?.totalCount || 0

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

  // Refetch when component mounts
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'exam-templates'] })
  }, [queryClient])

  const columns = useMemo(() => [
    {
      title: () => (
        <Tooltip title="Số thứ tự">
          <span>STT</span>
        </Tooltip>
      ),
      key: 'stt',
      align: 'center',
      width: 60,
      render: (_, __, index) => (filters.page - 1) * filters.size + index + 1
    },
    {
      title: 'Tên mẫu đề',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <span style={{
          fontWeight: 600,
          fontSize: 'clamp(13px, 1vw, 15px)',
          display: '-webkit-box',
          WebkitLineClamp: 1,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          wordBreak: 'break-word'
        }}>
          {text || record.Name || '-'}
        </span>
      ),
      width: 250,
    },
    {
      title: 'Loại đề',
      dataIndex: 'examType',
      key: 'examType',
      render: (text, record) => text || record.ExamType || '-',
      width: 120,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      width: 300,
      render: (text, record) => (
        <span style={{
          fontSize: 'clamp(12px, 0.9vw, 14px)',
          display: '-webkit-box',
          WebkitLineClamp: 1,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          wordBreak: 'break-word',
          color: '#595959'
        }}>
          {text || record.Description || '-'}
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      width: 120,
      render: (status, record) => {
        const val = status ?? record.Status ?? record.status ?? 0
        const cfg = STATUS_CONFIG[val] || STATUS_CONFIG[0]
        return (
          <Tooltip title={cfg.label} color={cfg.colorHex} placement="top">
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                backgroundColor: cfg.colorHex,
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
      title: 'Hành động',
      key: 'actions',
      align: 'center',
      width: 120,
      render: (_, record) => {
        const id = record.id || record.ExamTemplateId || record.examTemplateId
        const name = record.name || record.Name || 'mẫu đề này'

        const handleDuplicate = async (e) => {
          e?.stopPropagation?.()
          Modal.confirm({
            title: 'Xác nhận sao chép',
            centered: true,
            content: `Bạn có chắc chắn muốn sao chép mẫu đề "${name}"?`,
            okText: 'Sao chép',
            cancelText: 'Hủy',
            okButtonProps: { 
              style: { borderRadius: '2rem', height: 40, padding: '0 24px', fontWeight: 600 } 
            },
            cancelButtonProps: { 
              style: { borderRadius: '2rem', height: 40, padding: '0 24px', fontWeight: 600 } 
            },
            onOk: async () => {
              try {
                const result = await duplicateExamTemplate(id)
                message.success('Sao chép mẫu đề thành công')
                refetch()
                if (result?.examTemplateId || result?.ExamTemplateId) {
                  router.push(`${basePath}/exam-templates/${result.examTemplateId || result.ExamTemplateId}`)
                }
              } catch (error) {
                message.error(error?.message || 'Sao chép thất bại')
              }
            },
          })
        }

        return (
          <Space size="large">
            <Tooltip title="Xem chi tiết">
              <EyeOutlined
                style={{ fontSize: 18, cursor: 'pointer', color: '#1890ff' }}
                onClick={(e) => {
                  e?.stopPropagation?.()
                  router.push(`${basePath}/exam-templates/${id}`)
                }}
              />
            </Tooltip>
            <Tooltip title="Chỉnh sửa">
              <EditOutlined
                style={{ fontSize: 18, cursor: 'pointer', color: '#1890ff' }}
                onClick={(e) => {
                  e?.stopPropagation?.()
                  setEditingRecord(record)
                  setEditModalOpen(true)
                }}
              />
            </Tooltip>
            <Tooltip title="Sao chép">
              <CopyOutlined
                style={{ fontSize: 18, cursor: 'pointer', color: '#1890ff' }}
                onClick={handleDuplicate}
              />
            </Tooltip>
          </Space>
        )
      },
    },
  ], [filters, router, basePath, refetch])


  const extraFilters = (
    <Space wrap>
      <Select
        allowClear
        placeholder="Tất cả trạng thái"
        suffixIcon={<FilterOutlined />}
        style={{ width: 160, height: 32, borderRadius: 16, fontSize: 13 }}
        value={filters.status}
        onChange={(val) => handleFilterChange('status', val)}
        options={[
          { value: 0, label: 'Nháp' },
          { value: 3, label: 'Chờ phê duyệt' },
          { value: 1, label: 'Đã xuất bản' },
          { value: 4, label: 'Từ chối' },
          { value: 2, label: 'Đã xóa' },
        ]}
      />
      <Select
        allowClear
        placeholder="Tất cả loại đề"
        suffixIcon={<FilterOutlined />}
        style={{ width: 160, height: 32, borderRadius: 16, fontSize: 13 }}
        value={filters.type}
        onChange={(val) => handleFilterChange('type', val)}
        options={[
          { value: 1, label: 'TOPIK I' },
          { value: 2, label: 'TOPIK II' },
        ]}
      />
      <Select
        allowClear
        placeholder="Nguồn tạo"
        suffixIcon={<FilterOutlined />}
        style={{ width: 160, height: 32, borderRadius: 16, fontSize: 13 }}
        value={filters.creatorFilter}
        onChange={(val) => handleFilterChange('creatorFilter', val)}
        options={[
          { value: 0, label: 'Tất cả nguồn' },
          { value: 1, label: 'Hệ thống A.I' },
          { value: 2, label: 'Người tạo' },
        ]}
      />
    </Space>
  )

  const handleImport = async (file) => {
    try {
      setImporting(true)
      const res = await importExamTemplates(file)
      if (res?.isSuccess) {
        message.success(res.message || 'Import mẫu đề thi thành công')
        refetch()
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
        message.error('Không thể import mẫu đề thi')
      }
    } finally {
      setImporting(false)
    }
  }

  const handleExport = async () => {
    try {
      setExporting(true)
      const blob = await exportExamTemplates()
      const url = window.URL.createObjectURL(new Blob([blob]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `DS_MauDeThi_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '')}.xlsx`)
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
        searchPlaceholder="Tìm theo tên, mô tả..."
        searchValue={filters.search}
        onSearchChange={val => setFilters(prev => ({ ...prev, search: val }))}
        onSearchSubmit={() => handleFilterChange('search', filters.search)}
        extraFilters={extraFilters}
        actions={actions}
        tableProps={{
          columns,
          dataSource: items,
          loading: isLoading && !initialData,
          rowKey: (record) => record.id || record.ExamTemplateId || record.examTemplateId || record.name,
          pagination: {
            current: filters.page,
            pageSize: filters.size,
            total: total,
            showSizeChanger: true,
            onChange: handlePaginationChange,
          }
        }}
      />
      {createModalOpen && (
        <CreateExamTemplateModal
          open={createModalOpen}
          onCancel={() => setCreateModalOpen(false)}
          onSuccess={(examTemplateId) => {
            setCreateModalOpen(false)
            refetch()
            router.push(`${basePath}/exam-templates/${examTemplateId}`)
          }}
        />
      )}

      {editModalOpen && (
        <EditExamTemplateModal
          open={editModalOpen}
          examTemplate={editingRecord}
          onCancel={() => {
            setEditModalOpen(false)
            setEditingRecord(null)
          }}
          onSuccess={async (payload) => {
            try {
              const id = editingRecord.id || editingRecord.ExamTemplateId || editingRecord.examTemplateId
              await updateExamTemplate(id, payload)
              message.success('Cập nhật mẫu đề thành công')
              setEditModalOpen(false)
              setEditingRecord(null)
              refetch()
            } catch (error) {
              // Message error đã được bắn trong updateExamTemplate hoặc Detail modal
              throw error
            }
          }}
        />
      )}

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

export default ExamTemplateManagement
