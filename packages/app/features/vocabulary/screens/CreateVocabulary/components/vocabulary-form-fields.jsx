'use client'

import React, { useState } from 'react'
import { Form, Input, Upload, message } from 'antd'

/**
 * Các trường form dùng chung cho tạo/sửa từ vựng
 */
export function VocabularyFormFields() {
  const form = Form.useFormInstance()
  const [previewUrl, setPreviewUrl] = useState(form?.getFieldValue('imgURL') || '')

  const placeholderStyles = `
    .vocab-form-fields input::placeholder,
    .vocab-form-fields textarea::placeholder {
      color: rgba(0, 0, 0, 0.35);
      font-size: 16px;
    }
    .vocab-form-fields .ant-upload-drag p {
      color: rgba(0, 0, 0, 0.45);
      margin: 0;
      line-height: 1.4;
    }
  `

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

  return (
    <div className="vocab-form-fields" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <style>{placeholderStyles}</style>
      <Form.Item label="Từ" name="text" rules={[{ required: true, message: 'Vui lòng nhập từ' }]}>
        <Input placeholder="VD: 은행" size="large" style={{ fontSize: 18, color: '#111' }} />
      </Form.Item>

      <Form.Item
        label="Phiên âm"
        name="pronunciation"
        rules={[{ required: true, message: 'Vui lòng nhập phiên âm' }]}
      >
        <Input placeholder="VD: eunhaeng" size="large" style={{ fontSize: 18, color: '#111' }} />
      </Form.Item>

      <Form.Item
        label="Định nghĩa"
        name="definition"
        rules={[{ required: true, message: 'Vui lòng nhập nghĩa/định nghĩa' }]}
      >
        <Input placeholder="VD: Ngân hàng" size="large" style={{ fontSize: 18, color: '#111' }} />
      </Form.Item>

      <Form.Item label="Câu ví dụ" name="exampleSentence">
        <Input.TextArea
          placeholder="VD: 저는 매주 월요일에 은행에 갑니다. (Tôi đi ngân hàng mỗi thứ Hai hàng tuần.)"
          rows={3}
          size="large"
          style={{ fontSize: 16, color: '#111' }}
        />
      </Form.Item>

      <Form.Item label="Ảnh minh họa (kéo thả hoặc chọn file)" name="imgURL">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Upload.Dragger
            className="vocab-upload"
            multiple={false}
            showUploadList={false}
            beforeUpload={handleBeforeUpload}
            accept="image/*"
            style={{ padding: 8 }}
          >
            <p className="ant-upload-drag-icon" style={{ fontWeight: 'bold'}}>
              Kéo thả hoặc bấm để chọn ảnh
            </p>
            <p className="ant-upload-text" style={{ fontWeight: 'bold'}}>
              Ảnh sẽ lưu qua Cloudinary nội bộ
            </p>
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

    </div>
  )
}

export default VocabularyFormFields

