'use client'

import React from 'react'
import { Modal, Form, Input, Upload, message } from 'antd'

/**
 * Modal chỉnh sửa từ vựng
 */
export function VocabularyEditModal({ open, loading, initialValues = {}, onCancel, onSubmit }) {
  const [form] = Form.useForm()
  const [previewUrl, setPreviewUrl] = React.useState(initialValues?.imgURL || '')

  // Sync initial values when open changes
  React.useEffect(() => {
    if (open) {
      form.setFieldsValue({
        text: initialValues?.text || '',
        pronunciation: initialValues?.pronunciation || '',
        definition: initialValues?.definition || '',
        exampleSentence: initialValues?.exampleSentence || '',
        imgURL: initialValues?.imgURL || '',
      })
      setPreviewUrl(initialValues?.imgURL || '')
    } else {
      // Reset form when modal closes
      form.resetFields()
      setPreviewUrl('')
    }
  }, [open, initialValues, form])

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
      form?.setFieldsValue({ imgURL: dataUrl })
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
        <Form.Item label="Câu ví dụ" name="exampleSentence">
          <Input.TextArea rows={3} placeholder="VD: Tôi đi ngân hàng mỗi thứ Hai." style={{ fontSize: 16 }} />
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
      </Form>
    </Modal>
  )
}

export default VocabularyEditModal

