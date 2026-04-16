import React from 'react'
import { Typography, Input, Select, Upload, Button, Space, message, Tag, Row, Col, Card, Form } from 'antd'
import { InboxOutlined, DeleteOutlined, SettingOutlined, FileTextOutlined, PictureOutlined, AudioOutlined } from '@ant-design/icons'
import { createObjectUrl, isAudioUrl } from '../../../api/upload-utils'
import { getCurrentUserRole } from '../../../../../provider/api/client.js'

const { Text, Paragraph } = Typography
const { TextArea } = Input
const { Option } = Select
const { Dragger } = Upload

/**
 * Form chỉnh sửa câu hỏi
 */

export function QuestionEditForm({
  editForm,
  setEditForm,
  mediaObjectUrl,
  setMediaObjectUrl,
  allPassages,
  loadingPassages,
  currentPassage,
  currentQuestionType,
  validatePassageSkillCompatibility,
  onOpenTypeSelector,
}) {
  const role = getCurrentUserRole()
  const isStaff = role === 'Staff'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Configuration Section */}
      <Row gutter={16}>
        <Col span={12}>
          <div style={{ marginBottom: 8 }}>
            <Text strong style={{ fontSize: 13, color: '#595959', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <SettingOutlined style={{ color: '#1677ff' }} /> Loại câu hỏi & Kỹ năng
            </Text>
            <div 
              onClick={onOpenTypeSelector}
              style={{ 
                padding: '10px 14px', 
                borderRadius: 10, 
                border: '1px dashed #d9d9d9', 
                backgroundColor: '#fafafa',
                cursor: 'pointer',
                transition: 'all 0.3s',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#1677ff'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#d9d9d9'}
            >
              <div>
                {currentQuestionType ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ fontWeight: 700, color: '#1677ff', fontSize: 15 }}>{currentQuestionType.name}</div>
                      {editForm.questionTypeId !== editForm.originalQuestionTypeId && (
                        <Tag color="warning" style={{ margin: 0 }}>Đã thay đổi</Tag>
                      )}
                    </div>
                    <Space size={8} style={{ marginTop: 4 }}>
                      <Tag color="blue" bordered={false} style={{ margin: 0, fontSize: 11 }}>
                        {['Nghe', 'Đọc', 'Viết'][currentQuestionType.skill - 1]}
                      </Tag>
                      <Tag color="orange" bordered={false} style={{ margin: 0, fontSize: 11 }}>
                        Độ khó: {['Dễ', 'Trung bình', 'Khó', 'Rất khó'][currentQuestionType.difficulty - 1]}
                      </Tag>
                    </Space>
                  </>
                ) : (
                  <Text type="secondary">Nhấp để chọn bộ câu hỏi...</Text>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                <Button type="link" size="small" style={{ padding: 0 }}>Thay đổi</Button>
                {editForm.questionTypeId !== editForm.originalQuestionTypeId && (
                  <Button 
                    type="text" 
                    danger 
                    size="small" 
                    style={{ fontSize: 12, padding: 0 }}
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditForm(prev => ({ ...prev, questionTypeId: prev.originalQuestionTypeId }))
                    }}
                  >
                    Hủy
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Col>
        
        <Col span={12}>
          <Form.Item
            label={<span style={{ fontWeight: 600, fontSize: 13 }}>Đoạn văn (Passage)</span>}
            name="passageId"
            tooltip="Chọn đoạn văn nếu câu hỏi thuộc về một đoạn văn cụ thể"
            style={{ marginBottom: 0 }}
          >
            <Select
              style={{ width: '100%' }}
              placeholder="Chọn đoạn văn tham chiếu"
              value={editForm.passageId}
              dropdownStyle={{ borderRadius: 12 }}
              onChange={(value) => {
                setEditForm(prev => ({ ...prev, passageId: value }))
                if (editForm.questionTypeId && value) {
                  const selectedPassage = Array.isArray(allPassages) ? allPassages.find(p => p.passageId === value) : null
                  if (selectedPassage && !validatePassageSkillCompatibility(value, editForm.questionTypeId)) {
                    const skillName = ['Nghe', 'Đọc', 'Viết'][currentQuestionType?.skill - 1]
                    const mediaTypeName = ['Văn bản', 'Hình ảnh', 'Âm thanh'][selectedPassage.mediaType]
                    message.warning(`Kỹ năng ${skillName} có thể không tương thích với đoạn văn ${mediaTypeName}`)
                  }
                }
              }}
              loading={loadingPassages}
              allowClear
              showSearch
            >
              {(Array.isArray(allPassages) ? allPassages : []).map((p) => (
                <Select.Option key={p.passageId} value={p.passageId}>
                  <div style={{ padding: '4px 0' }}>
                    <div style={{ fontWeight: 600 }}>{p.title}</div>
                    <div style={{ fontSize: '11px', color: '#8c8c8c', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.content?.substring(0, 60)}...
                    </div>
                  </div>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      {/* Main Content Card */}
      <Card 
        styles={{ body: { padding: 16 } }} 
        style={{ borderRadius: 12, border: '1px solid #f0f0f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}
      >
        <div style={{ marginBottom: 16 }}>
          <Text strong style={{ fontSize: 13, color: '#595959', display: 'block', marginBottom: 6 }}>Nội dung câu hỏi</Text>
          <TextArea
            rows={3}
            value={editForm.content}
            onChange={(e) => setEditForm(prev => ({ ...prev, content: e.target.value }))}
            placeholder="Nhập nội dung câu hỏi tại đây..."
            style={{ borderRadius: 10 }}
          />
        </div>

        <Row gutter={16} align="top">
          <Col span={12}>
            <Text strong style={{ fontSize: 13, color: '#595959', display: 'block', marginBottom: 6 }}>Media (Tùy chọn)</Text>
            <Dragger
              name="file"
              multiple={false}
              showUploadList={false}
              style={{ borderRadius: 10, backgroundColor: '#fafafa', height: 90, margin: 0, boxSizing: 'border-box' }}
              beforeUpload={(file) => {
                const isImage = file.type.startsWith('image/')
                const isAudio = file.type.startsWith('audio/')
                if (!isImage && !isAudio) {
                  message.error('Phải là hình ảnh hoặc audio!')
                  return Upload.LIST_IGNORE
                }
                setEditForm((prev) => ({ ...prev, mediaFile: file }))
                setMediaObjectUrl(createObjectUrl(file))
                return false
              }}
            >
              <div style={{ padding: '8px 0' }}>
                <p className="ant-upload-drag-icon" style={{ marginBottom: 4 }}>
                  <InboxOutlined style={{ fontSize: 22, color: '#1677ff' }} />
                </p>
                <p className="ant-upload-text" style={{ fontSize: 12, margin: 0 }}>Nhấn để tải lên</p>
                <p className="ant-upload-hint" style={{ fontSize: 10, margin: 0 }}>Ảnh hoặc Audio</p>
              </div>
            </Dragger>

            {(mediaObjectUrl || editForm.mediaUrl) && (
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 10px', backgroundColor: '#f5f5f5', borderRadius: 8 }}>
                <Text ellipsis style={{ fontSize: 11, maxWidth: '65%', color: '#595959' }}>
                  {editForm.mediaFile ? editForm.mediaFile.name : 'Đã có media'}
                </Text>
                <Button 
                  type="link" 
                  danger 
                  size="small" 
                  icon={<DeleteOutlined style={{ fontSize: 12 }} />} 
                  onClick={() => {
                    setEditForm(prev => ({ ...prev, mediaUrl: '', mediaFile: null }))
                    setMediaObjectUrl('')
                  }}
                  style={{ padding: 0, height: 'auto', fontSize: 11 }}
                >Gỡ bỏ</Button>
              </div>
            )}
          </Col>
          
          <Col span={12}>
            <Text strong style={{ fontSize: 13, color: '#595959', display: 'block', marginBottom: 6 }}>Preview Media</Text>
            <div style={{ 
              height: 90, 
              border: '1px solid #f0f0f0', 
              borderRadius: 10, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor: '#fafafa',
              overflow: 'hidden',
              margin: 0,
              padding: 4,
              boxSizing: 'border-box'
            }}>
              {(mediaObjectUrl || editForm.mediaUrl) ? (
                isAudioUrl(mediaObjectUrl || editForm.mediaUrl) ? (
                  <div style={{ width: '100%', padding: '0 8px' }}>
                    <audio 
                      controls 
                      src={mediaObjectUrl || editForm.mediaUrl}
                      style={{ width: '100%', height: 32 }}
                    />
                    <div style={{ fontSize: 10, color: '#8c8c8c', marginTop: 4, textAlign: 'center' }}>Audio preview</div>
                  </div>
                ) : (
                  <img
                    src={mediaObjectUrl || editForm.mediaUrl}
                    alt="Preview"
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '100%', 
                      objectFit: 'contain',
                      borderRadius: 8,
                      display: 'block'
                    }}
                  />
                )
              ) : (
                <Text type="secondary" style={{ fontSize: 11, color: '#bfbfbf' }}>Chưa có media</Text>
              )}
            </div>
          </Col>
        </Row>
      </Card>


      {!isStaff && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Text strong style={{ fontSize: 13, color: '#595959' }}>Trạng thái câu hỏi:</Text>
          <Select
            style={{ width: 180 }}
            value={editForm.status}
            onChange={(value) => setEditForm((prev) => ({ ...prev, status: value }))}
            options={[
              { value: 0, label: 'Nháp' },
              { value: 1, label: 'Hoạt động' },
            ]}
          />
        </div>
      )}
    </div>
  )
}

