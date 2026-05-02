'use client'
import React from 'react'
import { Modal, Form, Input, Space, Select } from 'antd'
import { 
  FontSizeOutlined, 
  FileTextOutlined, 
  AudioOutlined,
  BulbOutlined,
  BoldOutlined
} from '@ant-design/icons'
import { ReactQuillWrapper } from '../../../../blog/components/create-blog/react-quill-wrapper.jsx'

/**
 * Modal chỉnh sửa ví dụ phát âm
 */
export default function PronunciationExampleEditModal({ open, loading, example, onCancel, onSubmit }) {
  const [form] = Form.useForm()

  const quillModules = {
    toolbar: [
      ['bold']
    ],
  }

  // Điền dữ liệu vào form khi example thay đổi hoặc modal mở
  React.useEffect(() => {
    if (open && example) {
      form.setFieldsValue({
        targetScript: example.targetScript,
        phoneticScript: example.phoneticScript,
        meaning: example.meaning,
        audioUrl: example.audioUrl,
        difficulty: typeof example.difficulty === 'number' ? example.difficulty : 0
      })
    } else if (!open) {
      form.resetFields()
    }
  }, [open, example, form])

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      
      // Xử lý tạo rawScript từ targetScript bằng cách loại bỏ các thẻ HTML
      const targetScript = values.targetScript || ''
      const rawScript = targetScript.replace(/<\/?[^>]+(>|$)/g, "").trim()
      
      const payload = {
        exampleId: example.exampleId,
        ...values,
        rawScript // Gửi kèm rawScript đã được lọc thẻ
      }
      onSubmit?.(payload)
    } catch (err) {
      // ignore validation errors
    }
  }

  return (
    <Modal
      title="Chỉnh sửa ví dụ phát âm"
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText="Lưu"
      cancelText="Hủy"
      confirmLoading={loading}
      okButtonProps={{ style: { borderRadius: '2rem', height: 40, padding: '0 24px', fontWeight: 600 } }}
      cancelButtonProps={{ style: { borderRadius: '2rem', height: 40, padding: '0 24px', fontWeight: 600 } }}
      destroyOnClose
      centered
      width={700}
    >
      <Form form={form} layout="vertical" requiredMark={false}>
        <Form.Item
          label={<Space><BoldOutlined style={{ color: '#1677ff' }} />Câu mẫu (Sử dụng nút B để in đậm phần quan trọng)</Space>}
          name="targetScript"
          rules={[{ required: true, message: 'Vui lòng nhập câu mẫu' }]}
        >
          <ReactQuillWrapper 
            className="example-editor"
            modules={quillModules}
            placeholder="VD: 안녕하세요"
            style={{ 
              border: '1px solid #d9d9d9', 
              borderRadius: 8,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 120
            }}
          />
        </Form.Item>

        <Form.Item
          label={<Space><FileTextOutlined style={{ color: '#1677ff' }} />Phiên âm (Bắt buộc)</Space>}
          name="phoneticScript"
          rules={[{ required: true, message: 'Vui lòng nhập phiên âm' }]}
        >
          <Input placeholder="VD: an-nyeong-ha-se-yo" size="large" />
        </Form.Item>

        <Form.Item
          label={<Space><BulbOutlined style={{ color: '#1677ff' }} />Ý nghĩa (Bắt buộc)</Space>}
          name="meaning"
          rules={[{ required: true, message: 'Vui lòng nhập ý nghĩa' }]}
        >
          <Input placeholder="VD: Xin chào" size="large" />
        </Form.Item>

        <Form.Item
          label={<Space><AudioOutlined style={{ color: '#1677ff' }} />Đường dẫn âm thanh</Space>}
          name="audioUrl"
        >
          <Input placeholder="https://..." size="large" />
        </Form.Item>

        <Form.Item
          label={<Space><BulbOutlined style={{ color: '#1677ff' }} />Độ khó</Space>}
          name="difficulty"
        >
          <Select size="large">
            <Select.Option value={0}>Dễ</Select.Option>
            <Select.Option value={1}>Trung bình</Select.Option>
            <Select.Option value={2}>Khó</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  )
}
