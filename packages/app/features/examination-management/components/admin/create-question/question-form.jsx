import React, { useState, useEffect, useMemo } from 'react'
import { Form, Input, Select, Space, Typography, Upload, message, Switch, Row, Col } from 'antd'
import { Form, Input, Select, Space, Typography, Upload, message, Switch, Row, Col } from 'antd'
import { InboxOutlined } from '@ant-design/icons'
import { fetchPassages, fetchQuestionTypeById } from '../../../api/create-question.js'
import { isAudioUrl, createObjectUrl } from '../../../api/upload-utils.js'
import { getCurrentUserRole } from '../../../../../provider/api/client.js'

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
  const [questionType, setQuestionType] = useState(null)
  const [loadingQuestionType, setLoadingQuestionType] = useState(false)
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
    if (!questionTypeId) {
      setQuestionType(null)
      return
    }
    const loadQuestionType = async () => {
      try {
        setLoadingQuestionType(true)
        const data = await fetchQuestionTypeById(questionTypeId)
        setQuestionType(data)
      } catch (error) {
        message.error('Không thể tải thông tin loại câu hỏi')
      } finally {
        setLoadingQuestionType(false)
      }
    }
    loadQuestionType()
  }, [questionTypeId])

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

  const validPassages = useMemo(() => {
    if (!questionType || !questionType.skill) return passages
    if (!questionType || !questionType.skill) return passages
    const skill = questionType.skill
    return passages.filter((passage) => {
      const mediaType = passage.mediaType
      if (skill === 1) return mediaType === 2
      if (skill === 2 || skill === 3) return mediaType === 0 || mediaType === 1
      if (skill === 1) return mediaType === 2
      if (skill === 2 || skill === 3) return mediaType === 0 || mediaType === 1
      return false
    })
  }, [passages, questionType])

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
      form.setFieldsValue({ mediaFile: file, mediaUrl: null })
      return false
      form.setFieldsValue({ mediaFile: file, mediaUrl: null })
      return false
    },
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label={<span style={{ fontWeight: 600, fontSize: 13 }}>Đoạn văn (Passage)</span>}
            name="passageId"
            tooltip="Chọn đoạn văn nếu câu hỏi thuộc về một đoạn văn cụ thể"
            style={{ marginBottom: 0 }}
          >
            <Select
              placeholder="Chọn đoạn văn (tùy chọn)"
              allowClear
              loading={loadingPassages}
              showSearch
              style={{ width: '100%' }}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={validPassages.map((passage) => ({
                value: passage.passageId,
                label: `${passage.title || 'Không có tiêu đề'}`,
                passage: passage,
              }))}
              optionRender={(option) => (
                <div>
                  <div style={{ fontWeight: 500 }}>{option.label}</div>
                  {option.data.passage?.content && (
                    <div style={{ fontSize: 11, color: '#8c8c8c', maxWidth: 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {option.data.passage.content}
                    </div>
                  )}
                </div>
              )}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label={<span style={{ fontWeight: 600, fontSize: 13 }}>Trạng thái</span>}
            name="status"
            initialValue={0}
            style={{ marginBottom: 0 }}
          >
            <Select>
              <Select.Option value={0}>Nháp</Select.Option>
              <Select.Option value={isStaff ? 3 : 1}>{isStaff ? 'Gửi duyệt' : 'Hoạt động'}</Select.Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        label={<span style={{ fontWeight: 600, fontSize: 13 }}>Nội dung câu hỏi</span>}
        name="content"
        rules={[{ required: true, message: 'Vui lòng nhập nội dung câu hỏi' }]}
        style={{ marginBottom: 0 }}
      >
        <TextArea
          rows={3}
          placeholder="Nhập nội dung câu hỏi..."
        />
      </Form.Item>

      <Row gutter={16} align="top">
        <Col span={12}>
          <Form.Item
            label={<span style={{ fontWeight: 600, fontSize: 13 }}>Đính kèm (Hình ảnh / Audio)</span>}
            name="mediaUrl"
            style={{ marginBottom: 0 }}
          >
            <Dragger {...mediaUploadProps} style={{ borderRadius: 10, padding: '8px 0', height: 90, backgroundColor: '#fafafa' }}>
              <p className="ant-upload-drag-icon" style={{ marginBottom: 4 }}>
                <InboxOutlined style={{ fontSize: 24, color: '#1677ff' }} />
              </p>
              <p className="ant-upload-text" style={{ fontSize: 12, margin: 0 }}>Nhấn hoặc kéo thả để tải lên</p>
              <p className="ant-upload-hint" style={{ fontSize: 10, margin: 0 }}>Ảnh hoặc Audio</p>
            </Dragger>
          </Form.Item>
        </Col>
        <Col span={12}>
          <div style={{ display: 'block', marginBottom: 8, height: 22 }}>
            <span style={{ fontWeight: 600, fontSize: 13 }}>Xem trước media</span>
          </div>
          {mediaPreview ? (
            <div style={{ 
              height: 90, 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center',
              backgroundColor: '#fafafa',
              borderRadius: 10,
              border: '1px solid #f0f0f0',
              padding: 4,
              boxSizing: 'border-box'
            }}>
              {isAudioUrl(mediaPreview) ? (
                <audio 
                  controls 
                  src={mediaPreview} 
                  style={{ width: '100%', height: 32 }} 
                />
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <img src={mediaPreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: 80, borderRadius: 6, display: 'block', margin: '0 auto' }} />
                </div>
              )}
              {mediaFile && (
                <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 8, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {mediaFile.name}
                </div>
              )}
            </div>
          ) : (
            <div style={{ height: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fafafa', borderRadius: 10, border: '1px solid #f0f0f0', color: '#bfbfbf', fontSize: 11 }}>
              Chưa có media
            </div>
          )}
        </Col>
      </Row>
    </div>
  )
}
