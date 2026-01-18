'use client'

import React from 'react'
import { Modal, Form, Input, Upload, message, Select } from 'antd'

/**
 * Modal chỉnh sửa từ vựng
 */
export function VocabularyEditModal({ open, loading, initialValues = {}, onCancel, onSubmit }) {
  const [form] = Form.useForm()
  const [previewUrl, setPreviewUrl] = React.useState(initialValues?.imgURL || '')
  const [selectedFile, setSelectedFile] = React.useState(null)

  // Sync initial values when open changes
  React.useEffect(() => {
    if (open) {
      form.setFieldsValue({
        text: initialValues?.text || '',
        pronunciation: initialValues?.pronunciation || '',
        definition: initialValues?.definition || '',
        imgURL: initialValues?.imgURL || '',
        status: initialValues?.status !== undefined ? initialValues.status : 1,
      })
      setPreviewUrl(initialValues?.imgURL || '')
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
      title="Chỉnh sửa từ vựng"
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
        <Form.Item label="Từ" name="text" rules={[{ required: true, message: 'Vui lòng nhập từ' }]}>
          <Input placeholder="VD: 은행" size="large" style={{ fontSize: 16 }} />
        </Form.Item>
        <Form.Item
          label="Phiên âm"
          name="pronunciation"
          rules={[{ required: true, message: 'Vui lòng nhập phiên âm' }]}
        >
          <Input placeholder="VD: eunhaeng" size="large" style={{ fontSize: 16 }} />
        </Form.Item>
        <Form.Item
          label="Định nghĩa"
          name="definition"
          rules={[{ required: true, message: 'Vui lòng nhập nghĩa/định nghĩa' }]}
        >
          <Input placeholder="VD: Ngân hàng" size="large" style={{ fontSize: 16 }} />
        </Form.Item>
        <Form.Item label="Ảnh minh họa" name="imgURL">
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
              <p className="ant-upload-text">Ảnh sẽ được cập nhật cho từ vựng</p>
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
        <Form.Item label="Trạng thái" name="status" rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}>
          <Select size="large" style={{ fontSize: 16 }}>
            <Select.Option value={0}>Bản nháp</Select.Option>
            <Select.Option value={1}>Hoạt động</Select.Option>
            <Select.Option value={2}>Đã xóa</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default VocabularyEditModal

