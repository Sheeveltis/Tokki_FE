'use client'

import React, { useEffect, useState } from 'react'
import { Modal, Form, Input, Select, Upload } from 'antd'
import { InboxOutlined } from '@ant-design/icons'
import { showAdminError } from '../../../../../../components/HelperAdmin.jsx'

import { createObjectUrl, revokeObjectUrl } from '../../../api/upload-utils'

const { TextArea } = Input
const { Dragger } = Upload

const MEDIA_TYPE_OPTIONS = [
  { value: 0, label: 'Văn bản (Text)' },
  { value: 1, label: 'Hình ảnh (Image)' },
  { value: 2, label: 'Audio' },
]

const STATUS_OPTIONS = [
  { value: 1, label: 'Hoạt động' },
  { value: 2, label: 'Đã ẩn' },
]

export function CreatePassageModal({ open, onCancel, onSubmit, loading }) {
  const [form] = Form.useForm()

  const mediaType = Form.useWatch('mediaType', form)
  const imageFile = Form.useWatch('imageFile', form)
  const audioFile = Form.useWatch('audioFile', form)

  const [imagePreviewUrl, setImagePreviewUrl] = useState('')
  const [audioPreviewUrl, setAudioPreviewUrl] = useState('')

  // cleanup object urls on unmount
  useEffect(() => {
    return () => {
      revokeObjectUrl(imagePreviewUrl)
      revokeObjectUrl(audioPreviewUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update preview when file changes
  useEffect(() => {
    if (imageFile) {
      const url = createObjectUrl(imageFile)
      setImagePreviewUrl((prev) => {
        if (prev) revokeObjectUrl(prev)
        return url
      })
    } else {
      setImagePreviewUrl((prev) => {
        if (prev) revokeObjectUrl(prev)
        return ''
      })
    }
  }, [imageFile])

  useEffect(() => {
    if (audioFile) {
      const url = createObjectUrl(audioFile)
      setAudioPreviewUrl((prev) => {
        if (prev) revokeObjectUrl(prev)
        return url
      })
    } else {
      setAudioPreviewUrl((prev) => {
        if (prev) revokeObjectUrl(prev)
        return ''
      })
    }
  }, [audioFile])

  const resetConditionalFields = () => {
    form.setFieldsValue({
      content: undefined,
      imageFile: null,
      audioFile: null,
    })
  }

  const validateBeforeSubmit = (values) => {
    const mt = values.mediaType

    if (mt === 0) {
      if (!values.content?.trim()) throw new Error('MediaType = Văn bản: chỉ được nhập content')
      return
    }

    if (mt === 1) {
      if (!values.imageFile) throw new Error('MediaType = Hình ảnh: chỉ được chọn hình ảnh')
      return
    }

    if (mt === 2) {
      if (!values.audioFile) throw new Error('MediaType = Audio: chỉ được chọn audio')
      return
    }

    throw new Error('MediaType không hợp lệ')
  }

  const imageUploadProps = {
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
      form.setFieldsValue({ imageFile: file })
      return false
    },
  }

  const audioUploadProps = {
    name: 'file',
    multiple: false,
    showUploadList: false,
    accept: 'audio/*',
    beforeUpload: (file) => {
      const isAudio = file.type.startsWith('audio/')
      if (!isAudio) {
        showAdminError('Chỉ chấp nhận file audio!')
        return Upload.LIST_IGNORE
      }
      form.setFieldsValue({ audioFile: file })
      return false
    },
  }

  return (
    <Modal
      title="Thêm Passage"
      open={open}
      onCancel={() => {
        form.resetFields()
        resetConditionalFields()
        setImagePreviewUrl('')
        setAudioPreviewUrl('')
        onCancel?.()
      }}
      onOk={() => form.submit()}
      okText="Tạo"
      cancelText="Hủy"
      confirmLoading={loading}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        // ẩn các field cho tới khi user chọn MediaType
        initialValues={{ mediaType: undefined, status: 1 }}
        onFinish={(values) => {
          try {
            validateBeforeSubmit(values)
            onSubmit?.(values)
          } catch (e) {
            showAdminError(e?.message || 'Dữ liệu không hợp lệ')
          }
        }}
      >
        <Form.Item
          label="Tiêu đề"
          name="title"
          rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
        >
          <Input placeholder="Nhập tiêu đề" />
        </Form.Item>

        <Form.Item
          label="MediaType"
          name="mediaType"
          rules={[{ required: true, message: 'Vui lòng chọn MediaType' }]}
        >
          <Select
            options={MEDIA_TYPE_OPTIONS}
            placeholder="Chọn MediaType"
            onChange={() => {
              resetConditionalFields()
            }}
          />
        </Form.Item>

        {mediaType === 0 ? (
          <Form.Item
            label="Nội dung (chỉ cho Văn bản)"
            name="content"
            rules={[{ required: true, message: 'Vui lòng nhập content' }]}
          >
            <TextArea rows={5} placeholder="Nhập nội dung passage" />
          </Form.Item>
        ) : null}

        {mediaType === 1 ? (
          <Form.Item label="Hình ảnh (chỉ cho Image)">
            <Dragger {...imageUploadProps}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Nhấp hoặc kéo thả ảnh vào đây</p>
              <p className="ant-upload-hint">Chỉ nhận file hình ảnh</p>
            </Dragger>

            {imagePreviewUrl ? (
              <div style={{ marginTop: 12 }}>
                <img
                  src={imagePreviewUrl}
                  alt="Preview"
                  style={{ maxWidth: '100%', maxHeight: 240, borderRadius: 8, border: '1px solid #d9d9d9' }}
                />
              </div>
            ) : null}
          </Form.Item>
        ) : null}

        {mediaType === 2 ? (
          <Form.Item label="Audio (chỉ cho Audio)">
            <Dragger {...audioUploadProps}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Nhấp hoặc kéo thả audio vào đây</p>
              <p className="ant-upload-hint">Chỉ nhận file audio</p>
            </Dragger>

            {audioPreviewUrl ? (
              <div style={{ marginTop: 12 }}>
                <audio controls style={{ width: '100%' }}>
                  <source src={audioPreviewUrl} />
                  Trình duyệt không hỗ trợ phát audio.
                </audio>
              </div>
            ) : null}
          </Form.Item>
        ) : null}

        <Form.Item label="Status" name="status" initialValue={1}>
          <Select options={STATUS_OPTIONS} />
        </Form.Item>

        {/* hidden file fields */}
        <Form.Item name="imageFile" hidden>
          <Input type="hidden" />
        </Form.Item>
        <Form.Item name="audioFile" hidden>
          <Input type="hidden" />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default CreatePassageModal
