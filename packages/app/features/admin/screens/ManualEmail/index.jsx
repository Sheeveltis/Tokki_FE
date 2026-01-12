'use client'

import React, { useState } from 'react'
import { Card, Form, Input, Select, Space, Typography, Switch, DatePicker, Divider } from 'antd'
import { ButtonV2 } from '../../../../../components/buttonV2.jsx'
import { sendEmailCampaign } from './api/api'
import { showAdminSuccess, showAdminError } from 'components/HelperAdmin'

const { Title, Text } = Typography
const { TextArea } = Input
const { Option } = Select

/**
 * ManualEmailScreen
 * Gửi mail thủ công với 2 chế độ: gửi ngay hoặc đặt lịch
 */
export function ManualEmailScreen() {
  const [form] = Form.useForm()
  const [sending, setSending] = useState(false)
  const [isSchedule, setIsSchedule] = useState(false)
  const [isSendNow, setIsSendNow] = useState(false)

  const targetGroupValue = Form.useWatch('targetGroup', form)

  const handleSubmit = async (values) => {
    // Prevent double submit
    if (sending) return

    try {
      setSending(true)

      const parsedEmails =
        values.targetGroup === 0
          ? (values.specificEmailsText || '')
              .split(/[,;\s]+/)
              .map((e) => e.trim())
              .filter(Boolean)
          : []

      // Dedupe emails to avoid duplicate sending
      const specificEmails = Array.from(
        new Set(parsedEmails.map((e) => e.toLowerCase())),
      )

      const payload = {
        subject: values.subject?.trim(),
        body: values.body?.trim(),
        targetGroup: values.targetGroup,
        specificEmails,
        scheduledTime: isSendNow ? null : values.scheduledTime || null,
      }

      await sendEmailCampaign(payload)
      showAdminSuccess('Đã gửi email thành công')
      form.resetFields()
      setIsSchedule(false)
      setIsSendNow(false)
    } catch (error) {
      showAdminError(error?.message || 'Gửi email thất bại')
    } finally {
      setSending(false)
    }
  }

  const handleScheduleToggle = (checked) => {
    setIsSchedule(checked)
    if (checked) {
      setIsSendNow(false)
    } else {
      form.setFieldsValue({ scheduledTime: null })
    }
  }

  const handleSendNowToggle = (checked) => {
    setIsSendNow(checked)
    if (checked) {
      setIsSchedule(false)
      form.setFieldsValue({ scheduledTime: null })
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <Space orientation="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Title level={3} style={{ marginBottom: 4 }}>
            Gửi mail thủ công
          </Title>
          <Text type="secondary">Gửi email tùy chỉnh tới người dùng</Text>
        </div>

        <Card>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{ targetGroup: 0, specificEmails: [], scheduledTime: null }}
          >
            <Form.Item
              label="Tiêu đề email"
              name="subject"
              rules={[{ required: true, message: 'Vui lòng nhập tiêu đề email' }]}
            >
              <Input placeholder="Nhập tiêu đề email" size="large" />
            </Form.Item>

            <Form.Item
              label="Nội dung email"
              name="body"
              rules={[{ required: true, message: 'Vui lòng nhập nội dung email' }]}
            >
              <TextArea rows={8} placeholder="Nhập nội dung email..." />
            </Form.Item>

            <Form.Item
              label="Nhóm người nhận (targetGroup)"
              name="targetGroup"
              rules={[{ required: true, message: 'Vui lòng chọn nhóm người nhận' }]}
            >
              <Select placeholder="Chọn nhóm" size="large">
                <Option value={0}>Gửi riêng</Option>
                <Option value={1}>Gửi cho toàn bộ người dùng</Option>
                <Option value={2}>Gửi cho người dùng đang trả phí</Option>
                <Option value={3}>Gửi cho người dùng miễn phí</Option>
              </Select>
            </Form.Item>

            {targetGroupValue === 0 && (
              <Form.Item
                label="Danh sách email (phân tách bằng dấu phẩy hoặc xuống dòng)"
                name="specificEmailsText"
                rules={[{ required: true, message: 'Vui lòng nhập danh sách email' }]}
              >
                <TextArea rows={4} placeholder="email1@example.com, email2@example.com" />
              </Form.Item>
            )}

            <Divider />

            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Space>
                <Switch checked={isSchedule} onChange={handleScheduleToggle} />
                <Text>Đặt lịch gửi</Text>
              </Space>
              {isSchedule && (
                <Form.Item
                  label="Thời gian gửi"
                  name="scheduledTime"
                  rules={[{ required: true, message: 'Vui lòng chọn thời gian gửi' }]}
                >
                  <DatePicker
                    showTime
                    style={{ width: 260 }}
                    placeholder="Chọn ngày giờ"
                    format="YYYY-MM-DD HH:mm:ss"
                  />
                </Form.Item>
              )}

              <Space>
                <Switch checked={isSendNow} onChange={handleSendNowToggle} />
                <Text>Gửi ngay lập tức</Text>
              </Space>
            </Space>

            <Divider />

            <Form.Item>
              <ButtonV2
                title={sending ? 'Đang gửi...' : 'Gửi email'}
                color="#F1BE4B"
                onPress={() => form.submit()}
                style={{ minWidth: 140, paddingVertical: 10 }}
                textStyle={{ fontSize: 14 }}
                disabled={sending}
              />
            </Form.Item>
          </Form>
        </Card>
      </Space>
    </div>
  )
}

export default ManualEmailScreen

