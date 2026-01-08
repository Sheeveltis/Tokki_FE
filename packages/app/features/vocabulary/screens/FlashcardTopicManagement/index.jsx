'use client'

import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react'
import { Input, Space, Tag, Select } from 'antd'
import { EyeOutlined, PlusOutlined, SearchOutlined, GlobalOutlined } from '@ant-design/icons'
import { useRouter } from 'solito/navigation'
import { ButtonV2 } from '../../../../../components/buttonV2.jsx'
import { searchFlashcardTopics, createFlashcardTopic } from '../../api'
import { showAdminSuccess, showAdminError } from '../../../../../components/HelperAdmin.jsx'
import ManagementTable from '../../../../../components/ManagementTable'
import DetailDrawer from '../../../../../components/DetailDrawer'
import FlashcardTopicCreateModal from './components/flashcard-topic-create-modal'

const { Option } = Select

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tất cả' },
  { value: 0, label: 'Nháp/Ẩn' },
  { value: 1, label: 'Hoạt động' },
  { value: 2, label: 'Đã xóa' },
  { value: 3, label: 'Chờ phê duyệt' },
]

export function FlashcardTopicManagement({ initialData = null }) {
  const router = useRouter()
  
  // Xác định cổng hiện tại dựa vào URL - đọc trực tiếp mỗi lần render để đảm bảo luôn lấy giá trị mới nhất
  const getCurrentPortal = () => {
    if (typeof window === 'undefined') return 'admin'
    const pathname = window.location.pathname
    // Kiểm tra exact match hoặc startsWith để cover cả /staff và /staff/...
    if (pathname === '/staff' || pathname.startsWith('/staff/')) return 'staff'
    if (pathname === '/moderator' || pathname.startsWith('/moderator/')) return 'moderator'
    return 'admin'
  }
  
  const currentPortal = getCurrentPortal()
  
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(!initialData)
  const [drawerItem, setDrawerItem] = useState(null)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [level, setLevel] = useState(null)
  const [status, setStatus] = useState(1)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  })
  const searchTimeoutRef = useRef(null)

  const loadData = useCallback(
    async (page = 1, pageSize = 20, searchText, levelFilter, statusFilter) => {
      try {
        setLoading(true)
        const result = await searchFlashcardTopics({
          pageNumber: page,
          pageSize,
          searchTerm: searchText?.trim() || undefined,
          level: levelFilter !== null ? levelFilter : undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
        })
        setData(result.items || [])
        setPagination({
          current: result.pageNumber || page,
          pageSize: result.pageSize || pageSize,
          total: result.totalCount || 0,
        })
      } catch (error) {
        console.error('Error loading flashcard topics:', error)
        setData([])
      } finally {
        setLoading(false)
      }
    },
    []
  )

  useEffect(() => {
    // Chỉ dùng initialData khi mount lần đầu và không có search/filter
    if (initialData && Array.isArray(initialData) && initialData.length > 0 && !searchTerm && level === null && status === 'all') {
      setData(initialData)
      setPagination((prev) => ({
        ...prev,
        total: initialData.length,
      }))
    } else {
      // Có search hoặc filter, load từ API
      loadData(1, pagination.pageSize, searchTerm, level, status)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData])

  // Debounce search khi searchTerm thay đổi
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      setPagination((prev) => ({ ...prev, current: 1 }))
      loadData(1, pagination.pageSize, searchTerm, level, status)
    }, 500)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm])

  // Load khi level hoặc status thay đổi
  useEffect(() => {
    setPagination((prev) => ({ ...prev, current: 1 }))
    loadData(1, pagination.pageSize, searchTerm, level, status)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level, status])

  const handleTableChange = (newPagination) => {
    loadData(newPagination.current, newPagination.pageSize, searchTerm, level, status)
  }

  const handleCreate = async (values) => {
    try {
      setCreateLoading(true)
      const newTopic = await createFlashcardTopic(values)
      
      // Thêm topic mới vào danh sách
      setData((prev) => [newTopic, ...prev])
      
      showAdminSuccess('Đã tạo chủ đề flashcard thành công')
      setCreateModalOpen(false)
    } catch (err) {
      // err có thể là response object từ API hoặc error object
      if (err?.isSuccess === false || err?.errors) {
        // Là response từ API với lỗi
        const errorMessage = err?.message || err?.errors?.[0]?.description || 'Tạo chủ đề flashcard thất bại'
        showAdminError(errorMessage, err?.statusCode)
      } else {
        // Là error khác
        showAdminError(err?.message || 'Tạo chủ đề flashcard thất bại')
      }
    } finally {
      setCreateLoading(false)
    }
  }

  // Tính toán portalPrefix một lần dựa trên currentPortal
  const portalPrefix = useMemo(() => {
    return currentPortal === 'staff' ? '/staff' : currentPortal === 'moderator' ? '/moderator' : '/admin'
  }, [currentPortal])

  const columns = useMemo(() => [
    { title: 'Mã', dataIndex: 'id', key: 'id', width: 200 },
    { title: 'Tiêu đề', dataIndex: 'title', key: 'title' },
    { title: 'Mô tả', dataIndex: 'subtitle', key: 'subtitle' },
    { title: 'Level', dataIndex: 'level', key: 'level', width: 120 },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      align: 'center',
      render: (status) => {
        const statusMap = {
          0: { label: 'Nháp/Ẩn', color: 'default' },
          1: { label: 'Hoạt động', color: 'green' },
          2: { label: 'Đã xóa', color: 'red' },
          3: { label: 'Chờ phê duyệt', color: 'orange' },
        }
        const statusInfo = statusMap[status]
        if (!statusInfo) return '-'
        return <Tag color={statusInfo.color} style={{ fontSize: 12, padding: '2px 6px' }}>{statusInfo.label}</Tag>
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      align: 'center',
      width: 140,
      render: (_, record) => {
        return (
        <Space size="middle">
          <div
            onClick={(e) => {
              e?.stopPropagation?.()
              router.push(`${portalPrefix}/vocab-topic/${record.id}`)
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: 4,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f0f0f0'
              e.currentTarget.style.transform = 'scale(1.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.transform = 'scale(1)'
            }}
            title="Xem chi tiết (Admin)"
          >
            <EyeOutlined style={{ fontSize: 18, color: '#111', transition: 'color 0.2s ease' }} />
          </div>
          <div
            onClick={(e) => {
              e?.stopPropagation?.()
              window.open(`/flashcard/study?topic=${record.id}`, '_blank')
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: 4,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#e6f7ff'
              e.currentTarget.style.transform = 'scale(1.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.transform = 'scale(1)'
            }}
            title="Xem trên web user"
          >
            <GlobalOutlined style={{ fontSize: 18, color: '#1890ff', transition: 'color 0.2s ease' }} />
          </div>
        </Space>
        )
      },
    },
  ], [portalPrefix, router])

  return (
    <>
      <Space style={{ marginBottom: 12, width: '100%', justifyContent: 'space-between' }} wrap>
        <Space wrap>
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Tìm kiếm theo tên chủ đề..."
            style={{ width: 300 }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select
            placeholder="Chọn level"
            value={level}
            onChange={setLevel}
            style={{ width: 150 }}
            allowClear
          >
            {[1, 2, 3, 4, 5, 6].map((lvl) => (
              <Option key={lvl} value={lvl}>
                Level {lvl}
              </Option>
            ))}
          </Select>
          <Select
            placeholder="Chọn trạng thái"
            value={status}
            onChange={setStatus}
            style={{ width: 150 }}
          >
            {STATUS_OPTIONS.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Space>
        <ButtonV2
          title="Thêm chủ đề"
          color="#F1BE4B"
          onPress={() => setCreateModalOpen(true)}
          style={{ minWidth: 140, paddingVertical: 10 }}
          textStyle={{ fontSize: 14 }}
          icon={<PlusOutlined />}
        />
      </Space>
      <ManagementTable
        columns={columns}
        dataSource={data}
        loading={loading}
        onRowClick={(record) => setDrawerItem(record)}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} chủ đề`,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        onChange={handleTableChange}
      />
      <DetailDrawer
        open={!!drawerItem && !createModalOpen}
        onClose={() => setDrawerItem(null)}
        title="Chi tiết chủ đề flashcard"
        data={drawerItem || {}}
      />
      <FlashcardTopicCreateModal
        open={createModalOpen}
        loading={createLoading}
        onCancel={() => setCreateModalOpen(false)}
        onSubmit={handleCreate}
      />
    </>
  )
}

export default FlashcardTopicManagement

