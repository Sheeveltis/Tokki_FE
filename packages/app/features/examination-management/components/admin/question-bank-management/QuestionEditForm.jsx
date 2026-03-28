import React from 'react'
import { Typography, Input, Select, Upload, Button, Space, message } from 'antd'
import { InboxOutlined } from '@ant-design/icons'
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
    <Space direction="vertical" size={8} style={{ width: '100%' }}>
      {/* Change Question Type Button */}
      <div>
        <Button 
          type="dashed" 
          onClick={onOpenTypeSelector}
          style={{ width: '100%', marginBottom: 8 }}
        >
          {currentQuestionType ? `Đổi bộ câu hỏi: ${currentQuestionType.name}` : 'Đổi bộ câu hỏi'}
        </Button>
        {currentQuestionType && (
          <div style={{ padding: 8, backgroundColor: '#f5f5f5', borderRadius: 4, fontSize: '12px' }}>
            <div><strong>Kỹ năng:</strong> {['Nghe', 'Đọc', 'Viết'][currentQuestionType.skill - 1]}</div>
            <div><strong>Độ khó:</strong> {['Dễ', 'Trung bình', 'Khó', 'Rất khó'][currentQuestionType.difficulty - 1]}</div>
          </div>
        )}
      </div>

      {/* Passage Section */}
      <div style={{ marginBottom: 16 }}>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>Đoạn văn (nếu có):</Text>
        <Select
          style={{ width: '100%' }}
          placeholder="Chọn đoạn văn"
          value={editForm.passageId}
          onChange={(value) => {
            setEditForm(prev => ({ ...prev, passageId: value }))
            // Validate if questionType is selected
            if (editForm.questionTypeId && value) {
              const selectedPassage = allPassages.find(p => p.passageId === value)
              if (selectedPassage && !validatePassageSkillCompatibility(value, editForm.questionTypeId)) {
                const skillName = ['Nghe', 'Đọc', 'Viết'][currentQuestionType?.skill - 1]
                const mediaTypeName = ['Text', 'Hình ảnh', 'Audio'][selectedPassage.mediaType]
                message.warning(`Cảnh báo: Kỹ năng ${skillName} không tương thích với đoạn văn loại ${mediaTypeName}`)
              }
            }
          }}
          loading={loadingPassages}
          allowClear
          showSearch
          filterOption={(input, option) =>
            (option?.children?.props?.children || option?.children || '').toLowerCase().includes(input.toLowerCase())
          }
        >
          {(Array.isArray(allPassages) ? allPassages : []).map((p) => (
            <Option key={p.passageId} value={p.passageId}>
              <div>
                <div><strong>{p.title}</strong></div>
                <div style={{ fontSize: '12px', color: '#999' }}>
                  {p.content?.substring(0, 50)}...
                </div>
              </div>
            </Option>
          ))}
        </Select>
        {currentPassage && (
          <div style={{ marginTop: 8, padding: 8, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
            {currentPassage.mediaType === 1 && currentPassage.imageUrl ? (
              <img 
                src={currentPassage.imageUrl} 
                alt={currentPassage.title} 
                style={{ maxWidth: '100%', maxHeight: 150, borderRadius: 4 }} 
              />
            ) : (
              <Text style={{ fontSize: '12px' }}>{currentPassage.content}</Text>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>Nội dung câu hỏi:</Text>
        <TextArea
          rows={3}
          value={editForm.content}
          onChange={(e) => setEditForm(prev => ({ ...prev, content: e.target.value }))}
          placeholder="Nhập nội dung câu hỏi"
        />
      </div>

      {/* Media URL */}
      <div>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>Hình ảnh hoặc Audio (tùy chọn):</Text>
        <Dragger
          name="file"
          multiple={false}
          showUploadList={false}
          beforeUpload={(file) => {
            const isImage = file.type.startsWith('image/')
            const isAudio = file.type.startsWith('audio/')
            if (!isImage && !isAudio) {
              message.error('Chỉ chấp nhận file hình ảnh hoặc audio!')
              return Upload.LIST_IGNORE
            }

            setEditForm((prev) => ({ ...prev, mediaFile: file }))
            const preview = createObjectUrl(file)
            setMediaObjectUrl(preview)
            return false
          }}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">Nhấp hoặc kéo thả file vào đây để tải lên</p>
          <p className="ant-upload-hint">Hỗ trợ hình ảnh (JPG, PNG) hoặc audio (MP3, WAV)</p>
          {mediaObjectUrl || editForm.mediaUrl ? (
            <p style={{ marginTop: 8, marginBottom: 0, fontSize: 12, color: '#666' }}>
              {editForm?.mediaFile ? `File đã chọn: ${editForm.mediaFile.name}` : `Đã chọn: ${editForm.mediaUrl}`}
            </p>
          ) : null}
        </Dragger>

        {(mediaObjectUrl || editForm.mediaUrl) ? (
          <div style={{ marginTop: 12 }}>
            {isAudioUrl(mediaObjectUrl || editForm.mediaUrl) ? (
              <audio controls style={{ width: '100%' }}>
                <source src={mediaObjectUrl || editForm.mediaUrl} />
                Trình duyệt không hỗ trợ phát audio.
              </audio>
            ) : (
              <img
                src={mediaObjectUrl || editForm.mediaUrl}
                alt="Preview"
                style={{ maxWidth: '100%', maxHeight: 240, borderRadius: 8, border: '1px solid #d9d9d9' }}
              />
            )}
          </div>
        ) : null}

        {(mediaObjectUrl || editForm.mediaUrl) ? (
          <Button
            type="link"
            danger
            onClick={() => {
              setEditForm((prev) => ({ ...prev, mediaUrl: '', mediaFile: null }))
              setMediaObjectUrl('')
            }}
            style={{ paddingLeft: 0 }}
          >
            Xóa media
          </Button>
        ) : null}
      </div>

      {/* Explanation */}
      <div>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>Giải thích:</Text>
        <TextArea
          rows={2}
          value={editForm.explanation}
          onChange={(e) => setEditForm(prev => ({ ...prev, explanation: e.target.value }))}
          placeholder="Nhập giải thích"
        />
      </div>

      {/* Status - Ẩn khi là Staff */}
      {!isStaff && (
        <div style={{ marginTop: 8 }}>
          <Text strong style={{ display: 'block', marginBottom: 4 }}>Trạng thái:</Text>
          <Select
            style={{ width: 260 }}
            value={editForm.status}
            onChange={(value) => setEditForm((prev) => ({ ...prev, status: value }))}
            options={[
              { value: 0, label: 'Nháp' },
              { value: 1, label: 'Đang hoạt động' },
            ]}
          />
        </div>
      )}
    </Space>
  )
}

