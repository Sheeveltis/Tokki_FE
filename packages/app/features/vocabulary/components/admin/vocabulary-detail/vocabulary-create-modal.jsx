'use client'

import React, { useState } from 'react'
import { Modal, Form, message } from 'antd'
import { VocabularyFormFields } from '../create-vocabulary/vocabulary-form-fields'
import { createVocabulary, uploadVocabularyImageToCloudinary } from '../../../api'

/**
 * Modal tạo mới từ vựng
 * Sử dụng lại VocabularyFormFields để có đầy đủ tính năng (ví dụ, upload ảnh)
 */
export function VocabularyCreateModal({ open, onCancel, onSuccess }) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (values) => {
    try {
      setLoading(true)

      // Nếu có file ảnh mới, upload lên Cloudinary trước
      let imgURL = values?.imgURL || null
      if (values?.imageFile) {
        try {
          imgURL = await uploadVocabularyImageToCloudinary(values.imageFile)
          if (!imgURL) {
            message.error('Không thể upload ảnh lên Cloudinary')
            return
          }
        } catch (err) {
          message.error(err?.message || 'Không thể upload ảnh lên Cloudinary')
          return
        }
      }

      // Tạo payload với URL ảnh từ Cloudinary
      const payload = {
        ...values,
        imgURL: imgURL,
        imageFile: undefined, // Xóa imageFile khỏi payload
      }

      await createVocabulary(payload)
      message.success('Đã tạo từ vựng mới thành công')
      form.resetFields()
      onSuccess?.()
    } catch (error) {
      console.error('Error creating vocabulary:', error)
      message.error(error?.response?.data?.message || error?.message || 'Tạo từ vựng thất bại')
    } finally {
      setLoading(false)
    }
  }

  const handleOk = () => {
    form.submit()
  }

  return (
    <Modal
      title="Tạo từ vựng mới"
      open={open}
      onCancel={() => {
        form.resetFields()
        onCancel?.()
      }}
      onOk={handleOk}
      okText="Tạo mới"
      cancelText="Hủy"
      confirmLoading={loading}
      width={1000} // Cần width lớn vì FormFields dàn hàng ngang 2 cột
      centered
      destroyOnClose
    >
      <div style={{ marginTop: 24 }}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <VocabularyFormFields />
        </Form>
      </div>
    </Modal>
  )
}

export default VocabularyCreateModal
