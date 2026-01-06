'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'solito/navigation'
import { Input, Space, Tag, Select, Button } from 'antd'
import { EyeOutlined, SearchOutlined } from '@ant-design/icons'
import { ButtonV2 } from '../../../../../components/buttonV2.jsx'
import ManagementTable from '../../../../../components/ManagementTable'
import DetailDrawer from '../../../../../components/DetailDrawer'
import { mockQuestionTypes } from './api/api'

const { Option } = Select

export function QuestionBankManagement({ initialData = null }) {
  const router = useRouter()
  const data = initialData || mockQuestionTypes
  const isLoading = false
  const [drawerItem, setDrawerItem] = useState(null)
  const [search, setSearch] = useState('')
  const [skillFilter, setSkillFilter] = useState(null)

  const filteredData = useMemo(() => {
    let result = data

    // Filter by search
    if (search) {
      const searchLower = search.trim().toLowerCase()
      result = result.filter(
      (item) =>
          (item.code || '').toLowerCase().includes(searchLower) ||
          (item.name || '').toLowerCase().includes(searchLower) ||
          (item.description || '').toLowerCase().includes(searchLower),
      )
    }

    // Filter by skill
    if (skillFilter !== null) {
      result = result.filter((item) => item.skill === skillFilter)
    }

    return result
  }, [data, search, skillFilter])

  const columns = [
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
            router.push(`/admin/question-type/${record.questionTypeId}`)
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

  return (
    <>
      <Space style={{ marginBottom: 12, width: '100%', justifyContent: 'space-between' }}>
        <Space>
        <Input
          allowClear
          prefix={<SearchOutlined />}
            placeholder="Tìm theo code, tên, mô tả"
          style={{ maxWidth: 360 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
          <Select
            placeholder="Lọc theo kỹ năng"
            allowClear
            style={{ minWidth: 150 }}
            value={skillFilter}
            onChange={setSkillFilter}
          >
            <Option value={1}>Nghe</Option>
            <Option value={2}>Đọc</Option>
            <Option value={3}>Viết</Option>
          </Select>
        </Space>
        <ButtonV2
          title="Thêm loại câu hỏi"
          color="#F1BE4B"
          onPress={() => router.push('/admin/question-type/create')}
          style={{ minWidth: 150, paddingVertical: 10 }}
          textStyle={{ fontSize: 14 }}
        />
      </Space>
      <ManagementTable
        columns={columns}
        dataSource={filteredData}
        loading={isLoading && !initialData}
        onRowClick={(record) => setDrawerItem(record)}
        rowKey="questionTypeId"
      />
      <DetailDrawer
        open={!!drawerItem}
        onClose={() => setDrawerItem(null)}
        title="Chi tiết loại câu hỏi"
        data={drawerItem || {}}
      />
    </>
  )
}

export default QuestionBankManagement

