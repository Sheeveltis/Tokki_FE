'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'solito/navigation'
import { Tag, Space, Select, Tooltip, Modal, message, Button, Card, Typography } from 'antd'
import { EyeOutlined, PlusOutlined, EditOutlined, DeleteOutlined, FilterOutlined } from '@ant-design/icons'
import ManagementLayout from '../../../../../components/layout/management-layout.jsx'
import { getBlogsAdmin, deleteBlog, getAllCategories } from '../../api'
import { useManagementFilters } from '../../../back-office/hooks/use-management-filters.js'

const { Option } = Select

const STATUS_MAP = {
  0: { color: 'default', text: 'Nháp' },
  1: { color: 'green', text: 'Đã đăng' },
  2: { color: 'red', text: 'Đã ẩn' },
  3: { color: 'purple', text: 'Lưu trữ' },
  4: { color: 'orange', text: 'Chờ duyệt' },
  5: { color: 'volcano', text: 'Đã từ chối' },
  6: { color: 'blue', text: 'AI đang kiểm duyệt' },
  7: { color: 'magenta', text: 'AI đã từ chối' },
  8: { color: 'red', text: 'AI lỗi duyệt' },
}

export function BlogManagement() {
  const router = useRouter()

  const [filters, setFilters] = useManagementFilters({
    page: 1,
    size: 10,
    search: '',
    categoryId: undefined,
    status: 1,
  })

  // Local state for search to avoid lag
  const [localSearch, setLocalSearch] = useState(filters.search)

  // Sync with filters.search
  useEffect(() => {
    setLocalSearch(filters.search)
  }, [filters.search])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== filters.search) {
        handleFilterChange('search', localSearch)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [localSearch])

  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])

  // Load categories for filter
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await getAllCategories()
        setCategories(res || [])
      } catch (err) {
        console.error('Failed to load categories', err)
      }
    }
    loadCategories()
  }, [])

  const loadBlogs = async () => {
    try {
      setLoading(true)
      const res = await getBlogsAdmin({
        pageNumber: filters.page,
        pageSize: filters.size,
        keyword: filters.search,
        categoryId: filters.categoryId,
        status: filters.status,
      })
      setData(res.items || [])
      setTotal(res.totalCount || 0)
    } catch (err) {
      console.error('Failed to load blogs', err)
      message.error('Không thể tải danh sách bài viết')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBlogs()
  }, [filters.page, filters.size, filters.search, filters.categoryId, filters.status])

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const handlePaginationChange = (newPage, newSize) => {
    setFilters(prev => ({
      ...prev,
      page: prev.size !== newSize ? 1 : newPage,
      size: newSize
    }))
  }

  const handleDelete = (item) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      centered: true,
      content: `Bạn có chắc chắn muốn xóa bài viết "${item.title}"?`,
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
          await deleteBlog(item.id)
          message.success('Xóa bài viết thành công')
          loadBlogs()
        } catch (error) {
          message.error('Lỗi khi xóa bài viết')
        }
      }
    })
  }

  const columns = useMemo(() => [
    {
      title: <span style={{ fontSize: 'clamp(13px, 1vw, 15px)' }}>STT</span>,
      key: 'stt',
      align: 'center',
      width: 60,
      render: (_, __, index) => (
        <span style={{ fontSize: 'clamp(13px, 1vw, 15px)' }}>
          {(filters.page - 1) * filters.size + index + 1}
        </span>
      ),
      responsive: ['md'],
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      width: '30%',
      render: (text) => (
        <span style={{
          fontWeight: 600,
          fontSize: 'clamp(13px, 1vw, 15px)',
          display: '-webkit-box',
          WebkitLineClamp: 1, // Số hàng muốn hiển thị trước khi hiện dấu ...
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
      title: <span style={{ fontSize: 'clamp(13px, 1vw, 15px)' }}>Danh mục</span>,
      dataIndex: 'categoryName',
      key: 'categoryName',
      width: '15%',
      // minWidth: 120,
      render: (text) => <Tag color="blue" style={{ fontSize: 'clamp(11px, 0.8vw, 13px)' }}>{text || 'N/A'}</Tag>,
      responsive: ['sm'],
    },
    {
      title: <span style={{ fontSize: 'clamp(13px, 1vw, 15px)' }}>Tác giả</span>,
      dataIndex: 'authorName',
      key: 'authorName',
      width: '15%',
      // minWidth: 120,
      render: (text) => <span style={{ fontSize: 'clamp(12px, 0.9vw, 14px)' }}>{text}</span>,
      responsive: ['lg'],
    },
    // {
    //   title: <span style={{ fontSize: 'clamp(13px, 1vw, 15px)' }}>Lượt xem</span>,
    //   dataIndex: 'viewCount',
    //   key: 'viewCount',
    //   align: 'center',
    //   width: 100,
    //   render: (val) => <span style={{ fontWeight: 500, fontSize: 'clamp(12px, 0.9vw, 14px)' }}>{val || 0}</span>,
    //   responsive: ['xl'],
    // },
    // {
    //   title: <span style={{ fontSize: 'clamp(13px, 1vw, 15px)' }}>Ngày tạo</span>,
    //   dataIndex: 'createdAt',
    //   key: 'createdAt',
    //   width: 120,
    //   render: (val) => <span style={{ fontSize: 'clamp(12px, 0.9vw, 14px)' }}>{val ? new Date(val).toLocaleDateString('vi-VN') : '--'}</span>,
    //   responsive: ['md'],
    // },
    {
      title: <span style={{ fontSize: 'clamp(13px, 1vw, 15px)' }}>Trạng thái</span>,
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      width: 120,
      render: (status) => {
        const info = STATUS_MAP[status] || { color: 'default', text: 'Không rõ' }
        return <Tag color={info.color} style={{ fontSize: 'clamp(11px, 0.8vw, 13px)' }}>{info.text}</Tag>
      }
    },
    {
      title: <span style={{ fontSize: 'clamp(13px, 1vw, 15px)' }}>Hành động</span>,
      key: 'actions',
      align: 'center',
      width: 150,
      render: (_, record) => {
        const iconStyle = { fontSize: 'clamp(18px, 1.4vw, 22px)', cursor: 'pointer', color: '#1890ff' }
        return (
          <Space size="middle">
            <Tooltip title="Xem">
              <EyeOutlined style={iconStyle} onClick={() => router.push(`/admin/blog/${record.id}`)} />
            </Tooltip>
            <Tooltip title="Chỉnh sửa">
              <EditOutlined style={iconStyle} onClick={() => router.push(`/admin/blog/${record.id}/edit`)} />
            </Tooltip>
            <Tooltip title="Xóa">
              <DeleteOutlined style={iconStyle} onClick={() => handleDelete(record)} />
            </Tooltip>
          </Space>
        )
      }
    }
  ], [filters, data, router])

  const filterStyle = {
    width: 'clamp(150px, 15vw, 220px)',
    height: 'clamp(32px, 4vh, 40px)',
    borderRadius: '1rem',
    fontSize: 'clamp(13px, 1.1vw, 14px)'
  }

  const extraFilters = (
    <Space wrap>
      <Select
        allowClear
        placeholder="Tất cả danh mục"
        suffixIcon={<FilterOutlined />}
        style={filterStyle}
        value={filters.categoryId}
        onChange={(val) => handleFilterChange('categoryId', val)}
      >
        {categories.map(cat => (
          <Option key={cat.id} value={cat.id}>{cat.name}</Option>
        ))}
      </Select>

      <Select
        allowClear
        placeholder="Trạng thái"
        suffixIcon={<FilterOutlined />}
        style={{ ...filterStyle, width: 'clamp(120px, 10vw, 160px)' }}
        value={filters.status}
        onChange={(val) => handleFilterChange('status', val)}
      >
        <Option value={0}>Nháp</Option>
        <Option value={1}>Đã đăng</Option>
        <Option value={2}>Đã ẩn</Option>
        <Option value={3}>Lưu trữ</Option>
        <Option value={4}>Chờ duyệt</Option>
        <Option value={5}>Đã từ chối</Option>
        <Option value={6}>AI đang duyệt</Option>
        <Option value={7}>AI đã từ chối</Option>
        <Option value={8}>AI lỗi duyệt</Option>
      </Select>
    </Space>
  )

  const actions = [
    {
      label: 'Thêm mới',
      icon: <PlusOutlined />,
      type: 'primary',
      onPress: () => router.push('/admin/blog/create')
    }
  ]

  const renderCard = (item) => (
    <Card
      hoverable
      style={{ borderRadius: '1rem', border: '1px solid #f0f0f0', height: '100%' }}
      bodyStyle={{ padding: '16px' }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '12px' }}>
        <div style={{ flex: 1 }}>
          <Tag color="blue" style={{ marginBottom: 8 }}>{item.categoryName || 'N/A'}</Tag>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#262626', marginBottom: 4 }}>
            {item.title}
          </div>
          <div style={{ color: '#8c8c8c', fontSize: 13 }}>
            Tác giả: <span style={{ color: '#595959', fontWeight: 500 }}>{item.authorName}</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            {(() => {
              const info = STATUS_MAP[item.status] || { color: 'default', text: 'Không rõ' }
              return <Tag color={info.color}>{info.text}</Tag>
            })()}
          </div>
          <div style={{ color: '#bfbfbf', fontSize: 12 }}>
            {item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : '--'}
          </div>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '8px',
          paddingTop: '12px',
          borderTop: '1px solid #f0f0f0'
        }}>
          <Button
            type="text"
            icon={<EyeOutlined style={{ color: '#1890ff' }} />}
            onClick={() => router.push(`/admin/blog/${item.id}`)}
          />
          <Button
            type="text"
            icon={<EditOutlined style={{ color: '#1890ff' }} />}
            onClick={() => router.push(`/admin/blog/${item.id}/edit`)}
          />
          <Button
            type="text"
            icon={<DeleteOutlined style={{ color: '#ff4d4f' }} />}
            onClick={() => handleDelete(item)}
          />
        </div>
      </div>
    </Card>
  )

  return (
    <ManagementLayout
      title="Quản lý Bài viết"
      searchPlaceholder="Tìm kiếm tiêu đề, tác giả..."
      searchValue={localSearch}
      onSearchChange={setLocalSearch}
      onSearchSubmit={() => handleFilterChange('search', localSearch)}
      extraFilters={extraFilters}
      actions={actions}
      renderCard={renderCard}
      tableProps={{
        columns,
        dataSource: data,
        loading: loading,
        rowKey: "id",
        pagination: {
          current: filters.page,
          pageSize: filters.size,
          total: total,
          onChange: handlePaginationChange
        }
      }}
    />
  )
}

export default BlogManagement
