'use client'

import React, { useState } from 'react'
import { Modal, Form, Input, Upload, message } from 'antd'
import { createVocabulary, uploadVocabularyImageToCloudinary } from '../../../api'
import { showAdminSuccess, showAdminError } from '../../../../../../components/HelperAdmin.jsx'

export function QuickAddVocabularyModal({ open, onCancel, onSuccess, topicId, onAddToTopic }) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)

  const handleBeforeUpload = (file) => {
    const isImage = file.type.startsWith('image/')
    if (!isImage) {
      message.error('Chỉ chấp nhận file ảnh!')
      return false
    }

    const isLt5M = file.size / 1024 / 1024 < 5
    if (!isLt5M) {
      message.error('Ảnh phải nhỏ hơn 5MB!')
      return false
    }

    setSelectedFile(file)
    form?.setFieldsValue({ imageFile: file })

    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target.result)
    }
    reader.readAsDataURL(file)

    message.success('Đã chọn ảnh')
    return false
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)

      // Upload ảnh nếu có
      let imgURL = values?.imgURL || null
      if (values?.imageFile) {
        try {
          imgURL = await uploadVocabularyImageToCloudinary(values.imageFile)
          if (!imgURL) {
            showAdminError('Không thể upload ảnh lên Cloudinary')
            return
          }
        } catch (err) {
          showAdminError(err?.message || 'Không thể upload ảnh lên Cloudinary')
          return
        }
      }

      // Tạo từ vựng
      const payload = {
        text: values.text,
        pronunciation: values.pronunciation || '',
        definition: values.definition,
        imgURL: imgURL,
        examples: [],
      }

      // Xử lý examples nếu có
      if (values.exampleSentence) {
        const exampleText = values.exampleSentence.trim()
        if (exampleText) {
          const match = exampleText.match(/^(.+?)\s*\((.+?)\)$/)
          if (match) {
            payload.examples = [
              {
                sentence: match[1].trim(),
                translation: match[2].trim(),
              },
            ]
          } else {
            payload.examples = [
              {
                sentence: exampleText,
                translation: '',
              },
            ]
          }
        }
      }

      const createdVocab = await createVocabulary(payload)
      
      if (createdVocab?.vocabularyId && topicId && onAddToTopic) {
        // Tự động thêm từ vựng vào topic
        try {
          const result = await onAddToTopic([createdVocab.vocabularyId])
          if (result?.success) {
            showAdminSuccess(`Đã tạo và thêm từ vựng "${values.text}" vào chủ đề thành công`)
          } else {
            showAdminSuccess(`Đã tạo từ vựng "${values.text}" thành công, nhưng không thể thêm vào chủ đề`)
            if (result?.error) {
              console.error('Error adding vocab to topic:', result.error)
            }
          }
        } catch (err) {
          showAdminSuccess(`Đã tạo từ vựng "${values.text}" thành công, nhưng không thể thêm vào chủ đề`)
          console.error('Error adding vocab to topic:', err)
        }
      } else {
        showAdminSuccess(`Đã tạo từ vựng "${values.text}" thành công`)
      }

      // Reset form và đóng modal
      form.resetFields()
      setPreviewUrl('')
      setSelectedFile(null)
      
      if (onSuccess) {
        onSuccess(createdVocab)
      }
      
      onCancel()
    } catch (error) {
      if (error?.errorFields) {
        // Validation error
        return
      }
      showAdminError(error?.message || 'Tạo từ vựng thất bại')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    form.resetFields()
    setPreviewUrl('')
    setSelectedFile(null)
    onCancel()
  }

  return (
    <Modal
      title="Tạo từ vựng nhanh"
      open={open}
      onCancel={handleCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      okText="Tạo và thêm vào chủ đề"
      cancelText="Hủy"
      width={600}
      destroyOnClose
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          label="Từ"
          name="text"
          rules={[{ required: true, message: 'Vui lòng nhập từ' }]}
        >
          <Input placeholder="VD: 봄" size="large" style={{ fontSize: 18, color: '#111' }} />
        </Form.Item>

        <Form.Item label="Phiên âm" name="pronunciation">
          <Input placeholder="VD: Bom" size="large" style={{ fontSize: 18, color: '#111' }} />
        </Form.Item>

        <Form.Item
          label="Định nghĩa"
          name="definition"
          rules={[{ required: true, message: 'Vui lòng nhập nghĩa/định nghĩa' }]}
        >
          <Input placeholder="VD: mùa xuân" size="large" style={{ fontSize: 18, color: '#111' }} />
        </Form.Item>

        <Form.Item label="Câu ví dụ" name="exampleSentence">
          <Input.TextArea
            placeholder='VD: 봄이 왔어요. (Mùa xuân đã đến.)'
            rows={3}
            size="large"
            style={{ fontSize: 16, color: '#111' }}
          />
        </Form.Item>

        <Form.Item label="Ảnh minh họa (tùy chọn)" name="imgURL">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Upload.Dragger
              multiple={false}
              showUploadList={false}
              beforeUpload={handleBeforeUpload}
              accept="image/*"
              style={{ padding: 8 }}
            >
              <p style={{ fontWeight: 'bold', margin: 0 }}>Kéo thả hoặc bấm để chọn ảnh</p>
              <p style={{ fontWeight: 'bold', margin: 0, fontSize: 12 }}>
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
      </Form>
    </Modal>
  )
}

export default QuickAddVocabularyModal

