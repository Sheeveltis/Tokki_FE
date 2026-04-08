import { useState, useEffect } from 'react'
import { Card, Divider, Space, Tag, Typography, Input, Select, Button, Form, Descriptions, Tooltip, message } from 'antd'
import { updateQuestionType } from '../../../api/question-type-management'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input

export function QuestionTypeInfoCard({ questionType, isEditing: isEditingProp, onCancelEdit, onUpdate }) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const isEditing = isEditingProp || false
  const skillEnumMap = {
    1: { label: 'Nghe',},
    2: { label: 'Đọc',},
    3: { label: 'Viết', },
  }

  const examTypeLabelMap = {
    1: 'TOPIK I',
    2: 'TOPIK II',
  }

  const difficultyLabelMap = {
    1: { label: 'Dễ', color: 'green' },
    2: { label: 'Trung bình', color: 'orange' },
    3: { label: 'Khó', color: 'red' },
    4: { label: 'Rất khó', color: 'volcano' },
  }

  const skillInfo = skillEnumMap[questionType?.skill] || { label: 'Không xác định', color: 'default' }
  const examType = questionType?.examType ? examTypeLabelMap[Number(questionType.examType)] : null
  const difficultyInfo = questionType?.difficulty
    ? difficultyLabelMap[Number(questionType.difficulty)]
    : null

  // Initialize form values when questionType changes or when entering edit mode
  useEffect(() => {
    if (questionType) {
      form.setFieldsValue({
        name: questionType.name || '',
        code: questionType.code || '',
        description: questionType.description || '',
        skill: questionType.skill || 1,
        difficulty: questionType.difficulty || 1,
        examType: questionType.examType || 1,
        status: questionType.isActive ? 1 : 0,
      })
    }
  }, [questionType, form, isEditing])


  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)

      const payload = {
        name: values.name?.trim(),
        code: values.code?.trim()?.toUpperCase(),
        description: values.description?.trim(),
        // skill: không cho update
        difficulty: values.difficulty,
        examType: values.examType,
        status: values.status,
      }

      await updateQuestionType(questionType.questionTypeId, payload)
      message.success('Đã cập nhật loại câu hỏi thành công')
      
      // Call onUpdate callback to refresh data
      if (onUpdate) {
        onUpdate()
      }
    } catch (error) {
      if (error?.errorFields) {
        // Form validation error
        return
      }
      message.error(error?.message || 'Cập nhật loại câu hỏi thất bại')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    form.resetFields()
    if (onCancelEdit) {
      onCancelEdit()
    }
  }

  return (
    <Card style={{ marginBottom: 24, borderRadius: 8 }}>
      <Form form={form} layout="vertical">
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Header */}
          <div>
            {isEditing ? (
              <Form.Item
                name="name"
                rules={[{ required: true, message: 'Vui lòng nhập tên loại câu hỏi' }]}
                style={{ marginBottom: 12 }}
              >
                <Input size="large" placeholder="Tên loại câu hỏi" />
              </Form.Item>
            ) : (
              <Title level={3} style={{ marginBottom: 12, marginTop: 0 }}>
                {questionType?.name || 'Không có tên'}
              </Title>
            )}
            {isEditing ? (
              <Form.Item name="description" style={{ marginBottom: 0 }}>
                <TextArea
                  rows={3}
                  placeholder="Mô tả"
                  style={{ fontSize: 15, lineHeight: 1.6 }}
                />
              </Form.Item>
            ) : (
              questionType?.description && (
                <Paragraph
                  style={{
                    marginBottom: 0,
                    color: '#666',
                    fontSize: 15,
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {questionType.description}
                </Paragraph>
              )
            )}
          </div>

          <Divider style={{ margin: '16px 0' }} />

          <Descriptions
            column={2}
            bordered
            size="small"
            style={{
              width: '100%',
              tableLayout: 'fixed',
              wordBreak: 'break-word',
            }}
          >
            <Descriptions.Item label="Code">
              {isEditing ? (
                <Form.Item
                  name="code"
                  rules={[{ required: true, message: 'Vui lòng nhập code' }]}
                  style={{ marginBottom: 0 }}
                >
                  <Input size="large" placeholder="Code" />
                </Form.Item>
              ) : (
                <Text style={{ fontSize: 14 }}>
                  {questionType?.code || '-'}
                </Text>
              )}
            </Descriptions.Item>

            <Descriptions.Item label="Kỹ năng">
              {isEditing ? (
                <Form.Item name="skill" style={{ marginBottom: 0 }}>
                  <Select size="large" disabled>
                    <Select.Option value={1}>Nghe</Select.Option>
                    <Select.Option value={2}>Đọc</Select.Option>
                    <Select.Option value={3}>Viết</Select.Option>
                  </Select>
                </Form.Item>
              ) : (
                <Text style={{ fontSize: 14 }}>
                  {skillInfo.label}
                </Text>
              )}
            </Descriptions.Item>

            <Descriptions.Item label="TOPIK Level">
              {isEditing ? (
                <Form.Item
                  name="examType"
                  rules={[{ required: true, message: 'Vui lòng chọn TOPIK level' }]}
                  style={{ marginBottom: 0 }}
                >
                  <Select size="large" placeholder="Chọn TOPIK level">
                    <Select.Option value={1}>TOPIK I</Select.Option>
                    <Select.Option value={2}>TOPIK II</Select.Option>
                  </Select>
                </Form.Item>
              ) : examType ? (
                <Text style={{ fontSize: 14 }}>
                  {examType}
                </Text>
              ) : (
                <Text type="secondary" style={{ fontSize: 14 }}>
                  -
                </Text>
              )}
            </Descriptions.Item>

            <Descriptions.Item label="Mức độ">
              {isEditing ? (
                <Form.Item
                  name="difficulty"
                  rules={[{ required: true, message: 'Vui lòng chọn mức độ' }]}
                  style={{ marginBottom: 0 }}
                >
                  <Select size="large" placeholder="Chọn mức độ">
                    <Select.Option value={1}>Dễ</Select.Option>
                    <Select.Option value={2}>Trung bình</Select.Option>
                    <Select.Option value={3}>Khó</Select.Option>
                    <Select.Option value={4}>Rất khó</Select.Option>
                  </Select>
                </Form.Item>
              ) : difficultyInfo ? (
                <Text style={{ fontSize: 14 }}>
                  {difficultyInfo.label}
                </Text>
              ) : (
                <Text type="secondary" style={{ fontSize: 14 }}>
                  -
                </Text>
              )}
            </Descriptions.Item>

            <Descriptions.Item label="Trạng thái" span={2}>
              {isEditing ? (
                <Form.Item
                  name="status"
                  rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
                  style={{ marginBottom: 0 }}
                >
                  <Select size="large" placeholder="Chọn trạng thái">
                    <Select.Option value={1}>Hoạt động</Select.Option>
                    <Select.Option value={0}>Không hoạt động</Select.Option>
                  </Select>
                </Form.Item>
              ) : (
                <Space size="small" align="center">
                  <Tooltip title={questionType?.isActive ? 'Hoạt động' : 'Không hoạt động'}>
                    <div
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        backgroundColor: questionType?.isActive ? '#52c41a' : '#8c8c8c',
                        boxShadow: '0 0 4px rgba(0,0,0,0.3)',
                        cursor: 'pointer',
                      }}
                    />
                  </Tooltip>
                  {questionType?.isActive}
                </Space>
              )}
            </Descriptions.Item>
          </Descriptions>

          {/* Action Buttons when editing */}
          {isEditing && (
            <>
              <Divider style={{ margin: '16px 0' }} />
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button 
                  onClick={handleCancel} 
                  size="large"
                  style={{ borderRadius: 20, height: 40, minWidth: 100, fontWeight: 600 }}
                >
                  Hủy
                </Button>
                <Button 
                  type="primary" 
                  onClick={handleSave} 
                  loading={loading} 
                  size="large"
                  style={{ borderRadius: 20, height: 40, minWidth: 100, fontWeight: 600 }}
                >
                  Xác nhận
                </Button>
              </Space>
            </>
          )}
        </Space>
      </Form>
    </Card>
  )
}

export default QuestionTypeInfoCard

