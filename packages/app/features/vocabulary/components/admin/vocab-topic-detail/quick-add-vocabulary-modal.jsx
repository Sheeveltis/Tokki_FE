'use client'

import React, { useState } from 'react'
import { Modal, Form, message } from 'antd'
import { createVocabulary, uploadVocabularyImageToCloudinary } from '../../../api'
import { VocabularyFormFields } from '../create-vocabulary/vocabulary-form-fields'

export function QuickAddVocabularyModal({ open, onCancel, onSuccess, topicId, onAddToTopic }) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)



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
            message.error('Không thể upload ảnh lên Cloudinary')
            return
          }
        } catch (err) {
          message.error(err?.message || 'Không thể upload ảnh lên Cloudinary')
          return
        }
      }

      // Tạo từ vựng
      const payload = {
        text: values.text,
        pronunciation: values.pronunciation || '',
        definition: values.definition,
        imgURL: imgURL,
        examples: (values.examples || [])
          .filter(ex => ex.sentence && ex.sentence.trim())
          .map(ex => ({
            sentence: ex.sentence.trim(),
            translation: ex.translation ? ex.translation.trim() : ''
          }))
      }

      const createdVocab = await createVocabulary(payload)
      
      if (createdVocab?.vocabularyId && topicId && onAddToTopic) {
        // Tự động thêm từ vựng vào topic
        try {
          const result = await onAddToTopic([createdVocab.vocabularyId])
          if (result?.success) {
            message.success(`Đã tạo và thêm từ vựng "${values.text}" vào chủ đề thành công`)
          } else {
            message.success(`Đã tạo từ vựng "${values.text}" thành công, nhưng không thể thêm vào chủ đề`)
            if (result?.error) {
              console.error('Error adding vocab to topic:', result.error)
            }
          }
        } catch (err) {
          message.success(`Đã tạo từ vựng "${values.text}" thành công, nhưng không thể thêm vào chủ đề`)
          console.error('Error adding vocab to topic:', err)
        }
      } else {
        message.success(`Đã tạo từ vựng "${values.text}" thành công`)
      }

      // Reset form và đóng modal
      form.resetFields()
      
      if (onSuccess) {
        onSuccess(createdVocab)
      }
      
      onCancel()
    } catch (error) {
      if (error?.errorFields) {
        // Validation error
        return
      }
      message.error(error?.message || 'Tạo từ vựng thất bại')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    form.resetFields()
    onCancel()
  }

  return (
    <Modal
      title="Tạo từ vựng nhanh"
      open={open}
      centered
      maskClosable={false}
      onCancel={handleCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      okText="Tạo và thêm vào chủ đề"
      cancelText="Hủy"
      okButtonProps={{ style: { borderRadius: '2rem', height: 40, padding: '0 24px', fontWeight: 600 } }}
      cancelButtonProps={{ style: { borderRadius: '2rem', height: 40, padding: '0 24px', fontWeight: 600 } }}
      width={900}
      styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }}
      destroyOnClose
    >
      <Form 
        form={form} 
        layout="vertical" 
        style={{ marginTop: 0 }}
        initialValues={{ examples: [{ sentence: '', translation: '' }] }}
      >
        <VocabularyFormFields />
      </Form>
    </Modal>
  )
}

export default QuickAddVocabularyModal

