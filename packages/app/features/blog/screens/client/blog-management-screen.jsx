'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'solito/navigation'
import { Modal, Space, Tooltip, message, Tag, Tabs, Button, FloatButton, ConfigProvider, Card } from 'antd'
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
  ShareAltOutlined,
  CloseCircleOutlined,
  LoadingOutlined
} from '@ant-design/icons'
import ManagementLayout from '../../../../../components/layout/management-layout'
import { getMyBlogs, deleteBlog } from '../../api/index'
import { LoadingWithContainer } from '../../../../../components/Loading'
import { BlogFloatingActions } from '../../components/shared/blog-floating-actions'

const { Meta } = Card

/**
 * BlogManagementScreen: Trang quản lý blog dành cho người dùng
 * Cho phép xem danh sách bài viết đã đăng và bản nháp
 */
export function BlogManagementScreen() {
  const router = useRouter()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all') // 'all', '1': Published, '0': Draft, etc.
  const [keyword, setKeyword] = useState('')
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })

  const loadData = useCallback(async (page = 1, pageSize = 10, status = 'all', searchKeyword = '') => {
    try {
      setLoading(true)
      const res = await getMyBlogs({
        pageNumber: page,
        pageSize,
        status: status === 'all' ? undefined : parseInt(status),
        keyword: searchKeyword || undefined,
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
    const timer = setTimeout(() => {
      loadData(1, pagination.pageSize, activeTab, keyword)
    }, 500)
    return () => clearTimeout(timer)
  }, [activeTab, keyword, loadData, pagination.pageSize])

  const handlePaginationChange = (page, pageSize) => {
    loadData(page, pageSize, activeTab, keyword)
  }

  const handleViewDetail = (record) => {
    router.push(`/blog/management/preview/${record.id || record.blogId}`)
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
          loadData(pagination.current, pagination.pageSize, activeTab, keyword)
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
      dataIndex: 'createdAt',
      key: 'createdAt',
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
        switch (status) {
          case 0: return <Tag icon={<FileTextOutlined />} color="default">Bản nháp</Tag>
          case 1: return <Tag icon={<CheckCircleOutlined />} color="success">Đã đăng</Tag>
          case 2: return <Tag icon={<EyeOutlined />} color="default">Đã ẩn</Tag>
          case 3: return <Tag icon={<BookOutlined />} color="cyan">Lưu trữ</Tag>
          case 4: return <Tag icon={<ClockCircleOutlined />} color="processing">Chờ duyệt</Tag>
          case 5: return <Tag icon={<CloseCircleOutlined />} color="error">Đã từ chối</Tag>
          case 6: return <Tag icon={<LoadingOutlined />} color="warning">AI đang kiểm duyệt</Tag>
          case 7: return <Tag icon={<CloseCircleOutlined />} color="error">AI đã từ chối</Tag>
          case 8: return null // Không hiện enum 8 theo yêu cầu
          default: return <Tag color="warning">Không xác định</Tag>
        }
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
              icon={<EyeOutlined style={{ color: '#8D6E63', fontSize: 20 }} />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: '#8D6E63', fontSize: 20 }} />}
              onClick={() => router.push(`/blog/edit/${record.id || record.blogId}`)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined style={{ color: '#8D6E63', fontSize: 20 }} />}
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
      )
    }
  ], [activeTab, pagination, router])

  const extraFilters = (
    <Tabs
      activeKey={activeTab}
      onChange={setActiveTab}
      items={[
        { key: 'all', label: 'Tất cả', icon: <SettingOutlined /> },
        { key: '1', label: 'Đã đăng', icon: <SendOutlined /> },
        { key: '0', label: 'Bản nháp', icon: <FileTextOutlined /> },
        { key: '4', label: 'Chờ duyệt', icon: <ClockCircleOutlined /> },
        { key: '5', label: 'Bị từ chối', icon: <CloseCircleOutlined /> },
      ]}
      style={{ marginBottom: -16 }}
    />
  )

  const renderCard = useCallback((record) => (
    <Card
      hoverable
      cover={
        <div style={{ position: 'relative', height: 160, overflow: 'hidden' }}>
          {record.thumbnailUrl ? (
            <img
              alt={record.title}
              src={record.thumbnailUrl}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileTextOutlined style={{ fontSize: 40, color: '#d9d9d9' }} />
            </div>
          )}
          <div style={{ position: 'absolute', top: 12, right: 12 }}>
            {(() => {
              const status = record.status
              switch (status) {
                case 0: return <Tag color="default">Nháp</Tag>
                case 1: return <Tag color="success">Đã đăng</Tag>
                case 4: return <Tag color="processing">Chờ duyệt</Tag>
                case 5:
                case 7: return <Tag color="error">Bị từ chối</Tag>
                default: return <Tag color="warning">Khác</Tag>
              }
            })()}
          </div>
        </div>
      }
      actions={[
        <Tooltip title="Xem">
          <EyeOutlined key="view" style={{ fontSize: 20, color: '#8D6E63' }} onClick={() => handleViewDetail(record)} />
        </Tooltip>,
        <Tooltip title="Sửa">
          <EditOutlined key="edit" style={{ fontSize: 20, color: '#8D6E63' }} onClick={() => router.push(`/blog/edit/${record.id || record.blogId}`)} />
        </Tooltip>,
        <Tooltip title="Xóa">
          <DeleteOutlined key="delete" style={{ fontSize: 20, color: '#8D6E63' }} onClick={() => handleDelete(record)} />
        </Tooltip>,
      ]}
      style={{ borderRadius: 16, overflow: 'hidden' }}
    >
      <Card.Meta
        title={<span style={{ fontWeight: 800, color: '#5D4037', fontSize: 18 }}>{record.title}</span>}
        description={
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 14, color: '#8D6E63', marginBottom: 4, fontWeight: 500 }}>{record.categoryName || 'Chưa phân loại'}</div>
            <div style={{ fontSize: 13, color: '#BDBDBD' }}>{new Date(record.createdAt).toLocaleDateString('vi-VN')}</div>
          </div>
        }
      />
    </Card>
  ), [router, handleDelete])

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#F1BE4B',
          borderRadius: 16,
        },
        components: {
          Button: {
            borderRadius: 24,
            fontWeight: 700,
            controlHeight: 44,
            fontSize: 15,
          },
          Tabs: {
            itemSelectedColor: '#F1BE4B',
            inkBarColor: '#F1BE4B',
            titleFontSize: 17,
          },
          Card: {
            borderRadiusLG: 20,
          }
        }
      }}
    >
      <div style={{ width: '100%', height: 'calc(100vh - 64px)', backgroundColor: '#FDFBF4', overflow: 'hidden' }}>
        {/* Style override for ManagementLayout without modifying the file directly */}
        <style dangerouslySetInnerHTML={{ __html: `
          /* Ensure ManagementLayout content area is responsive and fits in one screen */
          .management-content-wrapper {
            height: calc(100vh - 280px) !important;
            display: flex;
            flex-direction: column;
          }
          /* Make AntD Table fill the container height */
          .ant-table-wrapper, .ant-spin-nested-loading, .ant-spin-container, .ant-table, .ant-table-container {
            height: 100% !important;
            display: flex;
            flex-direction: column;
            flex: 1;
          }
          .ant-table-body {
            flex: 1 !important;
            max-height: none !important;
          }
          /* Remove page scrollbar and fix redundant space */
          body {
            overflow: hidden !important;
          }
        `}} />
        <div style={{
          width: '96%',
          maxWidth: 1600,
          margin: '0 auto',
          padding: '16px 0',
          height: 'calc(100vh - 100px)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <ManagementLayout
            searchPlaceholder="Tìm kiếm ý tưởng của bạn..."
            searchValue={keyword}
            onSearchChange={setKeyword}
            onSearchSubmit={setKeyword}
            extraFilters={extraFilters}
            renderCard={renderCard}
            tableProps={{
              columns,
              dataSource: data,
              loading,
              pagination: {
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                onChange: handlePaginationChange,
                showSizeChanger: true,
                style: { margin: 0 }
              }
            }}
          />
        </div>

        {/* Floating Actions */}
        <FloatButton.BackTop visibilityHeight={600} style={{ right: 40, bottom: 40, width: 64, height: 64 }} />
        <BlogFloatingActions />
      </div>

    </ConfigProvider>
  )
}
