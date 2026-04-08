import { useEffect, useState } from 'react'
import { useRouter } from 'solito/navigation'
import { Select, Space, message, Tooltip, Input } from 'antd'
import { EyeOutlined, DownloadOutlined, UploadOutlined, FilterOutlined, PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons'

import { fetchUsers, importAccount, exportAccount } from '../../../api/user-management.js'
import { useManagementFilters } from '../../../../back-office/hooks/use-management-filters'
import AccountDetails from './account-details'
import DeleteUserConfirm from '../user-detail/DeleteUserConfirm'
import UserEditModal from './user-edit-modal'
import { Modal, Table, Badge, Avatar, Button as AntButton } from 'antd'
import { useRef } from 'react'

import ManagementLayout from '../../../../../../components/layout/management-layout'

// ==========================================
// 1. CONFIG & UTILS
// ==========================================
const ROLE_OPTIONS = [
  { value: 0, label: 'Người dùng' },
  { value: 1, label: 'Quản trị viên' },
  { value: 2, label: 'Nhân viên' },
  { value: 3, label: 'Thành viên VIP' }
]

const STATUS_CONFIG = {
  0: { label: 'Vô hiệu hóa', color: '#8c8c8c' },
  1: { label: 'Hoạt động', color: '#52c41a' },
  2: { label: 'Đã bị khóa', color: '#f5222d' },
}

const getRoleLabel = (val) => ROLE_OPTIONS.find(opt => opt.value === Number(val))?.label || val

const VIP_STATUS_OPTIONS = [
  { value: 1, label: 'Thành viên VIP' },
  { value: 0, label: 'Người dùng thường' }
]

// ==========================================
// 2. MAIN COMPONENT
// ==========================================
export default function AccountManage({ basePath = '/admin' }) {
  const router = useRouter()

  const [data, setData] = useState({ items: [], total: 0 })
  const [loading, setLoading] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [editUserId, setEditUserId] = useState(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)

  const [filters, setFilters] = useManagementFilters({
    searchText: '',
    status: null,
    role: null,
    vipStatus: null,
    page: 1,
    size: 20
  })

  const [importResult, setImportResult] = useState(null)
  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef(null)

  const loadData = async (currentFilters) => {
    setLoading(true)
    try {
      const res = await fetchUsers({
        pageNumber: currentFilters.page,
        pageSize: currentFilters.size,
        searchText: currentFilters.searchText,
        status: currentFilters.status,
        role: currentFilters.role,
        vipStatus: currentFilters.vipStatus
      })
      setData({ items: res.items || [], total: res.total || 0 })
    } catch (error) {
      message.error('Lỗi tải danh sách người dùng')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData(filters)
  }, [filters.page, filters.size, filters.status, filters.role, filters.vipStatus, filters.searchText])

  // Hàm xử lý khi LỌC (Search, Status, Role) -> Luôn về trang 1
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  // Hàm xử lý riêng khi CHUYỂN TRANG / ĐỔI SIZE
  const handlePaginationChange = (newPage, newSize) => {
    setFilters(prev => {
      // Nếu user đổi số lượng hiển thị (size), ta đưa về trang 1. 
      // Nếu chỉ bấm Next/Prev trang, ta đi tới trang đó.
      const isSizeChanged = prev.size !== newSize;
      return {
        ...prev,
        size: newSize,
        page: isSizeChanged ? 1 : newPage
      }
    })
  }

  // ==========================================
  // EXCEL HANDLERS
  // ==========================================
  const handleExport = async () => {
    const hide = message.loading('Đang chuẩn bị file Excel...', 0)
    try {
      const blob = await exportAccount()
      const url = window.URL.createObjectURL(new Blob([blob]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `Danh_sach_nguoi_dung_${new Date().toLocaleDateString()}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
      message.success('Xuất file thành công!')
    } catch (error) {
      console.error('Export error:', error)
      message.error('Lỗi khi xuất file Excel')
    } finally {
      hide()
    }
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Reset input
    e.target.value = ''

    setImporting(true)
    const hide = message.loading('Đang xử lý file...', 0)
    try {
      const res = await importAccount(file)
      if (res?.isSuccess) {
        setImportResult(res.data)
        message.success(res.message || 'Import hoàn tất')
        loadData(filters)
      } else {
        message.error(res?.message || 'Import thất bại')
      }
    } catch (error) {
      console.error('Import error:', error)
      message.error('Lỗi hệ thống khi import file')
    } finally {
      setImporting(false)
      hide()
    }
  }

  // ==========================================
  // 3. UI CONFIGS
  // ==========================================
  const columns = [
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
      title: 'Avatar',
      key: 'avatar',
      align: 'center',
      width: '8%',
      render: (_, record) => (
        <Avatar
          size={{ xs: 32, sm: 40, md: 44, lg: 48, xl: 52, xxl: 60 }}
          src={record.avatarUrl || undefined}
          style={{ 
            backgroundColor: record.avatarUrl ? 'transparent' : '#1890ff', 
            border: '1px solid #f0f0f0',
            fontSize: 'clamp(16px, 1.2vw, 20px)'
          }}
        >
          {!record.avatarUrl && (record.fullName?.[0]?.toUpperCase() || record.name?.[0]?.toUpperCase() || 'U')}
        </Avatar>
      )
    },
    {
      title: <span style={{ fontSize: 'clamp(13px, 1vw, 15px)' }}>Họ tên</span>,
      dataIndex: 'fullName',
      render: (_, r) => <span style={{ fontSize: 'clamp(13px, 1vw, 15px)', fontWeight: 500 }}>{r.fullName || r.name || ''}</span>,
      width: '20%',
    },
    {
      title: <span style={{ fontSize: 'clamp(13px, 1vw, 15px)' }}>Email</span>,
      dataIndex: 'email',
      render: (text) => <span style={{ fontSize: 'clamp(13px, 1vw, 15px)', color: '#595959', wordBreak: 'break-all' }}>{text}</span>,
      width: '25%',
    },
    {
      title: <span style={{ fontSize: 'clamp(13px, 1vw, 15px)' }}>Vai trò</span>,
      dataIndex: 'role',
      align: 'center',
      width: '15%',
      render: val => <span style={{ fontSize: 'clamp(13px, 1vw, 15px)' }}>{getRoleLabel(val)}</span>
    },
    {
      title: <span style={{ fontSize: 'clamp(13px, 1vw, 15px)' }}>Trạng thái</span>,
      dataIndex: 'status',
      align: 'center',
      width: '12%',
      render: val => {
        const cfg = STATUS_CONFIG[Number(val)] || STATUS_CONFIG[0]
        return (
          <Tooltip title={cfg.label} color={cfg.color} placement="top">
            <div style={{
              width: 'clamp(14px, 1.2vw, 18px)',
              height: 'clamp(14px, 1.2vw, 18px)',
              borderRadius: '50%',
              backgroundColor: cfg.color,
              margin: '0 auto',
              boxShadow: '0 0 4px rgba(0,0,0,0.3)',
              cursor: 'pointer'
            }} />
          </Tooltip>
        )
      }
    },
    {
      title: <span style={{ fontSize: 'clamp(13px, 1vw, 15px)' }}>Hành động</span>,
      align: 'center',
      width: '15%',
      render: (_, record) => {
        const iconStyle = { fontSize: 'clamp(18px, 1.4vw, 22px)', cursor: 'pointer', color: '#1890ff' }
        return (
          <Space size="large">
            <Tooltip title="Xem chi tiết">
              <EyeOutlined
                style={iconStyle}
                onClick={() => {
                  setSelectedUserId(record.id || record.userId)
                  setInitialEdit(false)
                }}
              />
            </Tooltip>
            <Tooltip title="Chỉnh sửa">
              <EditOutlined
                style={iconStyle}
                onClick={() => {
                  setEditUserId(record.id || record.userId)
                }}
              />
            </Tooltip>
            {Number(record.status) !== 0 && (
              <Tooltip title="Vô hiệu hóa">
                <DeleteOutlined
                  style={iconStyle}
                  onClick={() => {
                    setUserToDelete(record)
                    setDeleteOpen(true)
                  }}
                />
              </Tooltip>
            )}
          </Space>
        )
      }
    }
  ]

  const actions = [
    {
      label: 'Import',
      icon: <UploadOutlined />,
      type: 'dashed',
      onPress: handleImportClick,
      loading: importing
    },
    {
      label: 'Export',
      icon: <DownloadOutlined />,
      type: 'dashed',
      onPress: handleExport
    },
    { label: 'Thêm mới', icon: <PlusOutlined />, type: 'primary', onPress: () => router.push(`${basePath}/users/create-admin-staff`) }
  ]

  const extraFilters = (
    <Space wrap>
      <Select
        allowClear placeholder="Lọc VIP" suffixIcon={<FilterOutlined />}
        style={{ minWidth: 120, width: 'min(160px, 100%)', height: 'clamp(32px, 36px, 40px)', borderRadius: '1rem', fontSize: 'clamp(13px, 1.1vw, 14px)' }} value={filters.vipStatus}
        onChange={val => handleFilterChange('vipStatus', val)}
        options={VIP_STATUS_OPTIONS}
      />
      <Select
        allowClear placeholder="Lọc trạng thái" suffixIcon={<FilterOutlined />}
        style={{ minWidth: 120, width: 'min(160px, 100%)', height: 'clamp(32px, 36px, 40px)', borderRadius: '1rem', fontSize: 'clamp(13px, 1.1vw, 14px)' }} value={filters.status}
        onChange={val => handleFilterChange('status', val)}
        options={Object.entries(STATUS_CONFIG).map(([val, cfg]) => ({ value: Number(val), label: cfg.label }))}
      />
      <Select
        allowClear placeholder="Lọc vai trò" suffixIcon={<FilterOutlined />}
        style={{ minWidth: 120, width: 'min(160px, 100%)', height: 'clamp(32px, 36px, 40px)', borderRadius: '1rem', fontSize: 'clamp(13px, 1.1vw, 14px)' }} value={filters.role}
        onChange={val => handleFilterChange('role', val)}
        options={ROLE_OPTIONS}
      />
    </Space>
  )


  if (selectedUserId) {
    return (
      <AccountDetails
        userId={selectedUserId}
        onBack={() => {
          setSelectedUserId(null)
        }}
        initialEdit={false}
        onAfterChange={() => {
          loadData(filters); // Chỉ load lại data ngầm để cập nhật dữ liệu mới nhất
          // KHÔNG set selectedUserId về null ở đây nữa
        }}
      />
    )
  }

  return (
    <>
      <ManagementLayout
        searchPlaceholder="Tìm ID, họ tên, email, SĐT..."
        searchValue={filters.searchText}
        onSearchChange={val => setFilters(prev => ({ ...prev, searchText: val }))}
        onSearchSubmit={() => handleFilterChange('searchText', filters.searchText)}
        extraFilters={extraFilters}
        actions={actions}
        tableProps={{
          columns,
          dataSource: data.items,
          loading,
          scroll: { x: 'max-content', y: 'calc(100vh - 290px)' },
          pagination: {
            current: filters.page,
            pageSize: filters.size,
            total: data.total,
            showSizeChanger: true,
            onChange: handlePaginationChange // <-- Fix nằm ở đây nè
          }
        }}
      />

      <DeleteUserConfirm
        open={deleteOpen}
        user={userToDelete}
        onConfirm={() => {
          setDeleteOpen(false)
          loadData(filters)
        }}
        onCancel={() => setDeleteOpen(false)}
      />

      <UserEditModal
        open={!!editUserId}
        userId={editUserId}
        onOk={() => {
          setEditUserId(null)
          loadData(filters)
        }}
        onCancel={() => setEditUserId(null)}
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
        title={<span style={{ fontWeight: 700, fontSize: 18 }}>Kết quả Import Excel</span>}
        open={!!importResult}
        onOk={() => setImportResult(null)}
        onCancel={() => setImportResult(null)}
        width={800}
        footer={[
          <AntButton key="close" type="primary" onClick={() => setImportResult(null)}>
            Đóng
          </AntButton>
        ]}
      >
        {importResult && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', gap: 24 }}>
              <Badge count={importResult.successList?.length || 0} showZero color="#52c41a">
                <span style={{ marginRight: 8, fontWeight: 500 }}>Thành công</span>
              </Badge>
              <Badge count={importResult.failureList?.length || 0} showZero color="#f5222d">
                <span style={{ marginRight: 8, fontWeight: 500 }}>Thất bại</span>
              </Badge>
            </div>

            {importResult.failureList?.length > 0 && (
              <>
                <div style={{ fontWeight: 600, color: '#f5222d', marginTop: 8 }}>
                  Danh sách lỗi chi tiết:
                </div>
                <Table
                  dataSource={importResult.failureList}
                  rowKey={(record, index) => index}
                  pagination={{ pageSize: 5 }}
                  size="small"
                  columns={[
                    { title: 'Email', dataIndex: 'email', key: 'email', width: 200 },
                    { title: 'Họ tên', dataIndex: 'fullName', key: 'fullName', width: 200 },
                    {
                      title: 'Lý do lỗi',
                      dataIndex: 'reason',
                      key: 'reason',
                      render: (text) => <span style={{ color: '#ff4d4f' }}>{text}</span>
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