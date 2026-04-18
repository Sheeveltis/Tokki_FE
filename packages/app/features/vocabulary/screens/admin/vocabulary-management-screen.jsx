'use client'

import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { useRouter } from 'solito/navigation'
import { EyeOutlined, PlusOutlined, GlobalOutlined, FilterOutlined, UploadOutlined, DownloadOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { Modal, Select, Space, Tooltip, message, Badge, Button as AntButton, Table } from 'antd'
import { fetchVocabularies, updateVocabulary, deleteVocabulary, uploadVocabularyImageToCloudinary, fetchVocabularyDetail, importVocabulariesFromExcel } from '../../api/index.js'
import VocabularyEditModal from '../../components/admin/vocabulary-detail/vocabulary-edit-modal.jsx'
import VocabularyCreateModal from '../../components/admin/vocabulary-detail/vocabulary-create-modal.jsx'
import ManagementLayout from '../../../../../components/layout/management-layout.jsx'
import { useManagementFilters } from '../../../back-office/hooks/use-management-filters.js'

const STATUS_OPTIONS = [
  { value: 1, label: 'Hoạt động' },
  { value: 0, label: 'Không hoạt động' },
  { value: 2, label: 'Đã xóa' },
]

export function VocabularyManagement({ initialData = null }) {
  const router = useRouter()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(!initialData)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  })
  const [filters, setFilters] = useManagementFilters({ search: '', status: 1, page: 1, size: 20 })

  const [localSearchText, setLocalSearchText] = useState(filters.search)

  // Sync local search text with filters.search
  useEffect(() => {
    setLocalSearchText(filters.search)
  }, [filters.search])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearchText !== filters.search) {
        handleFilterChange('search', localSearchText)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [localSearchText])

  const [editOpen, setEditOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [editingVocab, setEditingVocab] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState(null)
  const fileInputRef = useRef(null)

  // Xác định cổng hiện tại dựa vào URL
  const getCurrentPortal = () => {
    if (typeof window === 'undefined') return 'admin'
    const pathname = window.location.pathname
    if (pathname === '/staff' || pathname.startsWith('/staff/')) return 'staff'
    if (pathname === '/moderator' || pathname.startsWith('/moderator/')) return 'moderator'
    return 'admin'
  }

  const currentPortal = getCurrentPortal()

  // Tính toán portalPrefix một lần dựa trên currentPortal
  const portalPrefix = useMemo(() => {
    return currentPortal === 'staff' ? '/staff' : currentPortal === 'moderator' ? '/moderator' : '/admin'
  }, [currentPortal])

  const loadData = useCallback(
    async (page = 1, pageSize = 20, statusFilter, searchText) => {
      try {
        setLoading(true)

        // Phân tích search: nếu là ID (vocabId) hoặc text (searchText)
        // VocabId thường có format: chữ và số, không có khoảng trắng, độ dài từ 10-20 ký tự
        let vocabId = null
        let searchQuery = null

        const trimmedSearch = searchText?.trim()
        if (trimmedSearch) {
          // Kiểm tra pattern: không có khoảng trắng, không có ký tự đặc biệt tiếng Hàn (한글), độ dài >= 10
          // Nếu có ký tự tiếng Hàn thì chắc chắn là searchText
          const hasKorean = /[가-힣]/.test(trimmedSearch)
          const hasSpace = trimmedSearch.includes(' ')
          const isLongId = trimmedSearch.length >= 10 && trimmedSearch.length <= 20

          if (!hasKorean && !hasSpace && isLongId && /^[a-zA-Z0-9_-]+$/.test(trimmedSearch)) {
            // Có vẻ như là ID
            vocabId = trimmedSearch
          } else {
            // Là searchText (tiếng Hàn hoặc text khác)
            searchQuery = trimmedSearch
          }
        }

        const res = await fetchVocabularies({
          pageNumber: page,
          pageSize,
          status: statusFilter,
          vocabId,
          searchText: searchQuery,
        })

        // Đảm bảo res.items là array
        const items = Array.isArray(res?.items) ? res.items : []
        setData(items)
        setPagination({
          current: res?.pageNumber || page,
          pageSize: res?.pageSize || pageSize,
          total: res?.totalCount || 0,
        })
      } catch (error) {
        console.error('Error loading vocabularies:', error)
        setData([])
      } finally {
        setLoading(false)
      }
    },
    []
  )

  useEffect(() => {
    // Chỉ dùng initialData khi mount lần đầu và không có search/filter
    if (
      initialData &&
      Array.isArray(initialData) &&
      initialData.length > 0 &&
      !filters.search &&
      filters.status === undefined
    ) {
      setData(initialData)
      setPagination((prev) => ({
        ...prev,
        total: initialData.length,
      }))
    } else {
      // Có search hoặc filter, hoặc không có initialData, load từ API
      loadData(filters.page, filters.size, filters.status, filters.search)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData])

  useEffect(() => {
    loadData(filters.page, filters.size, filters.status, filters.search)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.page, filters.size, filters.status, filters.search])

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }))
  }

  const handlePaginationChange = (newPage, newSize) => {
    setFilters((prev) => {
      const isSizeChanged = prev.size !== newSize
      return {
        ...prev,
        size: newSize,
        page: isSizeChanged ? 1 : newPage,
      }
    })
  }

  const getApiErrorMessage = (err, fallbackMessage) => {
    return (
      err?.response?.data?.message ||
      err?.data?.message ||
      err?.message ||
      err?.errors?.[0]?.description ||
      fallbackMessage
    )
  }

  const handleEdit = (record) => {
    setEditingVocab(record)
    setEditOpen(true)
  }

  const handleUpdate = async (values) => {
    try {
      setEditLoading(true)
      const vocabularyId = editingVocab?.vocabularyId || editingVocab?.id
      if (!vocabularyId) {
        message.error('Không tìm thấy ID từ vựng')
        return
      }

      if (!values?.definition) {
        message.error('Vui lòng nhập định nghĩa')
        return
      }

      let imgURL = values?.imgURL || null
      if (values?.imageFile) {
        try {
          imgURL = await uploadVocabularyImageToCloudinary(values.imageFile)
        } catch (err) {
          message.error(err?.message || 'Không thể upload ảnh lên Cloudinary')
          return
        }
      }

      const payload = {
        vocabularyId,
        text: values?.text || '',
        pronunciation: values?.pronunciation || '',
        definition: values?.definition || '',
        imgURL: imgURL,
        status: values?.status !== undefined ? values.status : 1,
      }

      await updateVocabulary(payload)
      message.success('Đã cập nhật từ vựng thành công')
      setEditOpen(false)
      loadData(filters.page, filters.size, filters.status, filters.search)
    } catch (err) {
      message.error(getApiErrorMessage(err, 'Cập nhật từ vựng thất bại'))
    } finally {
      setEditLoading(false)
    }
  }

  const handleDelete = (record) => {
    const vocabularyId = record?.vocabularyId || record?.id
    if (!vocabularyId) {
      message.error('Không tìm thấy ID từ vựng')
      return
    }

    Modal.confirm({
      title: 'Xác nhận xóa từ vựng',
      centered: true,
      content: `Bạn chắc chắn muốn xóa từ vựng "${record?.text || vocabularyId}"?`,
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { 
        danger: true,
        style: { borderRadius: '2rem', height: 40, padding: '0 24px', fontWeight: 600 } 
      },
      cancelButtonProps: { 
        style: { borderRadius: '2rem', height: 40, padding: '0 24px', fontWeight: 600 } 
      },
      onOk: async () => {
        try {
          setDeleteLoading(true)
          await deleteVocabulary(vocabularyId)
          message.success('Đã xóa từ vựng thành công')
          loadData(filters.page, filters.size, filters.status, filters.search)
        } catch (err) {
          message.error(getApiErrorMessage(err, 'Xóa từ vựng thất bại'))
        } finally {
          setDeleteLoading(false)
        }
      },
    })
  }

  // ==========================================
  // EXCEL HANDLERS
  // ==========================================
  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Reset input để có thể chọn lại cùng 1 file
    e.target.value = ''

    setImporting(true)
    const hide = message.loading('Đang xử lý file Excel...', 0)
    try {
      const res = await importVocabulariesFromExcel(file)
      if (res?.isSuccess) {
        setImportResult(res.data)
        message.success(res.message || 'Import hoàn tất')
        // Load lại trang đầu tiên
        loadData(1, filters.size, filters.status, filters.search)
      } else {
        message.error(res?.message || 'Import thất bại')
      }
    } catch (err) {
      console.error('Import error:', err)
      message.error(getApiErrorMessage(err, 'Lỗi hệ thống khi import file'))
    } finally {
      setImporting(false)
      hide()
    }
  }

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
      ),
    },
    // {
    //   title: () => (
    //     <Tooltip title="ID của từ vựng">
    //       <span>ID</span>
    //     </Tooltip>
    //   ),
    //   dataIndex: 'vocabularyId',
    //   key: 'vocabularyId',
    //   width: 240,
    //   render: (_, record) => record.vocabularyId || record.id || '-',
    // },
    {
      title: <span style={{ fontSize: 'clamp(13px, 1vw, 15px)' }}>Từ vựng (Tiếng Hàn)</span>,
      key: 'text',
      width: '30%',
      render: (_, record) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ 
            fontWeight: 600, 
            fontSize: 'clamp(16px, 1.25vw, 20px)', 
            color: '#262626',
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            wordBreak: 'break-word'
          }}>
            {record.text}
          </span>
          <span style={{ 
            color: '#8c8c8c', 
            fontSize: 'clamp(12px, 0.9vw, 14px)', 
            fontWeight: 'normal',
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            wordBreak: 'break-word'
          }}>
            {record.pronunciation}
          </span>
        </div>
      ),
    },
    {
      title: <span style={{ fontSize: 'clamp(13px, 1vw, 15px)' }}>Ý nghĩa / Định nghĩa</span>,
      dataIndex: 'definition',
      key: 'definition',
      width: '25%',
      render: (text) => (
        <span style={{ 
          fontSize: 'clamp(13px, 1vw, 15px)',
          display: '-webkit-box',
          WebkitLineClamp: 1,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          wordBreak: 'break-word'
        }}>
          {text}
        </span>
      )
    },
    {
      title: <span style={{ fontSize: 'clamp(13px, 1vw, 15px)' }}>Trạng thái</span>,
      dataIndex: 'status',
      key: 'status',
      width: '15%',
      align: 'center',
      render: (status) => {
        const statusMap = {
          1: { label: 'Hoạt động', color: '#52c41a' },
          0: { label: 'Không hoạt động', color: '#fa8c16' },
          2: { label: 'Đã xóa', color: '#f5222d' },
        }
        const statusInfo = statusMap[status] || { label: 'Không xác định', color: '#8c8c8c' }
        return (
          <Tooltip title={statusInfo.label} color={statusInfo.color} placement="top">
            <div
              style={{
                width: 'clamp(14px, 1.1vw, 18px)',
                height: 'clamp(14px, 1.1vw, 18px)',
                borderRadius: '50%',
                backgroundColor: statusInfo.color,
                margin: '0 auto',
                boxShadow: '0 0 4px rgba(0,0,0,0.3)',
                cursor: 'pointer',
              }}
            />
          </Tooltip>
        )
      },
    },
    {
      title: <span style={{ fontSize: 'clamp(13px, 1vw, 15px)' }}>Hành động</span>,
      key: 'actions',
      align: 'center',
      width: '25%',
      render: (_, record) => {
        const vocabId = record.vocabularyId || record.id
        const iconStyle = { fontSize: 'clamp(18px, 1.4vw, 22px)', cursor: 'pointer', color: '#1890ff' }
        return (
          <Space size="large">
            <Tooltip title="Xem chi tiết">
              <EyeOutlined
                style={iconStyle}
                onClick={() => router.push(`${portalPrefix}/vocab/${vocabId}`)}
              />
            </Tooltip>
            <Tooltip title="Chỉnh sửa">
              <EditOutlined
                style={iconStyle}
                onClick={() => handleEdit(record)}
              />
            </Tooltip>
            <Tooltip title="Xóa">
              <DeleteOutlined
                style={iconStyle}
                onClick={() => handleDelete(record)}
              />
            </Tooltip>
            <Tooltip title="Từ điển">
              <GlobalOutlined
                style={iconStyle}
                onClick={() => {
                  if (vocabId) {
                    window.open(`/dictionary/${vocabId}`, '_blank')
                  }
                }}
              />
            </Tooltip>
          </Space>
        )
      },
    },
  ], [filters.page, filters.size, portalPrefix, router])

  const actions = [
    {
      label: 'Import',
      icon: <UploadOutlined />,
      // color: '#107c41',
      type: 'dashed',
      onPress: handleImportClick,
      loading: importing,
    },
    {
      label: 'Export',
      icon: <DownloadOutlined />,
      // color: '#107c41',
      type: 'dashed',
      onPress: () => console.info('Export vocabularies'),
    },
    {
      label: 'Từ điển',
      icon: <GlobalOutlined />,
      // color: '#6366F1',
      type: 'default',
      onPress: () => router.push('/dictionary'),
    },
    {
      label: 'Thêm mới',
      icon: <PlusOutlined />,
      // color: '#F1BE4B',
      onPress: () => setCreateOpen(true),
    },
  ]

  const extraFilters = (
    <Space wrap>
      <Select
        allowClear
        placeholder="Lọc theo trạng thái"
        suffixIcon={<FilterOutlined />}
        style={{ width: 'clamp(160px, 14vw, 220px)', height: 'clamp(32px, 4vh, 40px)', borderRadius: '1rem', fontSize: 'clamp(13px, 1.1vw, 14px)' }}
        value={filters.status}
        onChange={(val) => handleFilterChange('status', val)}
        options={STATUS_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
      />
    </Space>
  )

  return (
    <>
      <ManagementLayout
        searchPlaceholder="Tìm theo ID hoặc tiếng Hàn"
        searchValue={localSearchText}
        onSearchChange={setLocalSearchText}
        onSearchSubmit={() => handleFilterChange('search', localSearchText)}
        extraFilters={extraFilters}
        actions={actions}
        tableProps={{
          columns,
          dataSource: data,
          loading,
          pagination: {
            current: filters.page,
            pageSize: filters.size,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} từ vựng`,
            pageSizeOptions: ['10', '20', '50', '100'],
            onChange: handlePaginationChange,
          },
        }}
      />

      <VocabularyEditModal
        open={editOpen}
        loading={editLoading}
        initialValues={editingVocab || {}}
        onCancel={() => {
          setEditOpen(false)
          setEditingVocab(null)
        }}
        onSubmit={handleUpdate}
      />

      <VocabularyCreateModal
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        onSuccess={() => {
          setCreateOpen(false)
          loadData(1, filters.size, filters.status, filters.search)
        }}
      />

      {/* Hidden File Input for Import */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".xlsx, .xls"
        onChange={handleFileChange}
      />

      {/* Import Result Modal */}
      <Modal
        title={<span style={{ fontWeight: 700, fontSize: 'clamp(16px, 1.2vw, 20px)' }}>Kết quả Import Excel</span>}
        open={!!importResult}
        onOk={() => setImportResult(null)}
        onCancel={() => setImportResult(null)}
        width={800}
        centered
        footer={[
          <AntButton 
            key="close" 
            type="primary" 
            onClick={() => setImportResult(null)}
            style={{ borderRadius: '2rem', height: 40, padding: '0 24px', fontWeight: 600 }}
          >
            Đóng
          </AntButton>
        ]}
      >
        {importResult && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', gap: 24 }}>
              <Badge count={importResult.successList?.length || 0} showZero color="#52c41a">
                <span style={{ marginRight: 8, fontWeight: 500, fontSize: 'clamp(13px, 1vw, 15px)' }}>Thành công</span>
              </Badge>
              <Badge count={importResult.failureList?.length || 0} showZero color="#f5222d">
                <span style={{ marginRight: 8, fontWeight: 500, fontSize: 'clamp(13px, 1vw, 15px)' }}>Thất bại</span>
              </Badge>
            </div>

            {importResult.failureList?.length > 0 && (
              <>
                <div style={{ fontWeight: 600, color: '#f5222d', marginTop: 8, fontSize: 'clamp(13px, 1vw, 15px)' }}>
                  Danh sách lỗi chi tiết:
                </div>
                <Table
                  dataSource={importResult.failureList}
                  rowKey={(record, index) => index}
                  pagination={{ pageSize: 5 }}
                  size="small"
                  columns={[
                    { 
                      title: <span style={{ fontSize: 'clamp(12px, 0.9vw, 14px)' }}>Từ vựng</span>, 
                      dataIndex: 'text', 
                      key: 'text', 
                      width: 150,
                      render: (text) => <span style={{ fontSize: 'clamp(12px, 0.9vw, 14px)' }}>{text}</span>
                    },
                    { 
                      title: <span style={{ fontSize: 'clamp(12px, 0.9vw, 14px)' }}>Định nghĩa</span>, 
                      dataIndex: 'definition', 
                      key: 'definition', 
                      width: 250,
                      render: (text) => <span style={{ fontSize: 'clamp(12px, 0.9vw, 14px)' }}>{text}</span>
                    },
                    {
                      title: <span style={{ fontSize: 'clamp(12px, 0.9vw, 14px)' }}>Lý do lỗi</span>,
                      dataIndex: 'reason',
                      key: 'reason',
                      render: (text) => <span style={{ color: '#ff4d4f', fontSize: 'clamp(12px, 0.9vw, 14px)' }}>{text}</span>
                    },
                  ]}
                />
              </>
            )}
          </div>
        )}
      </Modal>
    </>
  )
}

export default VocabularyManagement

