import { useMemo, useState } from 'react'
import { Space, Tooltip } from 'antd'
import { EyeOutlined } from '@ant-design/icons'
import ManagementTable from '../../../../../../components/ManagementTable.jsx'

export const useQuestionTypeColumns = (onView) => {
  const difficultyLabelMap = {
    1: 'Dễ',
    2: 'Trung bình',
    3: 'Khó',
    4: 'Rất khó',
  }

  const examTypeLabelMap = {
    1: 'TOPIK I',
    2: 'TOPIK II',
  }

  return useMemo(() => [
    {
      title: () => (
        <Tooltip title="Số thứ tự">
          <span>STT</span>
        </Tooltip>
      ),
      key: 'stt',
      align: 'center',
      width: 70,
      render: (_value, _record, index) => index + 1,
    },
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      width: 150,
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
        const examType =
          record?.examType ??
          record?.ExamType ??
          record?.topikLevel ??
          record?.TopikLevel

        if (examType === null || examType === undefined || examType === '') return '-'

        const numeric = Number(examType)
        const display = examTypeLabelMap[numeric] || examTypeLabelMap[examType] || examType

        return <span>{display}</span>
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
        const label = difficultyLabelMap[difficulty] || difficulty
        return <span>{label}</span>
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
          1: { label: 'Nghe'},
          2: { label: 'Đọc'},
          3: { label: 'Viết'},
        }
        const skillInfo = skillMap[skill] || { label: skill, color: 'default' }
        return <span>{skillInfo.label}</span>
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 120,
      align: 'center',
      render: (isActive) => {
        const statusConfig = isActive
          ? { color: '#52c41a' }
          : { color: '#8c8c8c' }

        return (
          <Space size="small" align="center" style={{ justifyContent: 'center' }}>
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                backgroundColor: statusConfig.color,
                margin: '0 auto',
                boxShadow: '0 0 4px rgba(0,0,0,0.3)',
              }}
            />
          </Space>
        )
      },
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
        >
          <EyeOutlined style={{ fontSize: 18, color: '#1890ff' }} />
        </div>
      ),
    },
  ], [onView])
}

export function QuestionTypeTable({ data, loading, onRowClick, rowKey = 'questionTypeId', onView }) {
  const columns = useQuestionTypeColumns(onView)
  return (
    <ManagementTable
      columns={columns}
      dataSource={data}
      loading={loading}
      onRowClick={onRowClick}
      rowKey={rowKey}
      size="large"
      pagination={{
        current: currentPage,
        pageSize: 20,
        onChange: (page) => setCurrentPage(page),
      }}
      scroll={{ x: 'max-content', y: 'calc(100vh - 290px)' }}
    />
  )
}

export default QuestionTypeTable

