'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'solito/navigation'
import { useParams } from 'react-router-dom'
import { Space, Tag, Card, Typography, Divider, Button, Popconfirm, message } from 'antd'
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { ButtonV2 } from '../../../../../../components/buttonV2.jsx'
import DetailDrawer from '../../../../../../components/DetailDrawer.jsx'
import { AdminLayout } from '../../../components/admin-layout.web.jsx'
import { QuestionFilter } from '../../QuestionBankManagement/components/QuestionFilter'
import { QuestionList } from '../../QuestionBankManagement/components/QuestionList'
import { mockQuestionTypes, mockQuestions } from '../../QuestionBankManagement/api/api.js'

const { Title, Text } = Typography

export function QuestionTypeDetailScreen() {
  const router = useRouter()
  const params = useParams()
  const questionTypeId = params?.id

  // Tìm QuestionType theo ID
  const questionType = mockQuestionTypes.find((qt) => qt.questionTypeId === questionTypeId)

  // Lọc questions theo questionTypeId
  const allQuestions = mockQuestions.filter((q) => q.questionTypeId === questionTypeId)

  const [drawerItem, setDrawerItem] = useState(null)
  const [filters, setFilters] = useState({
    search: '',
    examType: null,
    difficulty: null,
    type: null,
    skill: null,
  })

  const filteredData = useMemo(() => {
    let result = allQuestions

    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.trim().toLowerCase()
      result = result.filter(
        (item) =>
          (item.content || '').toLowerCase().includes(searchLower) ||
          (item.examType || '').toLowerCase().includes(searchLower) ||
          (item.difficulty || '').toLowerCase().includes(searchLower) ||
          (item.type || '').toLowerCase().includes(searchLower) ||
          (item.skill || '').toLowerCase().includes(searchLower),
      )
    }

    // Filter by examType
    if (filters.examType) {
      result = result.filter((item) => item.examType === filters.examType)
    }

    // Filter by difficulty
    if (filters.difficulty) {
      result = result.filter((item) => item.difficulty === filters.difficulty)
    }

    // Filter by type
    if (filters.type) {
      result = result.filter((item) => item.type === filters.type)
    }

    // Filter by skill
    if (filters.skill) {
      result = result.filter((item) => item.skill === filters.skill)
    }

    return result
  }, [allQuestions, filters])

  const handleEditQuestionType = () => {
    router.push(`/admin/question-type/${questionTypeId}/edit`)
  }

  const handleDeleteQuestionType = () => {
    // TODO: Call API to delete
    message.success('Đã xóa loại câu hỏi thành công')
    router.push('/admin?tab=question-bank')
  }

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
  }

  const handleSearchChange = (searchValue) => {
    setFilters({ ...filters, search: searchValue })
  }

  const skillMap = {
    1: { label: 'Nghe', color: 'blue' },
    2: { label: 'Đọc', color: 'green' },
    3: { label: 'Viết', color: 'orange' },
  }

  const handleNavigate = (key) => {
    router.push(`/admin?tab=${key}`)
  }

  if (!questionType) {
    return (
      <AdminLayout defaultKey="question-bank" onNavigate={handleNavigate}>
        <div style={{ padding: 24, textAlign: 'center' }}>
          <Text type="secondary">Không tìm thấy loại câu hỏi</Text>
        </div>
      </AdminLayout>
    )
  }

  const skillInfo = skillMap[questionType.skill] || { label: 'Không xác định', color: 'default' }

  return (
    <AdminLayout defaultKey="question-bank" onNavigate={handleNavigate}>
      <div style={{ padding: 24 }}>
        {/* Chi tiết QuestionType */}
        <Card style={{ marginBottom: 24 }}>
          <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
            <ButtonV2
              title="Quay lại"
              color="charcoal"
              onPress={() => router.push('/admin?tab=question-bank')}
              icon={<ArrowLeftOutlined />}
              style={{ minWidth: 100, paddingVertical: 10 }}
              textStyle={{ fontSize: 14 }}
            />
            <Space>
              <ButtonV2
                title="Sửa loại câu hỏi"
                color="charcoal"
                onPress={handleEditQuestionType}
                icon={<EditOutlined />}
                style={{ minWidth: 150, paddingVertical: 10 }}
                textStyle={{ fontSize: 14 }}
              />
              <Popconfirm
                title="Xóa loại câu hỏi"
                description="Bạn có chắc chắn muốn xóa loại câu hỏi này? Tất cả câu hỏi thuộc loại này cũng sẽ bị xóa."
                onConfirm={handleDeleteQuestionType}
                okText="Xóa"
                cancelText="Hủy"
              >
                <ButtonV2
                  title="Xóa loại câu hỏi"
                  color="#ff4d4f"
                  icon={<DeleteOutlined />}
                  style={{ minWidth: 150, paddingVertical: 10 }}
                  textStyle={{ fontSize: 14 }}
                />
              </Popconfirm>
              <ButtonV2
                title="Thêm câu hỏi"
                color="#F1BE4B"
                onPress={() => router.push(`/admin/question-bank/create?questionTypeId=${questionTypeId}`)}
                icon={<PlusOutlined />}
                style={{ minWidth: 120, paddingVertical: 10 }}
                textStyle={{ fontSize: 14 }}
              />
            </Space>
          </Space>

          <Divider />

          <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
            <div>
              <Title level={3} style={{ marginBottom: 8 }}>
                {questionType.name}
              </Title>
              <Text type="secondary" style={{ fontSize: 14 }}>
                {questionType.description}
              </Text>
            </div>

            <Space wrap>
              <div>
                <Text strong>Code: </Text>
                <Tag color="default">{questionType.code}</Tag>
              </div>
              <div>
                <Text strong>Kỹ năng: </Text>
                <Tag color={skillInfo.color}>{skillInfo.label}</Tag>
              </div>
              <div>
                <Text strong>Trạng thái: </Text>
                {questionType.isActive ? (
                  <Tag color="green">Hoạt động</Tag>
                ) : (
                  <Tag color="default">Không hoạt động</Tag>
                )}
              </div>
            </Space>
          </Space>
        </Card>

        {/* Danh sách câu hỏi */}
        <Card>
          <Title level={4} style={{ marginBottom: 16 }}>
            Danh sách câu hỏi ({filteredData.length})
          </Title>

          <QuestionFilter
            filters={filters}
            onFilterChange={handleFilterChange}
            onSearchChange={handleSearchChange}
          />

          <QuestionList
            data={filteredData}
            loading={false}
            onRowClick={(record) => setDrawerItem(record)}
          />
        </Card>

        <DetailDrawer
          open={!!drawerItem}
          onClose={() => setDrawerItem(null)}
          title="Chi tiết câu hỏi"
          data={drawerItem || {}}
        />
      </div>
    </AdminLayout>
  )
}

export default QuestionTypeDetailScreen

