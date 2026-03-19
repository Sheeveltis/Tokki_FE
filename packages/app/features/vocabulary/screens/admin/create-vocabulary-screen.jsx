'use client'

import { useState } from 'react'
import { useRouter } from 'solito/navigation'
import { Form, Typography, Modal, Button, message } from 'antd'
import { AdminLayout } from 'app/features/back-office/components/admin/admin-layout.web'
import { StaffLayout } from 'app/features/back-office/components/staff/staff-layout.web'
import { createVocabulary, uploadVocabularyImageToCloudinary } from '../../api'
import { VocabularyFormFields } from '../../components/admin/create-vocabulary/vocabulary-form-fields'
import { VocabularyFormActions } from '../../components/admin/create-vocabulary/vocabulary-form-actions'

const { Title } = Typography

export function CreateVocabularyScreen() {
  const router = useRouter()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [messageApi, contextHolder] = message.useMessage()

  const getApiErrorMessage = (err, fallbackMessage) => {
    const data = err?.response?.data || err?.data || err

    return (
      data?.message ||
      data?.errors?.[0]?.description ||
      err?.message ||
      fallbackMessage
    )
  }

  const handleSubmit = async (values) => {
    try {
      setLoading(true)

      // Nếu có file ảnh mới, upload lên Cloudinary trước
      let imgURL = values?.imgURL || null
      if (values?.imageFile) {
        try {
          imgURL = await uploadVocabularyImageToCloudinary(values.imageFile)
          if (!imgURL) {
            messageApi.error('Không thể upload ảnh lên Cloudinary')
            return
          }
        } catch (err) {
          messageApi.error(err?.message || 'Không thể upload ảnh lên Cloudinary')
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
      messageApi.success('Đã tạo từ vựng mới thành công')
      router.push(`${portalPrefix}?tab=vocabulary-words`)
    } catch (error) {
      messageApi.error(getApiErrorMessage(error, 'Tạo từ vựng thất bại'))
    } finally {
      setLoading(false)
    }
  }

  const portalPrefix = typeof window !== 'undefined' && window.location.pathname.startsWith('/staff') ? '/staff' : '/admin'

  const handleCancel = () => {
    router.push(`${portalPrefix}?tab=vocabulary-words`)
  }

  const handleConfirmSubmit = () => {
        form
          .validateFields()
          .then((values) => {
            Modal.confirm({
              title: 'Xác nhận tạo từ vựng',
              // Bọc nội dung vào div có scroll riêng
              content: (
                <div style={{ maxHeight: '40vh', overflowY: 'auto', paddingRight: 8 }}>
                  Bạn chắc chắn muốn tạo từ <strong>"{values.text}"</strong>?
                  {/* Nếu bạn muốn hiển thị thêm thông tin chi tiết để kiểm tra trước khi tạo thì để ở đây */}
                </div>
              ),
              okText: 'Tạo',
              cancelText: 'Hủy',
              centered: true,
              // Xóa bodyStyle cũ để tránh việc cuộn cả nút bấm
              onOk: () => form.submit(),
              okButtonProps: { type: 'primary' },
             })
          })
          .catch(() => {})
      }

  const Layout = portalPrefix === '/staff' ? StaffLayout : AdminLayout

  return (
    <Layout
      defaultKey="vocabulary-words"
      onNavigate={(key) => router.push(`${portalPrefix}?tab=${key}`)}
    >
      {contextHolder}
      <div
        style={{
          padding: '24px 24px 0 24px', // Giảm padding bottom để sát mép
          width: '100%',
          height: '100%',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden', // Ngăn cuộn toàn trang
        }}
      >
        {/* HEADER: PHẦN CỐ ĐỊNH */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          // marginBottom: 24,
          flexShrink: 0 // Đảm bảo header không bị co lại
        }}>
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

        {/* PHẦN FORM: CÓ THỂ CUỘN */}
        <div style={{ 
          flex: 1, 
          overflowY: 'auto', 
          paddingRight: 8 
        }}>
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <VocabularyFormFields />
          </Form>
        </div>

        {/* PHẦN ACTIONS: CỐ ĐỊNH, KHÔNG CUỘN */}
        <div style={{ marginTop: 16, flexShrink: 0, paddingBottom: 16 }}>
          <VocabularyFormActions 
            loading={loading} 
            onCancel={handleCancel} 
            onSubmit={handleConfirmSubmit} 
          />
        </div>
      </div>
    </Layout>
  )
}

export default CreateVocabularyScreen