'use client'

import React from 'react'
import { Modal, Form, Input, InputNumber, Upload, message, Select } from 'antd'

/**
 * Modal chỉnh sửa chủ đề flashcard
 */
export function FlashcardTopicEditModal({ open, loading, initialValues = {}, onCancel, onSubmit }) {
  const [form] = Form.useForm()
  const [previewUrl, setPreviewUrl] = React.useState(initialValues?.imgUrl || initialValues?.imgURL || '')
  const [selectedFile, setSelectedFile] = React.useState(null)

  // Sync initial values when open changes
  React.useEffect(() => {
    if (open) {
      form.setFieldsValue({
        topicName: initialValues?.topicName || initialValues?.title || '',
        description: initialValues?.description || initialValues?.subtitle || '',
        level: initialValues?.level || 1,
        status: initialValues?.status !== undefined ? initialValues.status : 1,
        imgUrl: initialValues?.imgUrl || initialValues?.imgURL || '',
      })
      setPreviewUrl(initialValues?.imgUrl || initialValues?.imgURL || '')
      setSelectedFile(null)
    } else {
      // Reset form when modal closes
      form.resetFields()
      setPreviewUrl('')
      setSelectedFile(null)
    }
  }, [open, initialValues, form])

  const handleBeforeUpload = (file) => {
    // Kiểm tra loại file
    const isImage = file.type.startsWith('image/')
    if (!isImage) {
      message.error('Chỉ chấp nhận file ảnh!')
      return false
    }

    // Kiểm tra kích thước file (tối đa 5MB)
    const isLt5M = file.size / 1024 / 1024 < 5
    if (!isLt5M) {
      message.error('Ảnh phải nhỏ hơn 5MB!')
      return false
    }

    // Lưu file để upload sau
    setSelectedFile(file)
    
    // Tạo preview URL
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target.result)
    }
    reader.readAsDataURL(file)
    
    message.success('Đã chọn ảnh')
    return false // Ngăn upload tự động
  }

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      // Thêm file vào values nếu có
      const submitValues = {
        ...values,
        imageFile: selectedFile, // Thêm file để upload
      }
      onSubmit?.(submitValues)
    } catch (err) {
      // ignore validation errors
    }
  }

  return (
    <Modal
      title="Chỉnh sửa chủ đề flashcard"
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText="Lưu"
      cancelText="Hủy"
      confirmLoading={loading}
      destroyOnClose
      centered
      styles={{
        header: { fontSize: 18 },
        body: { fontSize: 16 },
      }}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Tên chủ đề"
          name="topicName"
          rules={[{ required: true, message: 'Vui lòng nhập tên chủ đề' }]}
        >
          <Input placeholder="VD: Từ vựng cơ bản" size="large" style={{ fontSize: 16 }} />
        </Form.Item>
        <Form.Item
          label="Mô tả"
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
          label="Level"
          name="level"
          rules={[{ required: true, message: 'Vui lòng nhập level' }]}
        >
          <InputNumber
            min={1}
            max={10}
            placeholder="VD: 1"
            size="large"
            style={{ width: '100%', fontSize: 16 }}
          />
        </Form.Item>
        <Form.Item label="Trạng thái" name="status" rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}>
          <Select size="large" style={{ fontSize: 16 }}>
            <Select.Option value={0}>Nháp/Ẩn</Select.Option>
            <Select.Option value={1}>Hoạt động</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="Ảnh minh họa" name="imgUrl">
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
              <p className="ant-upload-text">Ảnh sẽ được cập nhật cho chủ đề</p>
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

export default FlashcardTopicEditModal

