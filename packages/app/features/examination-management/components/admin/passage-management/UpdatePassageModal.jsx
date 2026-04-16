'use client'

import React, { useEffect, useState } from 'react'
import { Modal, Form, Input, Select, Upload, Space } from 'antd'
import { 
  InboxOutlined, 
  FontSizeOutlined, 
  AppstoreOutlined, 
  AlignLeftOutlined, 
  PictureOutlined, 
  AudioOutlined, 
  CheckCircleOutlined
} from '@ant-design/icons'
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

export function UpdatePassageModal({ open, onCancel, onSubmit, loading, initialValues }) {
  const [form] = Form.useForm()

  const mediaType = Form.useWatch('mediaType', form)
  const imageFile = Form.useWatch('imageFile', form)
  const audioFile = Form.useWatch('audioFile', form)

  const [imagePreviewUrl, setImagePreviewUrl] = useState('')
  const [audioPreviewUrl, setAudioPreviewUrl] = useState('')

  useEffect(() => {
    if (open && initialValues) {
      form.setFieldsValue({
        passageId: initialValues.passageId,
        title: initialValues.title,
        mediaType: initialValues.mediaType,
        status: initialValues.status ?? 1,
        content: initialValues.content,
        imageUrl: initialValues.imageUrl1 || initialValues.imageUrl || null, // Dùng imageUrl cho cả Image và Audio
        imageFile: null,
        audioFile: null,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialValues])

  useEffect(() => {
    return () => {
      revokeObjectUrl(imagePreviewUrl)
      revokeObjectUrl(audioPreviewUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!imageFile) return
    const url = createObjectUrl(imageFile)
    setImagePreviewUrl((prev) => {
      if (prev) revokeObjectUrl(prev)
      return url
    })
  }, [imageFile])

  useEffect(() => {
    if (!audioFile) return
    const url = createObjectUrl(audioFile)
    setAudioPreviewUrl((prev) => {
      if (prev) revokeObjectUrl(prev)
      return url
    })
  }, [audioFile])

  const resetConditionalFields = () => {
    form.setFieldsValue({
      content: undefined,
      imageFile: null,
      audioFile: null,
      imageUrl: null,
    })
    setImagePreviewUrl((prev) => {
      if (prev) revokeObjectUrl(prev)
      return ''
    })
    setAudioPreviewUrl((prev) => {
      if (prev) revokeObjectUrl(prev)
      return ''
    })
  }

  const validateBeforeSubmit = (values) => {
    const mt = values.mediaType
    if (mt === 0) {
      if (!values.content?.trim()) throw new Error('MediaType = Văn bản: bắt buộc nhập content')
      return
    }
    if (mt === 1) {
      if (!values.imageFile && !values.imageUrl) throw new Error('MediaType = Hình ảnh: bắt buộc chọn ảnh')
      return
    }
    if (mt === 2) {
      if (!values.audioFile && !values.imageUrl) throw new Error('MediaType = Audio: bắt buộc chọn audio')
      return
    }
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
      form.setFieldsValue({ imageFile: file, imageUrl: null })
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
      form.setFieldsValue({ audioFile: file, imageUrl: null })
      return false
    },
  }

  return (
    <Modal
      title="Cập nhật Passage"
      open={open}
      onCancel={() => {
        form.resetFields()
        resetConditionalFields()
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
        requiredMark={false}
        onFinish={(values) => {
          try {
            validateBeforeSubmit(values)
            onSubmit?.(values)
          } catch (e) {
            showAdminError(e?.message || 'Dữ liệu không hợp lệ')
          }
        }}
      >
        <Form.Item name="passageId" hidden>
          <Input />
        </Form.Item>

         <Form.Item
          label={<Space><FontSizeOutlined style={{ color: '#1677ff' }} />Tiêu đề (Bắt buộc)</Space>}
          name="title"
          rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
        >
          <Input placeholder="Nhập tiêu đề" />
        </Form.Item>

        <Form.Item
          label={<Space><AppstoreOutlined style={{ color: '#1677ff' }} />MediaType (Bắt buộc)</Space>}
          name="mediaType"
          rules={[{ required: true, message: 'Vui lòng chọn MediaType' }]}
        >
          <Select
            options={MEDIA_TYPE_OPTIONS}
            placeholder="Chọn MediaType"
            onChange={resetConditionalFields}
          />
        </Form.Item>

        {mediaType === 0 ? (
          <Form.Item
            label={<Space><AlignLeftOutlined style={{ color: '#1677ff' }} />Nội dung (Bắt buộc) (chỉ cho Văn bản)</Space>}
            name="content"
            rules={[{ required: true, message: 'Vui lòng nhập content' }]}
          >
            <TextArea rows={5} placeholder="Nhập nội dung passage" />
          </Form.Item>
        ) : null}

        {mediaType === 1 ? (
          <Form.Item label={<Space><PictureOutlined style={{ color: '#1677ff' }} />Hình ảnh (Bắt buộc) (chỉ cho Image)</Space>}>
            <Dragger {...imageUploadProps}>
              <p className="ant-upload-drag-icon"><InboxOutlined /></p>
              <p className="ant-upload-text">Nhấp hoặc kéo thả ảnh vào đây</p>
            </Dragger>

            {(imagePreviewUrl || form.getFieldValue('imageUrl')) ? (
              <div style={{ marginTop: 12 }}>
                <img
                  src={imagePreviewUrl || form.getFieldValue('imageUrl')}
                  alt="Preview"
                  style={{ maxWidth: '100%', maxHeight: 240, borderRadius: 8, border: '1px solid #d9d9d9' }}
                />
              </div>
            ) : null}
          </Form.Item>
        ) : null}

        {mediaType === 2 ? (
          <Form.Item label={<Space><AudioOutlined style={{ color: '#1677ff' }} />Audio (Bắt buộc) (chỉ cho Audio)</Space>}>
            <Dragger {...audioUploadProps}>
              <p className="ant-upload-drag-icon"><InboxOutlined /></p>
              <p className="ant-upload-text">Nhấp hoặc kéo thả audio vào đây</p>
            </Dragger>

            {(audioPreviewUrl || form.getFieldValue('imageUrl')) ? (
              <div style={{ marginTop: 12 }}>
                <audio controls style={{ width: '100%' }}>
                  <source src={audioPreviewUrl || form.getFieldValue('imageUrl')} />
                  Trình duyệt không hỗ trợ phát audio.
                </audio>
              </div>
            ) : null}
          </Form.Item>
        ) : null}

        <Form.Item 
          label={<Space><CheckCircleOutlined style={{ color: '#1677ff' }} />Status</Space>} 
          name="status" 
          initialValue={1}
        >
          <Select options={STATUS_OPTIONS} />
        </Form.Item>

        {/* hidden */}
        <Form.Item name="imageFile" hidden><Input /></Form.Item>
        <Form.Item name="audioFile" hidden><Input /></Form.Item>
        <Form.Item name="imageUrl" hidden><Input /></Form.Item>
      </Form>
    </Modal>
  )
}

export default UpdatePassageModal
