import React from 'react'
import { Space, Tooltip, Tag } from 'antd'
import { EyeOutlined, EditOutlined, DeleteOutlined, SwapOutlined } from '@ant-design/icons'
import ManagementLayout from '../../../../../../components/layout/management-layout.jsx'

export default function PronunciationRuleList({ 
  rules, 
  loading, 
  searchTerm, 
  onSearchChange, 
  actions, 
  onViewDetail, 
  onEdit, 
  onDelete, 
  onReorder 
}) {
  const columns = [
    {
      title: 'Tên quy tắc',
      dataIndex: 'title',
      key: 'title',
      width: 250,
      render: (text) => (
        <span style={{
          fontWeight: 600,
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
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      render: (text) => (
        <span style={{
          display: '-webkit-box',
          WebkitLineClamp: 1,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          wordBreak: 'break-word',
          color: '#8c8c8c'
        }}>
          {text}
        </span>
      )
    },
    {
      title: 'Thứ tự',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      align: 'center',
      width: 100,
      render: (order) => <Tag color="blue">{order}</Tag>
    },
    {
      title: 'Hành động',
      key: 'actions',
      align: 'center',
      width: 180,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết">
            <EyeOutlined
              style={{ fontSize: 18, cursor: 'pointer', color: '#1890ff' }}
              onClick={() => onViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <EditOutlined
              style={{ fontSize: 18, cursor: 'pointer', color: '#1890ff' }}
              onClick={() => onEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <DeleteOutlined
              style={{ fontSize: 18, cursor: 'pointer', color: '#1890ff' }}
              onClick={() => onDelete(record)}
            />
          </Tooltip>
          <Tooltip title="Đổi vị trí">
            <SwapOutlined
              style={{ fontSize: 18, cursor: 'pointer', color: '#1890ff' }}
              onClick={(e) => onReorder(record, e)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ]

  return (
    <ManagementLayout
      title="Quản lý Phát âm"
      searchPlaceholder="Tìm theo tên quy tắc, mô tả..."
      searchValue={searchTerm}
      onSearchChange={onSearchChange}
      actions={actions}
      tableProps={{
        columns,
        dataSource: rules,
        loading: loading,
        rowKey: 'id',
        pagination: {
          pageSize: 10,
          showSizeChanger: true,
        }
      }}
    />
  )
}
