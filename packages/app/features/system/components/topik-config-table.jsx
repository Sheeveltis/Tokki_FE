import React, { useMemo } from 'react'
import { Table, Tag, Space, Tooltip, Typography, Progress } from 'antd'
import { EditOutlined, EyeOutlined } from '@ant-design/icons'

const { Text } = Typography

// Export hook để dùng chung ở màn hình quản lý (giúp pagination đồng nhất)
export const useTopikColumns = ({ onEdit, onView, pagination }) => {
  return useMemo(() => [
    {
      title: 'STT',
      key: 'stt',
      align: 'center',
      width: 60,
      render: (_, __, index) => {
        const current = pagination?.current || 1
        const pageSize = pagination?.pageSize || 20
        return (current - 1) * pageSize + index + 1
      },
    },
    {
      title: 'Cấp độ',
      dataIndex: 'displayName',
      key: 'displayName',
      width: 120,
      render: (name, record) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ color: '#1677ff' }}>{name}</Text>
          <Tag color="cyan" style={{ fontSize: 10 }}>Group {record.examGroup}</Tag>
        </Space>
      )
    },
    {
      title: 'Điểm đạt / Tổng',
      key: 'score',
      width: 150,
      render: (_, record) => (
        <div style={{ width: 120 }}>
          <Text strong>{record.passScore}</Text> / <Text type="secondary">{record.totalScore}</Text>
          <Progress
            percent={Math.round((record.passScore / record.totalScore) * 100)}
            size="small"
            status="active"
            strokeColor="#52c41a"
          />
        </div>
      )
    },
    {
      title: 'Kỹ năng',
      key: 'skills',
      width: 140,
      render: (_, record) => (
        <div style={{ lineHeight: '1.2' }}>
          <Text style={{ fontSize: 11, display: 'block' }}>
            <Badge color="blue" text="Nghe:" /> {record.targetListeningScore}/{record.listeningMaxScore}
          </Text>
          <Text style={{ fontSize: 11, display: 'block' }}>
            <Badge color="green" text="Đọc:" /> {record.targetReadingScore}/{record.readingMaxScore}
          </Text>
          {record.writingMaxScore > 0 && (
            <Text style={{ fontSize: 11, display: 'block' }}>
              <Badge color="orange" text="Viết:" /> {record.targetWritingScore}/{record.writingMaxScore}
            </Text>
          )}
        </div>
      )
    },
    {
      title: 'Chiến thuật',
      dataIndex: 'strategy',
      key: 'strategy',
      width: 220,
      ellipsis: {
        showTitle: true,
      },
      render: (text) => <Text type="secondary" style={{ fontSize: 12 }}>{text}</Text>
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 80,
      align: 'center',
      render: (isActive) => (
        <Tooltip title={isActive ? 'Đang hoạt động' : 'Đang tắt'}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: isActive ? '#52c41a' : '#bfbfbf',
              margin: '0 auto',
              boxShadow: '0 0 4px rgba(0,0,0,0.1)',
              cursor: 'pointer',
            }}
          />
        </Tooltip>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      align: 'center',
      width: 100,
      render: (_, record) => {
        const iconStyle = { fontSize: 18, cursor: 'pointer', color: '#1890ff' }
        return (
          <Space size="large">
            <Tooltip title="Xem chi tiết">
              <EyeOutlined
                style={iconStyle}
                onClick={() => onView(record)}
              />
            </Tooltip>
            <Tooltip title="Chỉnh sửa">
              <EditOutlined
                style={iconStyle}
                onClick={() => onEdit(record)}
              />
            </Tooltip>
          </Space>
        )
      },
    },
  ], [onEdit, onView, pagination])
}

const TopikConfigTable = ({ data, total, pagination, loading, onEdit, onView }) => {
  const columns = useTopikColumns({ onEdit, onView, pagination })

  return (
    <Table
      columns={columns}
      dataSource={data}
      loading={loading}
      rowKey="topikLevelConfigID"
      pagination={pagination ? {
        ...pagination,
        total: total,
        showSizeChanger: true,
        showTotal: (total) => `Tổng cộng ${total} mục`,
        position: ['bottomRight'],
        style: { marginTop: 16 }
      } : false}
      size="middle"
      scroll={{ y: 'calc(100vh - 480px)' }}
      style={{ marginTop: 16 }}
    />
  )
}

export default TopikConfigTable

// Helper component for Skills
const Badge = ({ color, text }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', marginRight: 4 }}>
    <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: color, marginRight: 4 }} />
    <span style={{ color: '#8c8c8c' }}>{text}</span>
  </span>
)
