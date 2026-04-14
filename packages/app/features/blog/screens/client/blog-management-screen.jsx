'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'solito/navigation'
import { Modal, Space, Tooltip, message, Tag, Tabs, Button, FloatButton, ConfigProvider } from 'antd'
import { 
  FileTextOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  SendOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  SettingOutlined,
  BookOutlined,
  ShareAltOutlined
} from '@ant-design/icons'
import ManagementLayout from '../../../../../components/layout/management-layout'
import { getBlogsAdmin, deleteBlog } from '../../api/index'
import { LoadingWithContainer } from '../../../../../components/Loading'

/**
 * BlogManagementScreen: Trang quản lý blog dành cho người dùng
 * Cho phép xem danh sách bài viết đã đăng và bản nháp
 */
export function BlogManagementScreen() {
  const router = useRouter()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('1') // '1': Published, '0': Draft
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })

  const loadData = useCallback(async (page = 1, pageSize = 10, status = 1) => {
    try {
      setLoading(true)
      // Sử dụng getBlogsAdmin nhưng backend cần filter theo UserId của token hiện tại
      // Hoặc nếu endpoint /Blog/admin tự động filter cho user không phải Admin
      const res = await getBlogsAdmin({
        pageNumber: page,
        pageSize,
        status: parseInt(status),
      })

      setData(res?.items || [])
      setPagination({
        current: res?.pageNumber || page,
        pageSize: res?.pageSize || pageSize,
        total: res?.totalCount || 0,
      })
    } catch (error) {
      console.error('Error loading my blogs:', error)
      message.error('Không thể tải danh sách bài viết')
      setData([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData(1, pagination.pageSize, activeTab)
  }, [activeTab, loadData, pagination.pageSize])

  const handlePaginationChange = (page, pageSize) => {
    loadData(page, pageSize, activeTab)
  }

  const handleDelete = (record) => {
    Modal.confirm({
      title: 'Xác nhận xóa bài viết',
      content: `Bạn có chắc chắn muốn xóa bài viết "${record.title}" không? Hành động này không thể hoàn tác.`,
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true, style: { borderRadius: '2rem' } },
      cancelButtonProps: { style: { borderRadius: '2rem' } },
      onOk: async () => {
        try {
          await deleteBlog(record.id || record.blogId)
          message.success('Đã xóa bài viết thành công')
          loadData(pagination.current, pagination.pageSize, activeTab)
        } catch (error) {
          message.error('Xóa bài viết thất bại')
        }
      }
    })
  }

  const columns = useMemo(() => [
    {
      title: 'Bài viết',
      key: 'blog',
      width: '45%',
      render: (_, record) => (
        <Space size="middle">
          {record.thumbnailUrl && (
             <img 
               src={record.thumbnailUrl} 
               style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 4 }} 
               alt="thumbnail"
             />
          )}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 700, fontSize: 16, color: '#5D4037' }}>{record.title}</span>
            <span style={{ fontSize: 12, color: '#8D6E63' }}>{record.categoryName || 'Chưa lọc danh mục'}</span>
          </div>
        </Space>
      )
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdDate',
      key: 'createdDate',
      width: '15%',
      render: (date) => new Date(date).toLocaleDateString('vi-VN')
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: '15%',
      align: 'center',
      render: (status) => {
        if (status === 1) return <Tag icon={<CheckCircleOutlined />} color="success">Đã đăng</Tag>
        if (status === 0) return <Tag icon={<ClockCircleOutlined />} color="default">Bản nháp</Tag>
        return <Tag color="warning">Đang chờ</Tag>
      }
    },
    {
      title: 'Thao tác',
      key: 'actions',
      align: 'center',
      width: '25%',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Xem bài viết">
            <Button 
               type="text" 
               icon={<EyeOutlined style={{ color: '#1890ff' }} />} 
               onClick={() => router.push(`/blog/${record.slug || record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button 
               type="text" 
               icon={<EditOutlined style={{ color: '#faad14' }} />} 
               onClick={() => router.push(`/blog/edit/${record.id || record.blogId}`)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button 
               type="text" 
               danger 
               icon={<DeleteOutlined />} 
               onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
      )
    }
  ], [activeTab, pagination, router])

  const actions = [
    {
      label: 'Viết bài mới',
      icon: <PlusOutlined />,
      onPress: () => router.push('/blog/create'),
      type: 'primary'
    }
  ]

  const extraFilters = (
    <Tabs 
      activeKey={activeTab} 
      onChange={setActiveTab}
      items={[
        { key: '1', label: 'Bài viết đã đăng', icon: <SendOutlined /> },
        { key: '0', label: 'Bản nháp', icon: <FileTextOutlined /> },
      ]}
      style={{ marginBottom: -16 }}
    />
  )

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto', minHeight: '80vh' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#5D4037', marginBottom: 8 }}>
          Quản lý bài viết của bạn
        </h1>
        <p style={{ color: '#8D6E63' }}>Xem, chỉnh sửa hoặc tạo bài viết blog mới của bạn.</p>
      </div>

      <ManagementLayout
        searchPlaceholder="Tìm kiếm bài viết..."
        actions={actions}
        extraFilters={extraFilters}
        tableProps={{
          columns,
          dataSource: data,
          loading,
          pagination: {
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            onChange: handlePaginationChange,
          }
        }}
      />
      
      {/* Floating Actions */}
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#F1BE4B',
            borderRadius: 16,
            fontFamily: "'Epilogue', sans-serif",
          }
        }}
      >
        <FloatButton.BackTop visibilityHeight={400} style={{ right: 32, bottom: 32, width: 56, height: 56 }} />
        <FloatButton.Group
          trigger="hover"
          type="primary"
          style={{ left: 32, bottom: 32, width: 56, height: 56 }}
          icon={<SettingOutlined style={{ fontSize: 24 }} />}
        >
          <Tooltip title="Quản lý bài viết" placement="right">
            <FloatButton 
              icon={<FileTextOutlined style={{ fontSize: 22 }} />} 
              style={{ width: 56, height: 56 }}
              onClick={() => loadData(1, pagination.pageSize, activeTab)} 
            />
          </Tooltip>
          <Tooltip title="Bộ sưu tập" placement="right">
            <FloatButton 
              icon={<BookOutlined style={{ fontSize: 22 }} />} 
              style={{ width: 56, height: 56 }}
              onClick={() => message.info('Tính năng đang phát triển')} 
            />
          </Tooltip>
          <Tooltip title="Chia sẻ" placement="right">
            <FloatButton 
              icon={<ShareAltOutlined style={{ fontSize: 22 }} />} 
              style={{ width: 56, height: 56 }}
              onClick={() => {
                navigator.clipboard.writeText(window.location.href)
                message.success('Link đã được sao chép')
              }} 
            />
          </Tooltip>
          <Tooltip title="Viết bài mới" placement="right">
            <FloatButton 
              icon={<PlusOutlined style={{ fontSize: 22 }} />} 
              style={{ width: 56, height: 56 }}
              onClick={() => router.push('/blog/create')} 
            />
          </Tooltip>
        </FloatButton.Group>
      </ConfigProvider>
    </div>
  )
}
