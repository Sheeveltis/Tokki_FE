import React, { useState, useEffect } from 'react'
import { Modal, Form, Input, Select, message, Space } from 'antd'
import { 
  FontSizeOutlined, 
  TagOutlined, 
  FileTextOutlined, 
  StarOutlined, 
  SafetyCertificateOutlined, 
  LineChartOutlined, 
  CheckCircleOutlined 
} from '@ant-design/icons'
import { updateQuestionType } from '../../../api/question-type-management'

const { TextArea } = Input

export function EditQuestionTypeModal({ open, questionType, onCancel, onUpdate }) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && questionType) {
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
  }, [open, questionType, form])

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)

      const payload = {
        name: values.name?.trim(),
        code: values.code?.trim()?.toUpperCase(),
        description: values.description?.trim(),
        difficulty: values.difficulty,
        examType: values.examType,
        status: values.status,
      }

      await updateQuestionType(questionType.questionTypeId, payload)
      message.success('Cập nhật loại câu hỏi thành công')
      
      if (onUpdate) {
        onUpdate()
      }
    } catch (error) {
      if (error?.errorFields) return
      message.error(error?.message || 'Cập nhật loại câu hỏi thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title="Chỉnh sửa thông tin cơ bản"
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={loading}
      centered
      width={600}
      okText="Lưu thay đổi"
      cancelText="Hủy"
      okButtonProps={{ style: { borderRadius: '2rem', height: 40, padding: '0 24px', fontWeight: 600 } }}
      cancelButtonProps={{ style: { borderRadius: '2rem', height: 40, padding: '0 24px', fontWeight: 600 } }}
    >
      <Form
        form={form}
        layout="vertical"
        style={{ marginTop: 16 }}
        requiredMark={false}
      >
        <Form.Item
          label={<Space><FontSizeOutlined style={{ color: '#1677ff' }} />Tên loại câu hỏi (Bắt buộc)</Space>}
          name="name"
          rules={[{ required: true, message: 'Vui lòng nhập tên loại câu hỏi' }]}
        >
          <Input placeholder="Nhập tên loại câu hỏi" />
        </Form.Item>

        <Form.Item
          label={<Space><TagOutlined style={{ color: '#1677ff' }} />Code (Bắt buộc)</Space>}
          name="code"
          rules={[{ required: true, message: 'Vui lòng nhập code' }]}
        >
          <Input placeholder="Nhập mã code" />
        </Form.Item>

        <Form.Item
          label={<Space><FileTextOutlined style={{ color: '#1677ff' }} />Mô tả</Space>}
          name="description"
        >
          <TextArea rows={3} placeholder="Mô tả loại câu hỏi" />
        </Form.Item>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Form.Item
            label={<Space><StarOutlined style={{ color: '#1677ff' }} />Kỹ năng</Space>}
            name="skill"
          >
            <Select disabled>
              <Select.Option value={1}>Nghe</Select.Option>
              <Select.Option value={2}>Đọc</Select.Option>
              <Select.Option value={3}>Viết</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label={<Space><SafetyCertificateOutlined style={{ color: '#1677ff' }} />TOPIK Level (Bắt buộc)</Space>}
            name="examType"
            rules={[{ required: true, message: 'Vui lòng chọn TOPIK level' }]}
          >
            <Select placeholder="Chọn TOPIK level">
              <Select.Option value={1}>TOPIK I</Select.Option>
              <Select.Option value={2}>TOPIK II</Select.Option>
            </Select>
          </Form.Item>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Form.Item
            label={<Space><LineChartOutlined style={{ color: '#1677ff' }} />Mức độ (Bắt buộc)</Space>}
            name="difficulty"
            rules={[{ required: true, message: 'Vui lòng chọn mức độ' }]}
          >
            <Select placeholder="Chọn mức độ">
              <Select.Option value={1}>Dễ</Select.Option>
              <Select.Option value={2}>Trung bình</Select.Option>
              <Select.Option value={3}>Khó</Select.Option>
              <Select.Option value={4}>Rất khó</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label={<Space><CheckCircleOutlined style={{ color: '#1677ff' }} />Trạng thái (Bắt buộc)</Space>}
            name="status"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
          >
            <Select placeholder="Chọn trạng thái">
              <Select.Option value={1}>Hoạt động</Select.Option>
              <Select.Option value={0}>Không hoạt động</Select.Option>
            </Select>
          </Form.Item>
        </div>
      </Form>
    </Modal>
  )
}

export default EditQuestionTypeModal
