'use client'

import React from 'react'
import { Modal, Form, Input, InputNumber, Upload, message, Space } from 'antd'
import { 
  FontSizeOutlined, 
  FileTextOutlined, 
  LineChartOutlined, 
  PictureOutlined 
} from '@ant-design/icons'

/**
 * Modal tạo mới chủ đề flashcard
 */
export function FlashcardTopicCreateModal({ open, loading, onCancel, onSubmit }) {
  const [form] = Form.useForm()
  const [previewUrl, setPreviewUrl] = React.useState('')

  // Reset form khi modal đóng
  React.useEffect(() => {
    if (!open) {
      form.resetFields()
      setPreviewUrl('')
    }
  }, [open, form])

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
    })

  const handleBeforeUpload = async (file) => {
    try {
      const dataUrl = await toBase64(file)
      form?.setFieldsValue({ imgUrl: dataUrl })
      setPreviewUrl(dataUrl)
      message.success('Đã chọn ảnh')
    } catch (err) {
      message.error('Không thể đọc ảnh')
    }
    return false
  }

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      onSubmit?.(values)
    } catch (err) {
      // ignore validation errors
    }
  }

  return (
    <Modal
      title="Thêm chủ đề flashcard"
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText="Tạo"
      cancelText="Hủy"
      confirmLoading={loading}
      okButtonProps={{ style: { borderRadius: '2rem', height: 40, padding: '0 24px', fontWeight: 600 } }}
      cancelButtonProps={{ style: { borderRadius: '2rem', height: 40, padding: '0 24px', fontWeight: 600 } }}
      destroyOnClose
      centered
      styles={{
        header: { fontSize: 18 },
        body: { fontSize: 16 },
      }}
    >
      <Form form={form} layout="vertical" requiredMark={false}>
        <Form.Item
          label={<Space><FontSizeOutlined style={{ color: '#1677ff' }} />Tên chủ đề (Bắt buộc)</Space>}
          name="topicName"
          rules={[{ required: true, message: 'Vui lòng nhập tên chủ đề' }]}
        >
          <Input placeholder="VD: Từ vựng cơ bản" size="large" style={{ fontSize: 16 }} />
        </Form.Item>
        <Form.Item
          label={<Space><FileTextOutlined style={{ color: '#1677ff' }} />Mô tả (Bắt buộc)</Space>}
          name="description"
          rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
        >
          <Input.TextArea
            rows={3}
            placeholder="VD: Các từ vựng cơ bản cho người mới bắt đầu"
            style={{ fontSize: 16 }}
          />
        </Form.Item>
        <Form.Item
          label={<Space><LineChartOutlined style={{ color: '#1677ff' }} />Level (Bắt buộc)</Space>}
          name="level"
          rules={[{ required: true, message: 'Vui lòng nhập level' }]}
          initialValue={1}
        >
          <InputNumber
            min={1}
            max={10}
            placeholder="VD: 1"
            size="large"
            style={{ width: '100%', fontSize: 16 }}
          />
        </Form.Item>
         <Form.Item 
          label={<Space><PictureOutlined style={{ color: '#1677ff' }} />Ảnh minh họa</Space>} 
          name="imgUrl"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Upload.Dragger
              multiple={false}
              showUploadList={false}
              beforeUpload={handleBeforeUpload}
              accept="image/*"
              style={{ padding: 8 }}
            >
              <p className="ant-upload-drag-icon" style={{ fontWeight: 600 }}>
                Kéo thả hoặc bấm để chọn ảnh
              </p>
              <p className="ant-upload-text">Ảnh sẽ được sử dụng cho chủ đề</p>
            </Upload.Dragger>
            {previewUrl ? (
              <div style={{ border: '1px solid #f0f0f0', borderRadius: 6, padding: 8, textAlign: 'center' }}>
                <img
                  src={previewUrl}
                  alt="preview"
                  style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain' }}
                />
              </div>
            ) : null}
          </div>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default FlashcardTopicCreateModal



