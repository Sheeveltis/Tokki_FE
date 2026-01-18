'use client'

import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react'
import { Input, Space, Tag, Select, Badge } from 'antd'
import { EyeOutlined, PlusOutlined, SearchOutlined, GlobalOutlined, ClockCircleOutlined, ArrowLeftOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { useRouter } from 'solito/navigation'
import { ButtonV2 } from '../../../../../components/buttonV2.jsx'
import { searchFlashcardTopics, createFlashcardTopic, approveTopic, rejectTopic } from '../../api/index.js'
import { showAdminSuccess, showAdminError } from '../../../../../components/HelperAdmin.jsx'
import ManagementTable from '../../../../../components/ManagementTable.jsx'
import DetailDrawer from '../../../../../components/DetailDrawer.jsx'
import FlashcardTopicCreateModal from '../../components/admin/vocab-topic-management/vocab-topic-create-modal.jsx'
import TopicApprovalModal from '../../components/admin/vocab-topic-detail/topic-approval-modal.jsx'

const { Option } = Select

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tất cả' },
  { value: 0, label: 'Bản nháp' },
  { value: 1, label: 'Đang hoạt động' },
  { value: 2, label: 'Đã xóa' },
  { value: 3, label: 'Chờ phê duyệt' },
  { value: 4, label: 'Bị từ chối phê duyệt' },
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
  
  // Mặc định status = 3 (Chờ phê duyệt) khi ở moderator portal
  const defaultStatus = currentPortal === 'moderator' ? 3 : 1
  
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(!initialData)
  const [drawerItem, setDrawerItem] = useState(null)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [level, setLevel] = useState(null)
  const [status, setStatus] = useState(defaultStatus)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  })
  const [pendingCount, setPendingCount] = useState(0)
  const [approvalModalOpen, setApprovalModalOpen] = useState(false)
  const [approvalLoading, setApprovalLoading] = useState(false)
  const [topicIdForApproval, setTopicIdForApproval] = useState(null)
  const [approvalType, setApprovalType] = useState('approve') // 'approve' hoặc 'reject'
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

  // Load số lượng items cần duyệt
  const loadPendingCount = useCallback(async () => {
    try {
      const result = await searchFlashcardTopics({
        pageNumber: 1,
        pageSize: 1,
        status: 3,
      })
      setPendingCount(result.totalCount || 0)
    } catch (error) {
      console.error('Error loading pending count:', error)
      setPendingCount(0)
    }
  }, [])

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
    // Load số lượng pending khi component mount
    loadPendingCount()
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

  // Cập nhật pending count khi load data với status = 3
  useEffect(() => {
    if (status === 3 && pagination.total > 0) {
      setPendingCount(pagination.total)
    } else if (status !== 3) {
      // Refresh pending count khi không ở chế độ pending
      loadPendingCount()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, pagination.total])

  const handleTableChange = (newPagination) => {
    loadData(newPagination.current, newPagination.pageSize, searchTerm, level, status)
  }

  const handleCreate = async (values) => {
    try {
      setCreateLoading(true)
      const newTopic = await createFlashcardTopic(values)
      
      // Thêm topic mới vào danh sách
      setData((prev) => [newTopic, ...prev])
      
      // Refresh pending count nếu topic mới có status = 3
      if (newTopic?.status === 3) {
        loadPendingCount()
      }
      
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

  const handleShowPendingApproval = () => {
    setStatus(3)
    setPagination((prev) => ({ ...prev, current: 1 }))
  }

  const handleBackToList = () => {
    setStatus(defaultStatus)
    setPagination((prev) => ({ ...prev, current: 1 }))
  }

  const handleOpenApprovalModal = (topicId, type, e) => {
    e?.stopPropagation?.()
    setTopicIdForApproval(topicId)
    setApprovalType(type)
    setApprovalModalOpen(true)
  }

  const handleApprovalSubmit = async (values) => {
    if (!topicIdForApproval) return

    setApprovalLoading(true)

    try {
      if (values.approvalType === 'approve') {
        // Đồng ý phê duyệt
        await approveTopic(topicIdForApproval)
        showAdminSuccess('Phê duyệt chủ đề thành công')
      } else {
        // Từ chối phê duyệt
        const rejectReason = values.rejectionReason?.trim() || ''
        if (!rejectReason || rejectReason.length < 10) {
          showAdminError('Lý do từ chối phải có ít nhất 10 ký tự')
          setApprovalLoading(false)
          return
        }
        await rejectTopic(topicIdForApproval, rejectReason)
        showAdminSuccess('Từ chối phê duyệt chủ đề thành công')
      }

      // Reload lại danh sách sau khi phê duyệt
      await loadData(pagination.current, pagination.pageSize, searchTerm, level, status)
      
      // Refresh pending count
      await loadPendingCount()

      setApprovalModalOpen(false)
      setTopicIdForApproval(null)
    } catch (err) {
      const errorMessage = err?.message || err?.errors?.[0]?.description || 'Không thể phê duyệt chủ đề'
      showAdminError(errorMessage, err?.statusCode)
    } finally {
      setApprovalLoading(false)
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
      width: status === 3 && currentPortal === 'admin' ? 200 : 140,
      align: 'center',
      render: (status, record) => {
        const statusMap = {
          0: { label: 'Bản nháp', color: 'default' },
          1: { label: 'Đang hoạt động', color: 'green' },
          2: { label: 'Đã xóa', color: 'red' },
          3: { label: 'Chờ phê duyệt', color: 'orange' },
          4: { label: 'Bị từ chối phê duyệt', color: 'red' },
        }
        const statusInfo = statusMap[status]
        if (!statusInfo) return '-'
        
        return (
          <Space size="small" align="center">
            <Tag color={statusInfo.color} style={{ fontSize: 12, padding: '2px 6px' }}>
              {statusInfo.label}
            </Tag>
            {status === 3 && currentPortal === 'admin' && (
              <>
                <div
                  onClick={(e) => handleOpenApprovalModal(record.id, 'approve', e)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    padding: '2px 4px',
                    borderRadius: 4,
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f6ffed'
                    e.currentTarget.style.transform = 'scale(1.2)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.transform = 'scale(1)'
                  }}
                  title="Phê duyệt"
                >
                  <CheckCircleOutlined style={{ fontSize: 16, color: '#52c41a', transition: 'color 0.2s ease' }} />
                </div>
                <div
                  onClick={(e) => handleOpenApprovalModal(record.id, 'reject', e)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    padding: '2px 4px',
                    borderRadius: 4,
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#fff1f0'
                    e.currentTarget.style.transform = 'scale(1.2)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.transform = 'scale(1)'
                  }}
                  title="Từ chối"
                >
                  <CloseCircleOutlined style={{ fontSize: 16, color: '#ff4d4f', transition: 'color 0.2s ease' }} />
                </div>
              </>
            )}
          </Space>
        )
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
  ], [portalPrefix, router, status, currentPortal])

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
        <Space wrap>
          {status === 3 ? (
            <ButtonV2
              title="Trở về danh sách"
              color="#1890ff"
              onPress={handleBackToList}
              style={{ minWidth: 160, paddingVertical: 10 }}
              textStyle={{ fontSize: 14 }}
              icon={<ArrowLeftOutlined />}
            />
          ) : (
            <Badge 
              dot={pendingCount >= 1} 
              offset={[-8, 8]}
              styles={{
                indicator: {
                  border: 'none',
                  boxShadow: 'none',
                }
              }}
            >
              <ButtonV2
                title="Danh sách cần duyệt"
                color="#1890ff"
                onPress={handleShowPendingApproval}
                style={{ minWidth: 160, paddingVertical: 10 }}
                textStyle={{ fontSize: 14 }}
                icon={<ClockCircleOutlined />}
              />
            </Badge>
          )}
          {currentPortal !== 'moderator' && (
            <ButtonV2
              title="Thêm chủ đề"
              color="#F1BE4B"
              onPress={() => setCreateModalOpen(true)}
              style={{ minWidth: 140, paddingVertical: 10 }}
              textStyle={{ fontSize: 14 }}
              icon={<PlusOutlined />}
            />
          )}
        </Space>
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
      <TopicApprovalModal
        open={approvalModalOpen}
        loading={approvalLoading}
        initialApprovalType={approvalType}
        onCancel={() => {
          setApprovalModalOpen(false)
          setTopicIdForApproval(null)
          setApprovalType('approve')
        }}
        onSubmit={handleApprovalSubmit}
      />
    </>
  )
}

export default FlashcardTopicManagement

