'use client'

import React, { useMemo } from 'react'
import { Tag } from 'antd'
import { EyeOutlined } from '@ant-design/icons'
import ManagementTable from '../../../../../../components/ManagementTable'

export function QuestionTypeTable({ data, loading, onRowClick, rowKey = 'questionTypeId', onView }) {
  // debug
  if (typeof window !== 'undefined') {
    console.log('[QuestionTypeTable] rows:', Array.isArray(data) ? data.length : data)
  }
  const columns = useMemo(() => {
    const difficultyColorMap = {
      1: 'green',
      2: 'orange',
      3: 'red',
    }

    const difficultyLabelMap = {
      1: 'Dễ',
      2: 'Trung bình',
      3: 'Khó',
    }

    const examTypeLabelMap = {
      1: 'TOPIK I',
      2: 'TOPIK II',
      3: 'Test đầu vào',
    }

    return [
      {
        title: 'Code',
        dataIndex: 'code',
        key: 'code',
        width: 120,
      },
      {
        title: 'Tên loại câu hỏi',
        dataIndex: 'name',
        key: 'name',
        width: 250,
      },
      {
        title: 'TOPIK',
        dataIndex: 'examType',
        key: 'examType',
        width: 130,
        align: 'center',
        render: (_value, record) => {
          // Backend có thể trả về ExamType hoặc examType, nên handle cả 2
          const examType =
            record?.examType ??
            record?.ExamType ??
            record?.topikLevel ??
            record?.TopikLevel

          if (examType === null || examType === undefined || examType === '') return '-'

          const numeric = Number(examType)
          const display = examTypeLabelMap[numeric] || examTypeLabelMap[examType] || examType

          return <Tag color="geekblue">{display}</Tag>
        },
      },
      {
        title: 'Mức độ',
        dataIndex: 'difficulty',
        key: 'difficulty',
        width: 120,
        align: 'center',
        render: (difficulty) => {
          if (!difficulty) return '-'
          const color = difficultyColorMap[difficulty] || 'default'
          const label = difficultyLabelMap[difficulty] || difficulty
          return <Tag color={color}>{label}</Tag>
        },
      },
      {
        title: 'Mô tả',
        dataIndex: 'description',
        key: 'description',
        ellipsis: true,
      },
      {
        title: 'Kỹ năng',
        dataIndex: 'skill',
        key: 'skill',
        width: 120,
        render: (skill) => {
          const skillMap = {
            1: { label: 'Nghe', color: 'blue' },
            2: { label: 'Đọc', color: 'green' },
            3: { label: 'Viết', color: 'orange' },
          }
          const skillInfo = skillMap[skill] || { label: skill, color: 'default' }
          return <Tag color={skillInfo.color}>{skillInfo.label}</Tag>
        },
      },
      {
        title: 'Trạng thái',
        dataIndex: 'isActive',
        key: 'isActive',
        width: 120,
        align: 'center',
        render: (isActive) =>
          isActive ? <Tag color="green">Hoạt động</Tag> : <Tag color="default">Không hoạt động</Tag>,
      },
      {
        title: 'Xem',
        key: 'actions',
        align: 'center',
        width: 90,
        render: (_, record) => (
          <div
            onClick={(e) => {
              e?.stopPropagation?.()
              onView?.(record)
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: 4,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f0f0f0'
              e.currentTarget.style.transform = 'scale(1.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            <EyeOutlined style={{ fontSize: 18, color: '#111', transition: 'color 0.2s ease' }} />
          </div>
        ),
      },
    ]
  }, [onView])

  return (
    <ManagementTable
      columns={columns}
      dataSource={data}
      loading={loading}
      onRowClick={onRowClick}
      rowKey={rowKey}
    />
  )
}

export default QuestionTypeTable

