import React, { useState, useEffect, useMemo } from 'react'
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
    const skill = questionType.skill
    return passages.filter((passage) => {
      const mediaType = passage.mediaType
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
    },
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Row gutter={16}>
        <Col span={16}>
          <Form.Item
            label="Đoạn văn (Passage)"
            name="passageId"
            tooltip="Chọn đoạn văn nếu câu hỏi thuộc về một đoạn văn cụ thể"
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
        <Col span={8}>
          <Form.Item
            label="Trạng thái"
            name="status"
            initialValue={0}
          >
            <Select>
              <Select.Option value={0}>Nháp</Select.Option>
              <Select.Option value={isStaff ? 3 : 1}>{isStaff ? 'Gửi duyệt' : 'Hoạt động'}</Select.Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        label="Nội dung câu hỏi"
        name="content"
        rules={[{ required: true, message: 'Vui lòng nhập nội dung câu hỏi' }]}
      >
        <TextArea
          rows={3}
          placeholder="Nhập nội dung câu hỏi..."
        />
      </Form.Item>

      <Row gutter={16}>
        <Col span={14}>
          <Form.Item
            label="Đính kèm (Hình ảnh / Audio)"
            name="mediaUrl"
          >
            <Dragger {...mediaUploadProps} style={{ borderRadius: 8, padding: 16 }}>
              <p className="ant-upload-drag-icon" style={{ marginBottom: 8 }}><InboxOutlined style={{ fontSize: 32 }} /></p>
              <p className="ant-upload-text" style={{ fontSize: 13 }}>Kéo thả file để tải lên</p>
            </Dragger>
          </Form.Item>
        </Col>
        <Col span={10}>
          {mediaPreview ? (
            <div style={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center',
              backgroundColor: '#fafafa',
              borderRadius: 8,
              border: '1px dashed #d9d9d9',
              padding: 12
            }}>
              {isAudioUrl(mediaPreview) ? (
                <audio controls style={{ width: '100%', height: 32 }}>
                  <source src={mediaPreview} />
                </audio>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <img src={mediaPreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: 80, borderRadius: 4 }} />
                </div>
              )}
              {mediaFile && (
                <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 8, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {mediaFile.name}
                </div>
              )}
            </div>
          ) : (
            <div style={{ 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor: '#fafafa',
              borderRadius: 8,
              border: '1px dashed #d9d9d9',
              color: '#bfbfbf',
              fontSize: 12
            }}>
              Xem trước hình ảnh/âm thanh
            </div>
          )}
        </Col>
      </Row>

      <Form.Item
        label="Giải thích / Chú thích"
        name="explanation"
      >
        <TextArea
          rows={2}
          placeholder="Nhập chú thích..."
        />
      </Form.Item>
    </div>
  )
}
