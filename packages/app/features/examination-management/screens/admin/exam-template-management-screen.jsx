import React, { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'solito/navigation'
import { Space, Select, message, Modal, Tooltip } from 'antd'
import { EyeOutlined, CopyOutlined, FilterOutlined, PlusOutlined } from '@ant-design/icons'
import CreateExamTemplateModal from '../../components/admin/create-exam-template/CreateExamTemplateModal.jsx'
import { useExamTemplatesQuery } from '../../../back-office/api/useAdminQueries.js'
import { duplicateExamTemplate } from '../../../back-office/api/admin-index.js'
import ManagementLayout from '../../../../../components/layout/management-layout.jsx'

const { Option } = Select

// Mapping trạng thái theo enum ExamTemplateStatus
const STATUS_CONFIG = {
  0: { label: 'Nháp', color: '#8c8c8c' },
  1: { label: 'Đã xuất bản', color: '#52c41a' },
  2: { label: 'Đã xóa', color: '#f5222d' },
  3: { label: 'Chờ phê duyệt', color: '#fa8c16' },
  4: { label: 'Từ chối', color: '#f5222d' },
}

export function ExamTemplateManagement({ initialData = null, basePath = '/admin' }) {
  const router = useRouter()

  const [filters, setFilters] = useState({
    search: '',
    status: 1, // Default status is Published (1)
    type: null,
    page: 1,
    size: 20,
  })

  const [createModalOpen, setCreateModalOpen] = useState(false)

  // Gọi API với các filter
  const { data: examTemplatesData, isLoading, refetch } = useExamTemplatesQuery(
    {
      pageNumber: filters.page,
      pageSize: filters.size,
      searchTerm: filters.search,
      status: filters.status,
      type: filters.type,
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
      render: (text, record) => text || record.Name || '-',
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
      ellipsis: false,
      render: (text, record) => text || record.Description || '-',
      width: 300,
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
          <Tooltip title={cfg.label}>
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                backgroundColor: cfg.color,
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
            content: `Bạn có chắc chắn muốn sao chép mẫu đề "${name}"?`,
            okText: 'Sao chép',
            cancelText: 'Hủy',
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
        placeholder="Trạng thái"
        suffixIcon={<FilterOutlined />}
        style={{ width: 160 }}
        value={filters.status}
        onChange={(val) => handleFilterChange('status', val)}
      >
        <Option value={null}>Tất cả trạng thái</Option>
        <Option value={0}>Nháp</Option>
        <Option value={1}>Đã xuất bản</Option>
        <Option value={3}>Chờ phê duyệt</Option>
        <Option value={4}>Từ chối</Option>
        <Option value={2}>Đã xóa</Option>
      </Select>
      <Select
        allowClear
        placeholder="Loại đề"
        suffixIcon={<FilterOutlined />}
        style={{ width: 160 }}
        value={filters.type}
        onChange={(val) => handleFilterChange('type', val)}
      >
        <Option value={null}>Tất cả loại đề</Option>
        <Option value={1}>TOPIK I</Option>
        <Option value={2}>TOPIK II</Option>
        <Option value={3}>Test đầu vào</Option>
      </Select>
    </Space>
  )

  const actions = [
    {
      label: 'Thêm mới',
      icon: <PlusOutlined />,
      type: 'primary',
      onPress: () => setCreateOpen(true)
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
    </>
  )
}

export default ExamTemplateManagement
