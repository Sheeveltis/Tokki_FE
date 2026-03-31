'use client'

import React, { useEffect, useState } from 'react'
import { Modal, Form, Input, InputNumber, Switch, ColorPicker, Space, Upload } from 'antd'
import { InboxOutlined } from '@ant-design/icons'
import { showAdminError } from '../../../../components/HelperAdmin.jsx'
import { createObjectUrl, revokeObjectUrl } from '../../examination-management/api/upload-utils'

const { TextArea } = Input
const { Dragger } = Upload

export function UpdateTitleModal({ open, onCancel, onSubmit, loading, initialData }) {
  const [form] = Form.useForm()
  const colorHex = Form.useWatch('colorHex', form)
  const iconFile = Form.useWatch('iconFile', form)
  const [iconPreviewUrl, setIconPreviewUrl] = useState('')

  // Set initial values when modal opens or initialData changes
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
      if (initialData.iconUrl) {
        setIconPreviewUrl(initialData.iconUrl)
      } else {
        setIconPreviewUrl('')
      }
    }
  }, [open, initialData, form])

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      revokeObjectUrl(iconPreviewUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update preview when file changes
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
        showAdminError('Chỉ chấp nhận file hình ảnh!')
        return Upload.LIST_IGNORE
      }
      form.setFieldsValue({ iconFile: file })
      return false
    },
  }

  return (
    <Modal
      title="Sửa danh hiệu"
      open={open}
      onCancel={() => {
        form.resetFields()
        setIconPreviewUrl('')
        onCancel?.()
      }}
      onOk={() => form.submit()}
      okText="Cập nhật"
      cancelText="Hủy"
      confirmLoading={loading}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          isSystemGiven: false,
          requiredXP: 0,
        }}
        onFinish={(values) => {
          try {
            // Validate required fields
            if (!values.name?.trim()) {
              showAdminError('Vui lòng nhập tên danh hiệu')
              return
            }

            // Prepare payload
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
          } catch (e) {
            showAdminError(e?.message || 'Dữ liệu không hợp lệ')
          }
        }}
      >
        <Form.Item
          label="Tên danh hiệu"
          name="name"
          rules={[{ required: true, message: 'Vui lòng nhập tên danh hiệu' }]}
        >
          <Input placeholder="Nhập tên danh hiệu" />
        </Form.Item>

        <Form.Item label="Mô tả" name="description">
          <TextArea rows={3} placeholder="Nhập mô tả (tùy chọn)" />
        </Form.Item>

        <Form.Item
          label="XP yêu cầu"
          name="requiredXP"
          rules={[{ type: 'number', min: 0, message: 'XP yêu cầu phải lớn hơn hoặc bằng 0' }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="Nhập XP yêu cầu"
            min={0}
          />
        </Form.Item>

        <Form.Item label="Màu" name="colorHex">
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <div>
              <ColorPicker
                showText
                format="hex"
                value={colorHex || '#1677ff'}
                onChange={(color) => {
                  const hexValue = color.toHexString()
                  form.setFieldsValue({ colorHex: hexValue })
                }}
              />
              <style>{`
                .ant-color-picker-format-select,
                .ant-color-picker-format-selector,
                .ant-color-picker-format-btn,
                [class*="format-select"],
                [class*="format-selector"] {
                  display: none !important;
                }
              `}</style>
            </div>
            <Input
              value={colorHex || ''}
              placeholder="Nhập mã màu hex (ví dụ: #FF5733)"
              onChange={(e) => {
                form.setFieldsValue({ colorHex: e.target.value })
              }}
              addonBefore="Mã màu"
            />
          </Space>
        </Form.Item>

        <Form.Item label="Icon">
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Dragger {...iconUploadProps}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Nhấp hoặc kéo thả ảnh icon vào đây</p>
              <p className="ant-upload-hint">Chỉ nhận file hình ảnh</p>
            </Dragger>

            {iconPreviewUrl ? (
              <div style={{ marginTop: 12 }}>
                <img
                  src={iconPreviewUrl}
                  alt="Icon preview"
                  style={{ maxWidth: '100%', maxHeight: 240, borderRadius: 8, border: '1px solid #d9d9d9' }}
                />
              </div>
            ) : null}
          </Space>
        </Form.Item>

        {/* Hidden fields */}
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

