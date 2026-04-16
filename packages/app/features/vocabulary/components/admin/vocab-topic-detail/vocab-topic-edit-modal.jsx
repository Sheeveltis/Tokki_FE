'use client'

import React from 'react'
import { Modal, Form, Input, InputNumber, Upload, message, Select, Row, Col } from 'antd'

/**
 * Modal chỉnh sửa chủ đề flashcard
 * @param {boolean} isModerator - Nếu true, ẩn field status (moderator không được thay đổi status)
 * @param {boolean} isStaff - Nếu true, chỉ cho phép chọn Draft (0) và Rejected (4)
 */
export function FlashcardTopicEditModal({ open, loading, initialValues = {}, onCancel, onSubmit, isModerator = false, isStaff = false }) {
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
      okButtonProps={{ style: { borderRadius: '2rem', height: 40, padding: '0 24px', fontWeight: 600 } }}
      cancelButtonProps={{ style: { borderRadius: '2rem', height: 40, padding: '0 24px', fontWeight: 600 } }}
      destroyOnClose
      centered
      styles={{
        header: { fontSize: 18 },
        body: { fontSize: 16 },
      }}
      width={620}
    >      <Form form={form} layout="vertical" size="middle">
        <Form.Item
          label="Tên chủ đề"
          name="topicName"
          rules={[{ required: true, message: 'Vui lòng nhập tên chủ đề' }]}
          style={{ marginBottom: 12 }}
        >
          <Input placeholder="VD: Từ vựng cơ bản" />
        </Form.Item>

        <Form.Item
          label="Mô tả"
          name="description"
          rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
          style={{ marginBottom: 12 }}
        >
          <Input.TextArea rows={2} placeholder="Mô tả ngắn về chủ đề" />
        </Form.Item>

        <Row gutter={12}>
          <Col span={12}>
            <Form.Item
              label="Level"
              name="level"
              rules={[{ required: true, message: 'Vui lòng nhập level' }]}
              style={{ marginBottom: 12 }}
            >
              <InputNumber min={1} max={10} placeholder="1" style={{ width: '100%' }} />
            </Form.Item>
          </Col>

          {!isModerator && (
            <Col span={12}>
              <Form.Item
                label="Trạng thái"
                name="status"
                rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
                style={{ marginBottom: 12 }}
              >
                <Select>
                  {isStaff ? (
                    <>
                      <Select.Option value={0}>Bản nháp</Select.Option>
                      <Select.Option value={4}>Bị từ chối phê duyệt</Select.Option>
                    </>
                  ) : (
                    <>
                      <Select.Option value={0}>Bản nháp</Select.Option>
                      <Select.Option value={1}>Đang hoạt động</Select.Option>
                    </>
                  )}
                </Select>
              </Form.Item>
            </Col>
          )}
        </Row>

        <Form.Item label="Ảnh minh họa" name="imgUrl" style={{ marginBottom: 4 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: previewUrl ? '1fr 140px' : '1fr',
              gap: 10,
              alignItems: 'stretch',
            }}
          >
            <Upload.Dragger
              multiple={false}
              showUploadList={false}
              beforeUpload={handleBeforeUpload}
              accept="image/*"
              style={{ height: 118, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 8 }}
            >
              <p className="ant-upload-text" style={{ marginBottom: 0 }}>
                Kéo thả hoặc bấm để chọn ảnh
              </p>
            </Upload.Dragger>
            {previewUrl ? (
              <div
                style={{
                  border: '1px solid #f0f0f0',
                  borderRadius: 6,
                  padding: 6,
                  textAlign: 'center',
                  height: 118,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src={previewUrl}
                  alt="preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }}
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

