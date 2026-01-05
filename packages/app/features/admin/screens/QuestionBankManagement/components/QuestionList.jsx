'use client'

import React from 'react'
import { Table, Tag, Space, Button, Popconfirm } from 'antd'
import { EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useRouter } from 'solito/navigation'

/**
 * QuestionList Component
 * Component để hiển thị danh sách câu hỏi dạng bảng
 */
export function QuestionList({ data, loading, onRowClick, showActions = false, onEdit, onDelete }) {
  const router = useRouter()

  const difficultyColorMap = {
    easy: 'green',
    medium: 'orange',
    hard: 'red',
  }

  const typeLabelMap = {
    'multiple-choice': 'Trắc nghiệm',
    'true-false': 'Đúng/Sai',
    'fill-blank': 'Điền vào chỗ trống',
    matching: 'Nối câu',
    essay: 'Tự luận',
  }

  const skillLabelMap = {
    listening: 'Nghe',
    reading: 'Đọc',
    writing: 'Viết',
    speaking: 'Nói',
  }

  const columns = [
    {
      title: 'Nội dung câu hỏi',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      width: '35%',
      render: (text) => (
        <div style={{ maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {text}
        </div>
      ),
    },
    {
      title: 'Loại đề',
      dataIndex: 'examType',
      key: 'examType',
      width: 120,
      render: (examType) =>
        examType ? <Tag color="blue">{examType}</Tag> : '-',
    },
    {
      title: 'Mức độ',
      dataIndex: 'difficulty',
      key: 'difficulty',
      width: 120,
      render: (difficulty) => {
        const color = difficultyColorMap[difficulty] || 'default'
        const label = difficulty === 'easy' ? 'Dễ' : difficulty === 'medium' ? 'Trung bình' : 'Khó'
        return difficulty ? <Tag color={color}>{label}</Tag> : '-'
      },
    },
    {
      title: 'Loại câu hỏi',
      dataIndex: 'type',
      key: 'type',
      width: 150,
      render: (type) => typeLabelMap[type] || type || '-',
    },
    {
      title: 'Kỹ năng',
      dataIndex: 'skill',
      key: 'skill',
      width: 100,
      render: (skill) => skillLabelMap[skill] || skill || '-',
    },
    {
      title: showActions ? 'Thao tác' : 'Xem',
      key: 'actions',
      align: 'center',
      width: showActions ? 180 : 100,
      fixed: 'right',
      render: (_, record) => {
        if (showActions) {
          return (
            <Space>
              <Button
                type="text"
                icon={<EyeOutlined />}
                onClick={(e) => {
                  e?.stopPropagation?.()
                  router.push(`/admin/question-bank/${record.id}`)
                }}
              >
                Xem
              </Button>
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={(e) => {
                  e?.stopPropagation?.()
                  onEdit?.(record.id)
                }}
              >
                Sửa
              </Button>
              <Popconfirm
                title="Xóa câu hỏi"
                description="Bạn có chắc chắn muốn xóa câu hỏi này?"
                onConfirm={(e) => {
                  e?.stopPropagation?.()
                  onDelete?.(record.id)
                }}
                onCancel={(e) => e?.stopPropagation?.()}
                okText="Xóa"
                cancelText="Hủy"
              >
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={(e) => e?.stopPropagation?.()}
                >
                  Xóa
                </Button>
              </Popconfirm>
            </Space>
          )
        }
        return (
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={(e) => {
              e?.stopPropagation?.()
              router.push(`/admin/question-bank/${record.id}`)
            }}
            style={{
              color: '#111',
              transition: 'all 0.2s ease',
            }}
          >
            Xem
          </Button>
        )
      },
    },
  ]

  return (
    <Table
      columns={columns}
      dataSource={data}
      loading={loading}
      rowKey="id"
      onRow={(record) => ({
        onClick: () => onRowClick?.(record),
        style: { cursor: 'pointer' },
      })}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (total) => `Tổng ${total} câu hỏi`,
      }}
      scroll={{ x: 1200 }}
    />
  )
}

