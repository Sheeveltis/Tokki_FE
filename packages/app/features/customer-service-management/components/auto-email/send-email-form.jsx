'use client'

import React, { useState } from 'react'
import { Card, Form, Input, InputNumber, Select, Space, Typography, Divider } from 'antd'
import { ButtonV2 } from '../../../../../components/buttonV2.jsx'
import { createEmailTemplate } from '../../api/auto-email.js'
import { showAdminSuccess, showAdminError } from 'components/HelperAdmin'

const { Text } = Typography
const { TextArea } = Input
const { Option } = Select

/**
 * SendEmailForm Component
 * Form để tạo email template tự động (POST /api/EmailTemplate)
 */
export function SendEmailForm() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const emailTemplateType = Form.useWatch('type', form)

  const handleSubmit = async (values) => {
    setLoading(true)
    try {
      const payload = {
        templateName: values.templateName?.trim(),
        type: values.type,
        value: values.value,
        targetGroup: values.targetGroup,
        subject: values.subject?.trim(),
        body: values.body?.trim(),
        description: values.description?.trim(),
      }

      const result = await createEmailTemplate(payload)
      showAdminSuccess(result?.message || 'Đã tạo email template thành công')
      form.resetFields()
    } catch (error) {
      showAdminError(error?.message || 'Tạo email template thất bại')
    } finally {
      setLoading(false)
    }
  }

  const renderTargetGroupOptions = () => {
    // Nếu type = 2 (VipExpiringReminder) thì chỉ cho phép gửi cho người dùng trả phí
    if (emailTemplateType === 2) {
      return <Option value={2}>Gửi cho người dùng đang trả phí</Option>
    }

    // AutoEmail: chỉ dùng các nhóm 1,2,3 (không có 0 - gửi riêng)
    return (
      <>
        <Option value={1}>Gửi cho toàn bộ người dùng</Option>
        <Option value={2}>Gửi cho người dùng đang trả phí</Option>
        <Option value={3}>Gửi cho người dùng miễn phí</Option>
      </>
    )
  }

  return (
    <Card>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          label="Tên template"
          name="templateName"
          rules={[{ required: true, message: 'Vui lòng nhập tên template' }]}
        >
          <Input placeholder="VD: Nhắc nhở học Offline X ngày" size="large" />
        </Form.Item>

        <Form.Item
          label="Loại template (type)"
          name="type"
          rules={[{ required: true, message: 'Vui lòng chọn loại template' }]}
        >
          <Select placeholder="Chọn loại template" size="large">
            <Option value={1}>1 - Nhắc nhở học (Offline X ngày)</Option>
            <Option value={2}>2 - Thông báo sắp hết hạn VIP (Còn X ngày)</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label={emailTemplateType === 2 ? 'Số ngày VIP còn lại (value)' : 'Số ngày offline (value)'}
          name="value"
          rules={[{ required: true, message: 'Vui lòng nhập value' }]}
        >
          <InputNumber
            min={1}
            style={{ width: 200 }}
            placeholder={emailTemplateType === 2 ? 'VD: 3 (VIP còn 3 ngày)' : 'VD: 7 (offline 7 ngày)'}
          />
        </Form.Item>

        <Form.Item
          label="Nhóm người nhận (targetGroup)"
          name="targetGroup"
          rules={[{ required: true, message: 'Vui lòng chọn nhóm người nhận' }]}
        >
          <Select placeholder="Chọn nhóm" size="large">
            {renderTargetGroupOptions()}
          </Select>
        </Form.Item>

        <Form.Item
          label="Tiêu đề email (subject)"
          name="subject"
          rules={[{ required: true, message: 'Vui lòng nhập tiêu đề email' }]}
        >
          <Input placeholder="Nhập tiêu đề email" size="large" />
        </Form.Item>

        <Form.Item
          label="Nội dung email (body)"
          name="body"
          rules={[{ required: true, message: 'Vui lòng nhập nội dung email' }]}
        >
          <TextArea rows={8} placeholder="Nhập nội dung email..." />
        </Form.Item>

        <Form.Item label="Ghi chú (description)" name="description">
          <TextArea rows={3} placeholder="Ghi chú cho template..." />
        </Form.Item>

        <Divider />

        <Form.Item>
          <Space>
            <ButtonV2
              title={loading ? 'Đang lưu...' : 'Lưu template'}
              color="#F1BE4B"
              onPress={() => form.submit()}
              style={{ minWidth: 140, paddingVertical: 10 }}
              textStyle={{ fontSize: 14 }}
              disabled={loading}
            />
          </Space>
        </Form.Item>
      </Form>
    </Card>
  )
}


