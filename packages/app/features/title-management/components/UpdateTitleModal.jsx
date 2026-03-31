'use client'

import React, { useEffect, useState } from 'react'
import { Modal, Form, Input, InputNumber, ColorPicker, Space, Upload, Button, Typography, Row, Col, notification } from 'antd'
import { InboxOutlined } from '@ant-design/icons'
import { createObjectUrl, revokeObjectUrl } from '../../examination-management/api/upload-utils'

const { TextArea } = Input
const { Dragger } = Upload
const { Text } = Typography

export function UpdateTitleModal({ open, onCancel, onSubmit, loading, initialData }) {
  const [api, contextHolder] = notification.useNotification()
  const [form] = Form.useForm()
  const colorHex = Form.useWatch('colorHex', form)
  const iconFile = Form.useWatch('iconFile', form)
  const [iconPreviewUrl, setIconPreviewUrl] = useState('')

  useEffect(() => {
    if (open && initialData) {
      form.setFieldsValue({
        name: initialData.name || '',
        description: initialData.description || '',
        requiredXP: initialData.requiredXP ?? 0,
        colorHex: initialData.colorHex || '',
        iconUrl: initialData.iconUrl || '',
        iconFile: null,
        isSystemGiven: initialData.isSystemGiven ?? false,
      })
      setIconPreviewUrl(initialData.iconUrl || '')
    }
  }, [open, initialData, form])

  useEffect(() => {
    return () => {
      if (iconPreviewUrl && iconPreviewUrl !== initialData?.iconUrl) {
        revokeObjectUrl(iconPreviewUrl)
      }
    }
  }, [])

  useEffect(() => {
    if (iconFile) {
      const url = createObjectUrl(iconFile)
      setIconPreviewUrl((prev) => {
        if (prev && prev !== initialData?.iconUrl) revokeObjectUrl(prev)
        return url
      })
    } else if (initialData?.iconUrl && !iconFile) {
      setIconPreviewUrl(initialData.iconUrl)
    }
  }, [iconFile, initialData])

  const iconUploadProps = {
    name: 'file',
    multiple: false,
    showUploadList: false,
    accept: 'image/*',
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/')
      if (!isImage) {
        api.error({
          message: 'Lỗi định dạng',
          description: 'Chỉ chấp nhận file hình ảnh!',
        })
        return Upload.LIST_IGNORE
      }
      form.setFieldsValue({ iconFile: file })
      return false
    },
  }

  const handleCancel = () => {
    form.resetFields()
    setIconPreviewUrl('')
    onCancel?.()
  }

  return (
    <Modal
      title={<span style={{ fontWeight: 700, fontSize: 18 }}>Chỉnh sửa danh hiệu</span>}
      open={open}
      onCancel={handleCancel}
      footer={[
        <Button key="back" onClick={handleCancel} style={{ borderRadius: 20, height: 40, padding: '0 24px', fontWeight: 600 }}>
          Hủy
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={() => form.submit()} style={{ borderRadius: 20, height: 40, padding: '0 24px', fontWeight: 600 }}>
          Cập nhật
        </Button>,
      ]}
      width={800}
      destroyOnClose
    >
      {contextHolder}
      <Form
        form={form}
        layout="vertical"
        style={{ marginTop: 16 }}
        initialValues={{ isSystemGiven: false, requiredXP: 0 }}
        onFinish={(values) => {
          const payload = {
            titleId: initialData?.titleId || initialData?.id || initialData?.TitleId || '',
            name: values.name.trim(),
            description: values.description?.trim() || '',
            requiredXP: values.requiredXP ?? 0,
            colorHex: values.colorHex?.trim() || '',
            iconUrl: values.iconUrl?.trim() || '',
            iconFile: values.iconFile || null,
            isSystemGiven: values.isSystemGiven ?? false,
          }
          onSubmit?.(payload)
        }}
      >
        <Row gutter={24}>
          <Col span={14}>
            <Form.Item
              label={<span style={{ fontWeight: 600 }}>Tên danh hiệu</span>}
              name="name"
              rules={[{ required: true, message: 'Vui lòng nhập tên danh hiệu' }]}
            >
              <Input placeholder="Ví dụ: Kẻ hủy diệt, Chiến thần..." size="large" style={{ borderRadius: 8 }} />
            </Form.Item>

            <Form.Item label={<span style={{ fontWeight: 600 }}>Mô tả</span>} name="description">
              <TextArea rows={3} placeholder="Nhập mô tả cho danh hiệu này..." size="large" style={{ borderRadius: 8 }} />
            </Form.Item>

            <Form.Item
              label={<span style={{ fontWeight: 600 }}>XP yêu cầu</span>}
              name="requiredXP"
              rules={[{ required: true, message: 'Vui lòng nhập XP' }]}
            >
              <InputNumber
                style={{ width: '100%', borderRadius: 8 }}
                placeholder="Ví dụ: 1000"
                min={0}
                size="large"
              />
            </Form.Item>

            <Form.Item label={<span style={{ fontWeight: 600 }}>Màu sắc mã Hex</span>} name="colorHex">
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <ColorPicker
                  showText
                  format="hex"
                  value={colorHex || '#1677ff'}
                  onChange={(color) => form.setFieldsValue({ colorHex: color.toHexString() })}
                  style={{ flex: 1, height: 40, borderRadius: 8 }}
                />
                <Input
                  value={colorHex || ''}
                  placeholder="Ví dụ: #1890FF"
                  size="large"
                  style={{ borderRadius: 8, flex: 3 }}
                  onChange={(e) => form.setFieldsValue({ colorHex: e.target.value })}
                />
              </div>
            </Form.Item>
          </Col>

          <Col span={10}>
            <Form.Item label={<span style={{ fontWeight: 600 }}>Biểu tượng (Icon)</span>}>
              <Dragger {...iconUploadProps} style={{ borderRadius: 12, padding: '24px 0', border: '2px dashed #d9d9d9', height: 200 }}>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined style={{ color: '#1890ff' }} />
                </p>
                <p className="ant-upload-text" style={{ fontWeight: 500, fontSize: 13 }}>Nhấp hoặc kéo thả ảnh</p>
              </Dragger>

              {iconPreviewUrl && (
                <div style={{ marginTop: 16, textAlign: 'center', padding: 12, backgroundColor: '#fafafa', borderRadius: 12, border: '1px solid #f0f0f0' }}>
                  <img
                    src={iconPreviewUrl}
                    alt="Icon preview"
                    style={{ width: 100, height: 100, objectFit: 'contain' }}
                  />
                </div>
              )}
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="iconFile" hidden>
          <Input type="hidden" />
        </Form.Item>
        <Form.Item name="iconUrl" hidden>
          <Input type="hidden" />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default UpdateTitleModal
