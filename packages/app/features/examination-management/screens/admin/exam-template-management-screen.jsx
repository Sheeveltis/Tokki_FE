import React, { useState, useMemo } from 'react'
import { useRouter } from 'solito/navigation'
import { Space, Select, message, Modal } from 'antd'
import { EyeOutlined, CopyOutlined, FilterOutlined, PlusOutlined } from '@ant-design/icons'
import DetailDrawer from '../../../../../components/DetailDrawer.jsx'
import CreateExamTemplateModal from '../../components/admin/create-exam-template/CreateExamTemplateModal.jsx'
import { useExamTemplatesQuery } from '../../../back-office/api/useAdminQueries.js'
import { duplicateExamTemplate } from '../../../back-office/api/admin-index.js'
import ManagementLayout from '../../../../../components/layout/management-layout.jsx'

// Options cho Status filter
const statusOptions = [
  { value: null, label: 'Tất cả trạng thái' },
  { value: 0, label: 'Nháp' },
  { value: 1, label: 'Đã xuất bản' },
  { value: 2, label: 'Đã xóa' },
  { value: 3, label: 'Chờ phê duyệt' },
  { value: 4, label: 'Từ chối' },
]

// Options cho Type filter
const typeOptions = [
  { value: null, label: 'Tất cả loại đề' },
  { value: 1, label: 'TOPIK I' },
  { value: 2, label: 'TOPIK II' },
  { value: 3, label: 'Test đầu vào' },
]

// Mapping trạng thái theo enum ExamTemplateStatus
const statusMap = {
  0: { label: 'Nháp', color: 'default' },
  1: { label: 'Đã xuất bản', color: 'green' },
  2: { label: 'Đã xóa', color: 'red' },
  3: { label: 'Chờ phê duyệt', color: 'orange' },
  4: { label: 'Từ chối', color: 'volcano' },
}

// Helper function để lấy thông tin trạng thái
const getStatusInfo = (status) => {
  return statusMap[status] || { label: `Trạng thái ${status}`, color: 'default' }
}

export function ExamTemplateManagement({ initialData = null, basePath = '/admin' }) {
  const router = useRouter()
  const [drawerItem, setDrawerItem] = useState(null)
  const [search, setSearch] = useState('')
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [pageNumber, setPageNumber] = useState(1)
  const [status, setStatus] = useState(1)
  const [type, setType] = useState(null) // null = lấy tất cả loại đề
  const pageSize = 20

  // Debounce search để tránh gọi API quá nhiều
  const [debouncedSearch,  setDebouncedSearch] = useState('')
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPageNumber(1) // Reset về trang 1 khi search
    }, 500) // Debounce 500ms

    return () => clearTimeout(timer)
  }, [search])

  const handleSearchSubmit = () => {
    setDebouncedSearch(search)
    setPageNumber(1)
  }

  // Reset về trang 1 khi filter thay đổi
  React.useEffect(() => {
    setPageNumber(1)
  }, [status, type])

  // Gọi API với các filter
  const { data: examTemplatesData, isLoading, refetch } = useExamTemplatesQuery(
    {
      pageNumber,
      pageSize,
      searchTerm: debouncedSearch,
      status: status, // Có thể là null để lấy tất cả
      type: type, // null = lấy tất cả loại đề
    },
    initialData
  )

  const data = useMemo(() => {
    if (initialData) return initialData
    return examTemplatesData?.items || []
  }, [initialData, examTemplatesData])

  const filteredData = data // Không cần filter client-side nữa vì API đã filter

  const columns = [
    { 
      title: 'Tên mẫu đề', 
      dataIndex: 'name', 
      key: 'name',
      render: (text, record) => text || record.Name || '-'
    },
    { 
      title: 'Loại đề', 
      dataIndex: 'examType', 
      key: 'examType',
      render: (text, record) => text || record.ExamType || '-'
    },
    { 
      title: 'Mô tả', 
      dataIndex: 'description', 
      key: 'description',
      ellipsis: true,
      render: (text, record) => text || record.Description || '-'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      width: 100,
      render: (status, record) => {
        const statusValue = status ?? record.Status ?? record.status ?? 0
        const statusInfo = getStatusInfo(statusValue)
        return (
          <div
            title={statusInfo.label}
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: statusInfo.color === 'default' ? '#8c8c8c' : statusInfo.color,
              margin: '0 auto',
              boxShadow: '0 0 4px rgba(0,0,0,0.25)'
            }}
          />
        )
      }
    },
    {
      title: 'Thao tác',
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
                // Refetch danh sách
                refetch()
                // Navigate đến mẫu đề mới
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
          <Space size="middle" style={{ justifyContent: 'center' }}>
            <EyeOutlined
              style={{ fontSize: 18, cursor: 'pointer', padding: 8, color: '#1890ff' }}
              title="Xem chi tiết"
              onClick={(e) => {
                e?.stopPropagation?.()
                router.push(`${basePath}/exam-templates/${id}`)
              }}
            />
            <CopyOutlined
              style={{ fontSize: 18, cursor: 'pointer', padding: 8, color: '#1890ff' }}
              title="Sao chép mẫu đề"
              onClick={handleDuplicate}
            />
          </Space>
        )
      },
    },
  ]

  const actions = [
    {
      label: 'Thêm mẫu đề',
      icon: <PlusOutlined />,
      color: '#F1BE4B',
      style: { backgroundColor: '#F1BE4B', borderColor: '#F1BE4B', color: '#111' },
      onPress: () => setCreateModalOpen(true)
    }
  ]

  const extraFilters = (
    <Space wrap>
      <Select
        allowClear
        placeholder="Chọn trạng thái"
        suffixIcon={<FilterOutlined />}
        style={{ width: 160 }}
        value={status}
        onChange={(value) => setStatus(value)}
        options={statusOptions}
      />
      <Select
        allowClear
        placeholder="Chọn loại đề"
        suffixIcon={<FilterOutlined />}
        style={{ width: 160 }}
        value={type}
        onChange={(value) => setType(value)}
        options={typeOptions}
      />
    </Space>
  )

  return (
    <>
      <ManagementLayout
        searchPlaceholder="Tìm theo tên, mô tả, loại đề"
        searchValue={search}
        onSearchChange={setSearch}
        onSearchSubmit={handleSearchSubmit}
        extraFilters={extraFilters}
        actions={actions}
        tableProps={{
          columns,
          dataSource: filteredData,
          loading: isLoading && !initialData,
          onRowClick: (record) => setDrawerItem(record),
          rowKey: (record) => record.id || record.ExamTemplateId || record.examTemplateId || record.name,
          pagination: {
            current: pageNumber,
            pageSize: pageSize,
            total: examTemplatesData?.totalCount || 0,
            showSizeChanger: false,
            onChange: (page) => setPageNumber(page),
          }
        }}
      />
      <DetailDrawer
        open={!!drawerItem}
        onClose={() => setDrawerItem(null)}
        title="Chi tiết mẫu đề"
        data={drawerItem || {}}
      />
      {createModalOpen && (
        <CreateExamTemplateModal
          open={createModalOpen}
          onCancel={() => setCreateModalOpen(false)}
          onSuccess={(examTemplateId) => {
            setCreateModalOpen(false)
            // Refetch danh sách sau khi tạo mới
            refetch()
            router.push(`${basePath}/exam-templates/${examTemplateId}`)
          }}
        />
      )}
    </>
  )
}

export default ExamTemplateManagement

