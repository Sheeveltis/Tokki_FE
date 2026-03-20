import { useEffect, useState } from 'react'
import { useRouter } from 'solito/navigation'
import { Select, Space, message, Tooltip } from 'antd'
import { EyeOutlined, DownloadOutlined, UploadOutlined, FilterOutlined, PlusOutlined } from '@ant-design/icons'

import { fetchUsers } from '../../../api/user-management.js'
import AccountDetails from './account-details'

import ManagementLayout from '../../../../../../components/layout/management-layout'

// ==========================================
// 1. CONFIG & UTILS
// ==========================================
const ROLE_OPTIONS = [
  { value: 0, label: 'Người dùng' },
  { value: 1, label: 'Quản trị viên' },
  { value: 2, label: 'Nhân viên' },
  { value: 3, label: 'Thành viên VIP' },
  { value: 4, label: 'Kiểm duyệt viên' }
]

const STATUS_CONFIG = {
  0: { label: 'Vô hiệu hóa', color: '#8c8c8c' },
  1: { label: 'Hoạt động', color: '#52c41a' },   
  2: { label: 'Đã bị khóa', color: '#f5222d' },  
}

const getRoleLabel = (val) => ROLE_OPTIONS.find(opt => opt.value === Number(val))?.label || val

// ==========================================
// 2. MAIN COMPONENT
// ==========================================
export default function AccountManage({ basePath = '/admin' }) {
  const router = useRouter()

  const [data, setData] = useState({ items: [], total: 0 })
  const [loading, setLoading] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState(null)
  
  const [filters, setFilters] = useState({ search: '', status: null, role: null, page: 1, size: 20 })

  const loadData = async (currentFilters) => {
    setLoading(true)
    try {
      const res = await fetchUsers({
        pageNumber: currentFilters.page,
        pageSize: currentFilters.size,
        searchName: currentFilters.search, 
        status: currentFilters.status,     
        role: currentFilters.role          
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
  }, [filters.page, filters.size, filters.status, filters.role])

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
  // 3. UI CONFIGS
  // ==========================================
  const columns = [
    { 
      // Thay vì title: 'STT'
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
      title: () => (
        <Tooltip title="Họ và tên đầy đủ của người dùng">
          <span>Họ tên</span>
        </Tooltip>
      ), 
      dataIndex: 'fullName', 
      render: (_, r) => r.fullName || r.name || '' 
    },
    { 
      title: () => (
        <Tooltip title="Địa chỉ email đăng ký">
          <span>Email</span>
        </Tooltip>
      ), 
      dataIndex: 'email' 
    },
    { 
      title: () => (
        <Tooltip title="Phân quyền hệ thống">
          <span>Vai trò</span>
        </Tooltip>
      ), 
      dataIndex: 'role', 
      render: val => getRoleLabel(val) 
    },
    {
      title: 'Trạng thái', dataIndex: 'status', align: 'center', width: 100,
      render: val => {
        const cfg = STATUS_CONFIG[Number(val)] || STATUS_CONFIG[0]
        return (
          <Tooltip title={cfg.label} color={cfg.color} placement="top">
            <div style={{
              width: 14,  
              height: 14, 
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
      title: 'Hành động', align: 'center', width: 90,
      render: (_, record) => (
        <EyeOutlined
          style={{ fontSize: 18, cursor: 'pointer', padding: 8, color: '#1890ff' }}
          onClick={() => setSelectedUserId(record.id || record.userId)}
        />
      )
    }
  ]

  const actions = [
    { label: 'Import', icon: <UploadOutlined />,type: 'dashed', onPress: () => message.info('Tính năng Import sắp ra mắt') },
    { label: 'Export', icon: <DownloadOutlined />,type: 'dashed', onPress: () => message.success('Đang tải file Excel...') },
    { label: 'Thêm mới', icon: <PlusOutlined />,type: 'primary', onPress: () => router.push(`${basePath}/users/create-admin-staff`) }
  ]

  const extraFilters = (
    <Space wrap>
      <Select
        allowClear placeholder="Lọc trạng thái" suffixIcon={<FilterOutlined />}
        style={{ width: 150 }} value={filters.status}
        onChange={val => handleFilterChange('status', val)}
        options={Object.entries(STATUS_CONFIG).map(([val, cfg]) => ({ value: Number(val), label: cfg.label }))}
      />
      <Select
        allowClear placeholder="Lọc vai trò" suffixIcon={<FilterOutlined />}
        style={{ width: 150 }} value={filters.role}
        onChange={val => handleFilterChange('role', val)}
        options={ROLE_OPTIONS}
      />
    </Space>
  )

  
  if (selectedUserId) {
    return (
      <AccountDetails 
        userId={selectedUserId} 
        onBack={() => setSelectedUserId(null)} 
        onAfterChange={() => {
          loadData(filters); // Chỉ load lại data ngầm để cập nhật dữ liệu mới nhất
          // KHÔNG set selectedUserId về null ở đây nữa
        }} 
      />
    )
  }

  return (
    <ManagementLayout
      searchPlaceholder="Tìm theo tên..."
      searchValue={filters.search}
      onSearchChange={val => setFilters(prev => ({ ...prev, search: val }))}
      onSearchSubmit={() => handleFilterChange('search', filters.search)}
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
  )
}