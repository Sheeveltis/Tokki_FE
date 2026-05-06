'use client'

import React from 'react'
import { Space, Tooltip, Tag, Switch, Button as AntButton } from 'antd'
import { EditOutlined, DeleteOutlined, PlayCircleOutlined } from '@ant-design/icons'

export const getAlphabetColumns = ({ onEdit, onDelete, onToggleActive }) => [
  {
    title: 'STT',
    key: 'stt',
    width: 70,
    align: 'center',
    render: (_, __, index) => index + 1,
  },
  {
    title: 'Chữ cái',
    dataIndex: 'letter',
    key: 'letter',
    render: (text) => <span style={{ fontSize: 24, fontWeight: 'bold', color: '#1677ff' }}>{text}</span>,
  },
  {
    title: 'Ý nghĩa',
    dataIndex: 'meaning',
    key: 'meaning',
    render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>,
  },
  {
    title: 'Phát âm',
    dataIndex: 'pronunciation',
    key: 'pronunciation',
    render: (text) => <Tag color="blue">{text}</Tag>,
  },
  {
    title: 'Loại',
    dataIndex: 'type',
    key: 'type',
    render: (type) => (
      <Tag color={type === 'Vowel' ? 'volcano' : 'geekblue'}>
        {type === 'Vowel' ? 'Nguyên âm' : 'Phụ âm'}
      </Tag>
    ),
  },
  {
    title: 'Số nét',
    dataIndex: 'totalStrokes',
    key: 'totalStrokes',
    align: 'center',
    render: (count) => <Tag color="green">{count || 0}</Tag>,
  },
  {
    title: 'Âm thanh',
    dataIndex: 'audioUrl',
    key: 'audioUrl',
    align: 'center',
    render: (url) => url ? (
      <Tooltip title="Nghe thử">
        <AntButton 
          type="text" 
          shape="circle"
          icon={<PlayCircleOutlined style={{ fontSize: 20, color: '#1890ff' }} />} 
          onClick={() => {
            const audio = new Audio(url)
            audio.play()
          }}
        />
      </Tooltip>
    ) : '-',
  },
  {
    title: 'Trạng thái',
    dataIndex: 'isActive',
    key: 'isActive',
    align: 'center',
    render: (isActive, record) => (
      <Switch 
        checked={isActive} 
        onChange={() => onToggleActive(record)} 
      />
    ),
  },
  {
    title: 'Thao tác',
    key: 'actions',
    align: 'center',
    render: (_, record) => (
      <Space size="middle">
        <Tooltip title="Chỉnh sửa">
          <AntButton 
            type="text" 
            icon={<EditOutlined style={{ color: '#1890ff' }} />} 
            onClick={() => onEdit(record)} 
          />
        </Tooltip>
        <Tooltip title="Xóa">
          <AntButton 
            type="text" 
            danger
            icon={<DeleteOutlined />} 
            onClick={() => onDelete(record)} 
          />
        </Tooltip>
      </Space>
    ),
  },
]
