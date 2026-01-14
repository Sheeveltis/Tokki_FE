'use client'

import React, { useState, useEffect } from 'react'
import { Form, Input, Select, Space, Typography, Upload, message, Switch } from 'antd'
import { InboxOutlined } from '@ant-design/icons'
import { fetchPassages } from '../api/api'
import { isAudioUrl, createObjectUrl } from './upload-utils'
import { getCurrentUserRole } from '../../../../../provider/api/client'

const { Title } = Typography
const { TextArea } = Input
const { Dragger } = Upload

/**
 * QuestionForm Component
 * Form để nhập thông tin câu hỏi
 */
export function QuestionForm({ form, questionTypeId }) {
  const [passages, setPassages] = useState([])
  const [loadingPassages, setLoadingPassages] = useState(false)
  const mediaFile = Form.useWatch('mediaFile', form)
  const mediaUrl = Form.useWatch('mediaUrl', form)
  const mediaPreview = createObjectUrl(mediaFile) || mediaUrl
  const role = getCurrentUserRole()
  const isStaff =
    role === 'Staff' ||
    (typeof window !== 'undefined' &&
      typeof window.localStorage !== 'undefined' &&
      window.localStorage.getItem('userLevel') === '2')

  useEffect(() => {
    const loadPassages = async () => {
      try {
        setLoadingPassages(true)
        const data = await fetchPassages()
        setPassages(data || [])
      } catch (error) {
        message.error('Không thể tải danh sách đoạn văn')
      } finally {
        setLoadingPassages(false)
      }
    }
    loadPassages()
  }, [])

  // Chỉ chọn file + preview tại local. Upload Cloudinary sẽ chạy khi bấm "Tạo mới".
  const mediaUploadProps = {
    name: 'file',
    multiple: false,
    showUploadList: false,
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/')
      const isAudio = file.type.startsWith('audio/')
      if (!isImage && !isAudio) {
        message.error('Chỉ chấp nhận file hình ảnh hoặc audio!')
        return Upload.LIST_IGNORE
      }
      // Lưu File vào form để submit sau
      form.setFieldsValue({ mediaFile: file })
      // Nếu trước đó có mediaUrl (đã upload) thì reset để ưu tiên file mới
      form.setFieldsValue({ mediaUrl: null })
      return false // chặn antd tự upload
    },
  }

  return (
    <Space orientation="vertical" size="large" style={{ width: '100%' }}>
      <div>
        <Title level={4} style={{ marginBottom: 16 }}>
          Thông tin câu hỏi
        </Title>
      </div>

      <Form.Item
        label="Đoạn văn (Passage)"
        name="passageId"
        tooltip="Chọn đoạn văn nếu câu hỏi thuộc về một đoạn văn cụ thể"
      >
        <Select
          size="large"
          placeholder="Chọn đoạn văn (tùy chọn)"
          allowClear
          loading={loadingPassages}
          showSearch
          filterOption={(input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
          options={passages.map((passage) => ({
            value: passage.passageId,
            label: `${passage.title || 'Không có tiêu đề'}`,
            passage: passage,
          }))}
          optionRender={(option) => (
            <div>
              <div style={{ fontWeight: 500 }}>{option.label}</div>
              {option.data.passage?.content && (
                <div
                  style={{
                    fontSize: 12,
                    color: '#666',
                    marginTop: 4,
                    maxHeight: 60,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {option.data.passage.content.substring(0, 100)}...
                </div>
              )}
            </div>
          )}
        />
      </Form.Item>

      <Form.Item
        label="Trạng thái"
        name="status"
        tooltip="Nháp: Soạn thảo/Không hoạt động. Hoạt động: sẽ được kích hoạt sau khi tạo."
        initialValue={0}
      >
        <Switch
          checkedChildren={isStaff ? 'Gửi duyệt' : 'Hoạt động'}
          unCheckedChildren="Nháp"
          checked={Form.useWatch('status', form) === (isStaff ? 3 : 1)}
          onChange={(checked) =>
            form.setFieldsValue({ status: checked ? (isStaff ? 3 : 1) : 0 })
          }
        />
      </Form.Item>

      <Form.Item
        label="Nội dung câu hỏi"
        name="content"
        rules={[{ required: true, message: 'Vui lòng nhập nội dung câu hỏi' }]}
      >
        <TextArea
          rows={4}
          placeholder="Nhập nội dung câu hỏi..."
          size="large"
        />
      </Form.Item>

      <Form.Item
        label="Hình ảnh hoặc Audio"
        name="mediaUrl"
        tooltip="Tải lên hình ảnh hoặc file audio cho câu hỏi"
      >
        <div>
          <Dragger {...mediaUploadProps}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">Nhấp hoặc kéo thả file vào đây để tải lên</p>
            <p className="ant-upload-hint">Hỗ trợ hình ảnh (JPG, PNG) hoặc audio (MP3, WAV)</p>
          </Dragger>

          {mediaPreview ? (
            <div style={{ marginTop: 12 }}>
              {isAudioUrl(mediaPreview) ? (
                <audio controls style={{ width: '100%' }}>
                  <source src={mediaPreview} />
                  Trình duyệt không hỗ trợ phát audio.
                </audio>
              ) : (
                <img
                  src={mediaPreview}
                  alt="Preview"
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: 240, 
                    borderRadius: 8, 
                    border: '1px solid #d9d9d9',
                    display: 'block',
                    marginTop: 8
                  }}
                />
              )}
              {mediaFile && (
                <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                  File đã chọn: {mediaFile.name}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </Form.Item>

      <Form.Item
        label="Chú thích (Giải thích)"
        name="explanation"
        tooltip="Giải thích cho câu hỏi này"
      >
        <TextArea
          rows={3}
          placeholder="Nhập chú thích hoặc giải thích cho câu hỏi..."
          size="large"
        />
      </Form.Item>
    </Space>
  )
}

