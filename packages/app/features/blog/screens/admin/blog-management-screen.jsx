'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'solito/navigation'
import { Tag, Space, Select, Tooltip, Modal, message, Button } from 'antd'
import { EyeOutlined, PlusOutlined, EditOutlined, DeleteOutlined, FilterOutlined } from '@ant-design/icons'
import ManagementLayout from '../../../../../components/layout/management-layout.jsx'
import { getBlogsAdmin, deleteBlog, getAllCategories } from '../../api'
import { useManagementFilters } from '../../../back-office/hooks/use-management-filters.js'

const { Option } = Select

const STATUS_MAP = {
  0: { color: 'orange', text: 'Nháp' },
  1: { color: 'green', text: 'Đã xuất bản' },
  2: { color: 'red', text: 'Đã xóa' },
}

export function BlogManagement() {
  const router = useRouter()
  
  const [filters, setFilters] = useManagementFilters({
    page: 1,
    size: 10,
    search: '',
    categoryId: undefined,
    status: undefined,
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
      title: 'STT',
      key: 'stt',
      align: 'center',
      width: 60,
      render: (_, __, index) => (filters.page - 1) * filters.size + index + 1
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      width: '30%',
      render: (text) => <span style={{ fontWeight: 600 }}>{text}</span>
    },
    {
      title: 'Danh mục',
      dataIndex: 'categoryName',
      key: 'categoryName',
      width: '15%',
      render: (text) => <Tag color="blue">{text || 'N/A'}</Tag>
    },
    {
      title: 'Tác giả',
      dataIndex: 'authorName',
      key: 'authorName',
      width: '15%',
    },
    {
      title: 'Lượt xem',
      dataIndex: 'viewCount',
      key: 'viewCount',
      align: 'center',
      width: 100,
      render: (val) => <span style={{ fontWeight: 500 }}>{val || 0}</span>
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (val) => val ? new Date(val).toLocaleDateString('vi-VN') : '--'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      width: 120,
      render: (status) => {
        const info = STATUS_MAP[status] || { color: 'default', text: 'Không rõ' }
        return <Tag color={info.color}>{info.text}</Tag>
      }
    },
    {
      title: 'Hành động',
      key: 'actions',
      align: 'center',
      width: 150,
      render: (_, record) => {
        const iconStyle = { fontSize: 20, cursor: 'pointer', color: '#1890ff' }
        return (
          <Space size="middle">
            <Tooltip title="Xem">
              <EyeOutlined style={iconStyle} onClick={() => router.push(`/admin/blog/${record.id}`)} />
            </Tooltip>
            <Tooltip title="Chỉnh sửa">
              <EditOutlined style={iconStyle} onClick={() => router.push(`/admin/blog/${record.id}/edit`)} />
            </Tooltip>
            <Tooltip title="Xóa">
              <DeleteOutlined style={{ ...iconStyle, color: '#ff4d4f' }} onClick={() => handleDelete(record)} />
            </Tooltip>
          </Space>
        )
      }
    }
  ], [filters, data, router])

  const extraFilters = (
    <Space wrap>
      <Select
        allowClear
        placeholder="Tất cả danh mục"
        suffixIcon={<FilterOutlined />}
        style={{ width: 200 }}
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
        style={{ width: 150 }}
        value={filters.status}
        onChange={(val) => handleFilterChange('status', val)}
      >
        <Option value={0}>Nháp</Option>
        <Option value={1}>Đã xuất bản</Option>
        <Option value={2}>Đã xóa</Option>
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

  return (
    <ManagementLayout
      title="Quản lý Bài viết"
      searchPlaceholder="Tìm kiếm tiêu đề, tác giả..."
      searchValue={localSearch}
      onSearchChange={setLocalSearch}
      onSearchSubmit={() => handleFilterChange('search', localSearch)}
      extraFilters={extraFilters}
      actions={actions}
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
