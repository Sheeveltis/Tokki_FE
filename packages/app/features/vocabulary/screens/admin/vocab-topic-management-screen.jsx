'use client'

import { useEffect, useMemo, useState, useRef, useCallback } from 'react'
import { Space, Select, Modal, InputNumber, Tooltip } from 'antd'
import { EyeOutlined, EditOutlined, SwapOutlined, PlusOutlined, GlobalOutlined, ArrowLeftOutlined, CheckCircleOutlined, CloseCircleOutlined, UploadOutlined, DownloadOutlined, DeleteOutlined } from '@ant-design/icons'
import { useRouter } from 'solito/navigation'
import { searchFlashcardTopics, createFlashcardTopic, approveTopic, rejectTopic, updateFlashcardTopic, uploadTopicImageToCloudinary, updateTopicOrderIndex, deleteTopic } from '../../api/index.js'
import { showAdminSuccess, showAdminError } from '../../../../../components/HelperAdmin.jsx'
import ManagementLayout from '../../../../../components/layout/management-layout.jsx'
import FlashcardTopicCreateModal from '../../components/admin/vocab-topic-management/vocab-topic-create-modal.jsx'
import TopicApprovalModal from '../../components/admin/vocab-topic-detail/topic-approval-modal.jsx'
import FlashcardTopicEditModal from '../../components/admin/vocab-topic-detail/vocab-topic-edit-modal.jsx'
import { useManagementFilters } from '../../../back-office/hooks/use-management-filters.js'

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
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  
  const [filters, setFilters] = useManagementFilters({
    page: 1,
    size: 20,
    search: '',
    level: 1,
    status: defaultStatus
  })

  // Aliases for compatibility
  const searchTerm = filters.search
  const level = filters.level
  const status = filters.status
  const pagination = {
    current: filters.page,
    pageSize: filters.size,
    total: 0 // Will be updated by loadData
  }
  const [totalItems, setTotalItems] = useState(0)

  const [approvalModalOpen, setApprovalModalOpen] = useState(false)
  const [approvalLoading, setApprovalLoading] = useState(false)
  const [topicIdForApproval, setTopicIdForApproval] = useState(null)
  const [approvalType, setApprovalType] = useState('approve') // 'approve' hoặc 'reject'
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [editingTopic, setEditingTopic] = useState(null)
  const [orderModalOpen, setOrderModalOpen] = useState(false)
  const [orderLoading, setOrderLoading] = useState(false)
  const [orderTopic, setOrderTopic] = useState(null)
  const [orderValue, setOrderValue] = useState(null)
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
        setTotalItems(result.totalCount || 0)
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
    loadData(1, pagination.pageSize, searchTerm, level, status)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData])

  // Debounce search khi searchTerm thay đổi
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      setFilters(prev => ({ ...prev, page: 1 }))
      loadData(1, filters.size, filters.search, filters.level, filters.status)
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
    setFilters(prev => ({ ...prev, page: 1 }))
    loadData(1, filters.size, filters.search, filters.level, filters.status)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.level, filters.status])

  // Cập nhật pending count khi load data với status = 3
  const handleTableChange = (newPagination) => {
    setFilters(prev => ({
      ...prev,
      page: newPagination.current,
      size: newPagination.pageSize
    }))
    loadData(newPagination.current, newPagination.pageSize, filters.search, filters.level, filters.status)
  }

  const handleCreate = async (values) => {
    try {
      setCreateLoading(true)
      const newTopic = await createFlashcardTopic(values)

      // Thêm topic mới vào danh sách
      setData((prev) => [newTopic, ...prev])

      // Refresh pending count nếu topic mới có status = 3
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
    setFilters(prev => ({ ...prev, status: 3, page: 1 }))
  }

  const handleBackToList = () => {
    setFilters(prev => ({ ...prev, status: defaultStatus, page: 1 }))
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

      setApprovalModalOpen(false)
      setTopicIdForApproval(null)
    } catch (err) {
      const errorMessage = err?.message || err?.errors?.[0]?.description || 'Không thể phê duyệt chủ đề'
      showAdminError(errorMessage, err?.statusCode)
    } finally {
      setApprovalLoading(false)
    }
  }

  const handleOpenEditModal = (record, e) => {
    e?.stopPropagation?.()
    setEditingTopic(record)
    setEditModalOpen(true)
  }

  const handleEditSubmit = async (values) => {
    if (!editingTopic) return

    try {
      setEditLoading(true)
      const topicId = editingTopic?.id || editingTopic?._raw?.topicId
      if (!topicId) {
        showAdminError('Không tìm thấy ID chủ đề')
        return
      }

      if (!values?.topicName || !values?.description) {
        showAdminError('Vui lòng nhập đầy đủ thông tin')
        return
      }

      let imgUrl = values?.imgUrl || null
      if (values?.imageFile) {
        try {
          imgUrl = await uploadTopicImageToCloudinary(values.imageFile)
          if (!imgUrl) {
            showAdminError('Không thể upload ảnh lên Cloudinary')
            return
          }
        } catch (err) {
          showAdminError(err?.message || 'Không thể upload ảnh lên Cloudinary')
          return
        }
      }

      const currentStatus = editingTopic?._raw?.status ?? editingTopic?.status ?? 1
      const finalStatus = currentPortal === 'moderator' ? currentStatus : (values.status !== undefined ? values.status : currentStatus)

      await updateFlashcardTopic(topicId, {
        topicName: values.topicName || '',
        description: values.description || '',
        level: values.level || 1,
        status: finalStatus,
        imgUrl: imgUrl,
      })

      showAdminSuccess('Đã cập nhật chủ đề thành công')
      setEditModalOpen(false)
      setEditingTopic(null)
      await loadData(pagination.current, pagination.pageSize, searchTerm, level, status)
    } catch (err) {
      if (err?.isSuccess === false || err?.errors) {
        const errorMessage = err?.message || err?.errors?.[0]?.description || 'Cập nhật chủ đề thất bại'
        showAdminError(errorMessage, err?.statusCode)
      } else {
        showAdminError(err?.message || 'Cập nhật chủ đề thất bại')
      }
    } finally {
      setEditLoading(false)
    }
  }

  const handleUpdateOrderIndex = async (record, value) => {
    const topicId = record?.id || record?.topicId || record?._raw?.topicId
    const currentOrderIndex = record?.orderIndex ?? record?._raw?.orderIndex
    const nextOrderIndex = Number(value)

    if (!topicId || Number.isNaN(nextOrderIndex) || nextOrderIndex < 1) return
    if (Number(currentOrderIndex) === nextOrderIndex) {
      setOrderModalOpen(false)
      setOrderTopic(null)
      return
    }

    try {
      setOrderLoading(true)
      await updateTopicOrderIndex(topicId, nextOrderIndex)
      showAdminSuccess('Cập nhật thứ tự chủ đề thành công')
      setOrderModalOpen(false)
      setOrderTopic(null)
      setOrderValue(null)
      await loadData(pagination.current, pagination.pageSize, searchTerm, level, status)
    } catch (err) {
      const errorMessage = err?.message || err?.errors?.[0]?.description || 'Không thể cập nhật thứ tự chủ đề'
      showAdminError(errorMessage, err?.statusCode)
    } finally {
      setOrderLoading(false)
    }
  }

  const handleOpenOrderIndexModal = (record, e) => {
    e?.stopPropagation?.()
    setOrderTopic(record)
    setOrderValue(record?.orderIndex ?? record?._raw?.orderIndex ?? 1)
    setOrderModalOpen(true)
  }

  const handleDeleteTopic = async (record, e) => {
    e?.stopPropagation?.()
    Modal.confirm({
      title: 'Xóa chủ đề',
      content: `Bạn có chắc chắn muốn xóa chủ đề "${record?.title || record?._raw?.topicName}" không?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const topicId = record?.id || record?.topicId || record?._raw?.topicId
          if (!topicId) {
            showAdminError('Không tìm thấy ID chủ đề')
            return
          }
          await deleteTopic(topicId)
          showAdminSuccess('Xóa chủ đề thành công')
          await loadData(pagination.current, pagination.pageSize, searchTerm, level, status)
        } catch (err) {
          const errorMessage = err?.message || err?.errors?.[0]?.description || 'Không thể xóa chủ đề'
          showAdminError(errorMessage, err?.statusCode)
        }
      },
    })
  }

  // Tính toán portalPrefix một lần dựa trên currentPortal
  const portalPrefix = useMemo(() => {
    return currentPortal === 'staff' ? '/staff' : currentPortal === 'moderator' ? '/moderator' : '/admin'
  }, [currentPortal])

  const columns = useMemo(() => [
    {
      title: 'STT',
      key: 'stt',
      align: 'center',
      width: 80,
      render: (_, __, index) =>
        (filters.page - 1) * filters.size + index + 1,
    },
    { title: 'Tiêu đề', dataIndex: 'title', key: 'title', width: 200 },
    {
      title: 'Mô tả',
      dataIndex: 'subtitle',
      key: 'subtitle',
      width: 250,
      render: (text) => {
        if (text && text.length > 100) {
          return `${text.substring(0, 100)}...`;
        }
        return text;
      },
    },
    { title: 'Level', dataIndex: 'level', key: 'level', width: 100 },
    {
      title: 'Thứ tự',
      dataIndex: 'orderIndex',
      key: 'orderIndex',
      width: 100,
      align: 'center',
      render: (value, record) => value ?? record?._raw?.orderIndex ?? '-',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: status === 3 && currentPortal === 'admin' ? 140 : 100,
      align: 'center',
      render: (status, record) => {
        const statusMap = {
          0: { label: 'Bản nháp', color: '#8c8c8c' },          // Gray
          1: { label: 'Đang hoạt động', color: '#52c41a' },    // Green
          2: { label: 'Đã xóa', color: '#ff4d4f' },            // Red
          3: { label: 'Chờ phê duyệt', color: '#fadb14' },     // Orange
          4: { label: 'Bị từ chối phê duyệt', color: '#fa8c16' }, // Yellow
        }

        const cfg = statusMap[Number(status)] || statusMap[0]

        return (
          <Space size="small" align="center">
            <Tooltip title={cfg.label} color={cfg.color} placement="top">
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  backgroundColor: cfg.color,
                  margin: '0 auto',
                  boxShadow: '0 0 4px rgba(0,0,0,0.3)',
                  cursor: 'pointer',
                }}
              />
            </Tooltip>
            {status === 3 && currentPortal === 'admin' && (
              <>
                <Tooltip title="Phê duyệt">
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
                  >
                    <CheckCircleOutlined style={{ fontSize: 16, color: '#52c41a', transition: 'color 0.2s ease' }} />
                  </div>
                </Tooltip>

                <Tooltip title="Từ chối">
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
                  >
                    <CloseCircleOutlined style={{ fontSize: 16, color: '#ff4d4f', transition: 'color 0.2s ease' }} />
                  </div>
                </Tooltip>
              </>
            )}
          </Space>
        )
      },
    },
    {
      title: 'Hành động',
      key: 'actions',
      align: 'center',
      width: 220,
      render: (_, record) => {
        const iconStyle = { fontSize: 18, cursor: 'pointer', color: '#1890ff' }
        return (
          <Space size="large">
            <Tooltip title="Xem chi tiết">
              <EyeOutlined
                style={iconStyle}
                onClick={(e) => {
                  e?.stopPropagation?.()
                  router.push(`${portalPrefix}/vocab-topic/${record.id}`)
                }}
              />
            </Tooltip>
            <Tooltip title="Chỉnh sửa">
              <EditOutlined
                style={iconStyle}
                onClick={(e) => handleOpenEditModal(record, e)}
              />
            </Tooltip>
            <Tooltip title="Xóa">
              <DeleteOutlined
                style={iconStyle}
                onClick={(e) => handleDeleteTopic(record, e)}
              />
            </Tooltip>
            <Tooltip title="Xem trên web user">
              <GlobalOutlined
                style={iconStyle}
                onClick={(e) => {
                  e?.stopPropagation?.()
                  window.open(`/flashcard/study?topic=${record.id}`, '_blank')
                }}
              />
            </Tooltip>
            <Tooltip title="Đổi vị trí">
              <SwapOutlined
                style={iconStyle}
                onClick={(e) => handleOpenOrderIndexModal(record, e)}
              />
            </Tooltip>
          </Space>
        )
      },
    },
  ], [portalPrefix, router, status, currentPortal, filters.page, filters.size])

  const actions = [
    {
      label: 'Import',
      icon: <UploadOutlined />,
      type: 'dashed',
      onPress: () => showAdminSuccess('Tính năng Import sắp ra mắt'),
    },
    {
      label: 'Export',
      icon: <DownloadOutlined />,
      type: 'dashed',
      onPress: () => showAdminSuccess('Đang xuất dữ liệu...'),
    },
    status === 3
      ? {
        label: 'Trở về danh sách',
        icon: <ArrowLeftOutlined />,
        // style: { backgroundColor: '#1890ff', borderColor: '#1890ff' },
        type: 'default',
        onPress: handleBackToList,
      }
      : {
        label: (
          <Space>
            Danh sách cần duyệt
            {/* <Badge count={pendingCount} size="small" offset={[5, -2]} /> */}
          </Space>
        ),
        icon: <CheckCircleOutlined />,
        type: 'primary',
        onPress: handleShowPendingApproval,
      },
    currentPortal !== 'moderator' && {
      label: 'Thêm chủ đề',
      icon: <PlusOutlined />,
      // style: { backgroundColor: '#F1BE4B', borderColor: '#F1BE4B', color: '#111' },
      onPress: () => setCreateModalOpen(true),
    },
  ].filter(Boolean)

  return (
    <>
      <ManagementLayout
        searchPlaceholder="Tìm kiếm theo tên chủ đề..."
        searchValue={filters.search}
        onSearchChange={val => setFilters(prev => ({ ...prev, search: val }))}
        onSearchSubmit={() => {
          setFilters(prev => ({ ...prev, page: 1 }))
        }}
        extraFilters={
          <Space wrap>
            <Select
              placeholder="Chọn level"
              value={level}
              onChange={(value) => setFilters(prev => ({ ...prev, level: value || 1, page: 1 }))}
              style={{ width: 150 }}
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
              onChange={(val) => setFilters(prev => ({ ...prev, status: val, page: 1 }))}
              style={{ width: 150 }}
            >
              {STATUS_OPTIONS.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Space>
        }
        actions={actions}
        tableProps={{
          columns,
          dataSource: data,
          loading,
          pagination: {
            current: filters.page,
            pageSize: filters.size,
            total: totalItems,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} chủ đề`,
            pageSizeOptions: ['10', '20', '50', '100'],
          },
          onChange: handleTableChange,
        }}
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
      <FlashcardTopicEditModal
        open={editModalOpen}
        loading={editLoading}
        initialValues={{
          topicName: editingTopic?.title || editingTopic?._raw?.topicName || '',
          description: editingTopic?.subtitle || editingTopic?._raw?.description || '',
          level: editingTopic?.level ?? editingTopic?._raw?.level ?? 1,
          status: editingTopic?._raw?.status ?? editingTopic?.status ?? 1,
          imgUrl: editingTopic?.imgUrl || editingTopic?._raw?.imgUrl || '',
        }}
        onCancel={() => {
          setEditModalOpen(false)
          setEditingTopic(null)
        }}
        onSubmit={handleEditSubmit}
        isModerator={currentPortal === 'moderator'}
        isStaff={currentPortal === 'staff'}
      />
      <Modal
        title="Đổi vị trí chủ đề"
        open={orderModalOpen}
        onOk={() => handleUpdateOrderIndex(orderTopic, orderValue)}
        onCancel={() => {
          setOrderModalOpen(false)
          setOrderTopic(null)
          setOrderValue(null)
        }}
        okText="Lưu"
        cancelText="Hủy"
        confirmLoading={orderLoading}
        centered
        width={420}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            padding: '4px 0',
          }}
        >
          <div
            style={{
              background: '#fafafa',
              border: '1px solid #f0f0f0',
              borderRadius: 8,
              padding: '10px 12px',
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            <div style={{ color: '#8c8c8c', marginBottom: 4 }}>Chủ đề</div>
            <div style={{ fontWeight: 600 }}>{orderTopic?.title || orderTopic?._raw?.topicName || '-'}</div>
          </div>

          <div>
            <div style={{ marginBottom: 6, fontWeight: 500 }}>Thứ tự mới</div>
            <InputNumber
              min={1}
              value={orderValue}
              onChange={(value) => setOrderValue(value)}
              style={{ width: '100%' }}
              placeholder="Nhập thứ tự mới"
            />
          </div>
        </div>
      </Modal>
    </>
  )
}

export default FlashcardTopicManagement

