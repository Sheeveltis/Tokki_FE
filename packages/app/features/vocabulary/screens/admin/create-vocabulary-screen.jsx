'use client'

import { useState } from 'react'
import { useRouter } from 'solito/navigation'
import { Card, Form, Typography, Modal, Button } from 'antd'
import { AdminLayout } from 'app/features/back-office/components/admin/admin-layout.web'
import { createVocabulary, uploadVocabularyImageToCloudinary } from '../../api'
import { VocabularyFormFields } from '../../components/admin/create-vocabulary/vocabulary-form-fields'
import { VocabularyFormActions } from '../../components/admin/create-vocabulary/vocabulary-form-actions'
import { showAdminSuccess, showAdminError } from '../../../../../components/HelperAdmin.jsx'

const { Title } = Typography

export function CreateVocabularyScreen() {
  const router = useRouter()
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
            showAdminError('Không thể upload ảnh lên Cloudinary')
            return
          }
        } catch (err) {
          showAdminError(err?.message || 'Không thể upload ảnh lên Cloudinary')
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
      showAdminSuccess('Đã tạo từ vựng mới thành công')
      router.push('/admin?tab=vocabulary-words')
    } catch (error) {
      showAdminError(error?.message || 'Tạo từ vựng thất bại')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/admin?tab=vocabulary-words')
  }

  const handleConfirmSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        Modal.confirm({
          title: 'Xác nhận tạo từ vựng',
          content: `Bạn chắc chắn muốn tạo từ "${values.text}"?`,
          okText: 'Tạo',
          cancelText: 'Hủy',
          onOk: () => form.submit(),
        })
      })
      .catch(() => {})
  }

  return (
    <AdminLayout defaultKey="vocabulary-words" onNavigate={(key) => router.push(`/admin?tab=${key}`)}>
      <div
        style={{
          padding: 24,
          width: '100%',
        }}
      >
        <Card
          style={{
            width: '100%',
            borderRadius: 16,
            boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
            border: '1px solid #f0f0f0',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, fontSize: 14 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                background: '#f9fafb',
                borderRadius: 12,
                border: '1px solid #f0f0f0',
              }}
            >
              <div>
                <Title level={3} style={{ marginBottom: 4 }}>
                  Tạo từ vựng mới
                </Title>
                <Typography.Text type="secondary">
                  Nhập đầy đủ thông tin để tạo từ vựng mới trong hệ thống.
                </Typography.Text>
              </div>
              <Button onClick={handleCancel}>Quay lại</Button>
            </div>

            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <VocabularyFormFields />
              <VocabularyFormActions loading={loading} onCancel={handleCancel} onSubmit={handleConfirmSubmit} />
            </Form>
          </div>
        </Card>
      </div>
    </AdminLayout>
  )
}

export default CreateVocabularyScreen

