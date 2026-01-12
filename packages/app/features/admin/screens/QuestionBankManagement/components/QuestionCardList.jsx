'use client'

import React, { useEffect, useState } from 'react'
import { Card, Row, Col, Tag, Typography, Space, Button, Popconfirm, Spin, Input, Select, Modal, message, Checkbox, Upload, Switch } from 'antd'
import { EditOutlined, DeleteOutlined, SaveOutlined, CloseOutlined, PlusOutlined, InboxOutlined } from '@ant-design/icons'
import { fetchPassageById, fetchPassages, fetchQuestionTypes, updateQuestionBank, updateQuestionBankOption, createQuestionBankOption, deleteQuestionBankOption, activateQuestionBanks } from '../api/api'
import { uploadOptionImageToCloudinary, uploadQuestionAudioToCloudinary, uploadQuestionImageToCloudinary } from '../../../api/cloudinary'
import { createObjectUrl, isAudioUrl } from '../../CreateQuestion/components/upload-utils'

const { Text, Paragraph } = Typography
const { TextArea } = Input
const { Option } = Select
const { Dragger } = Upload

/**
 * QuestionCardList Component
 * Hiển thị danh sách câu hỏi dưới dạng các card, mỗi card là một câu hỏi và các đáp án.
 * Nếu câu hỏi có passageId thì hiển thị passageTitle trong title.
 */
export function QuestionCardList({ data, loading, onEdit, onDelete }) {
  const [passageMap, setPassageMap] = useState({})
  const [loadingPassage, setLoadingPassage] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [allPassages, setAllPassages] = useState([])
  const [questionTypes, setQuestionTypes] = useState([])
  const [showTypeSelector, setShowTypeSelector] = useState(false)
  const [loadingPassages, setLoadingPassages] = useState(false)
  const [loadingTypes, setLoadingTypes] = useState(false)
  const [editOptions, setEditOptions] = useState([])
  const [saving, setSaving] = useState(false)
  const [mediaObjectUrl, setMediaObjectUrl] = useState('')

  // Fetch passages whenever data changes
  useEffect(() => {
    const fetchPassagesForDisplay = async () => {
      if (!Array.isArray(data) || data.length === 0) return
      const ids = Array.from(new Set(data.filter((q) => q.passageId).map((q) => q.passageId)))
      if (ids.length === 0) return
      // Skip if already loaded all ids
      const idsToFetch = ids.filter((id) => !passageMap[id])
      if (idsToFetch.length === 0) return
      try {
        setLoadingPassage(true)
        const results = await Promise.all(
          idsToFetch.map((id) => fetchPassageById(id).catch(() => null)),
        )
        const newMap = {}
        idsToFetch.forEach((id, idx) => {
          if (results[idx]) newMap[id] = results[idx]
        })
        setPassageMap((prev) => ({ ...prev, ...newMap }))
      } finally {
        setLoadingPassage(false)
      }
    }
    fetchPassagesForDisplay()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  // Load all passages for dropdown when editing
  useEffect(() => {
    const loadAllPassages = async () => {
      if (!editingId) return
      try {
        setLoadingPassages(true)
        const passages = await fetchPassages()
        setAllPassages(passages)
      } catch (error) {
        console.error('Error loading passages:', error)
        message.error('Không thể tải danh sách đoạn văn')
      } finally {
        setLoadingPassages(false)
      }
    }
    loadAllPassages()
  }, [editingId])

  // Load question types when opening type selector
  useEffect(() => {
    const loadQuestionTypes = async () => {
      if (!showTypeSelector) return
      try {
        setLoadingTypes(true)
        const types = await fetchQuestionTypes()
        setQuestionTypes(types)
      } catch (error) {
        console.error('Error loading question types:', error)
        message.error('Không thể tải danh sách bộ câu hỏi')
      } finally {
        setLoadingTypes(false)
      }
    }
    loadQuestionTypes()
  }, [showTypeSelector])

  // Validate mediaType compatibility with skill
  const validatePassageSkillCompatibility = (passageId, questionTypeId) => {
    if (!passageId || !questionTypeId) return true
    
    const passage = passageMap[passageId] || allPassages.find(p => p.passageId === passageId)
    const questionType = questionTypes.find(t => t.questionTypeId === questionTypeId)
    
    if (!passage || !questionType) return true
    
    const skill = questionType.skill
    const mediaType = passage.mediaType
    
    // Skill 1 (Nghe) only accepts mediaType 2 (Audio)
    if (skill === 1 && mediaType !== 2) {
      return false
    }
    
    // Skill 2 (Đọc) and 3 (Viết) accept mediaType 0 (Text) or 1 (Image)
    if ((skill === 2 || skill === 3) && mediaType !== 0 && mediaType !== 1) {
      return false
    }
    
    return true
  }

  const handleEdit = (questionId) => {
    const question = data.find(q => (q.questionBankId || q.id) === questionId)
    if (!question) return

    const rawOptions = question.options || question.answers || []
    const normalized = rawOptions.map((opt, idx) => {
      const optionId = opt?.optionId || opt?.id || opt?.questionOptionId || opt?.questionBankOptionId
      return {
        __tempId: optionId || `temp-${Date.now()}-${idx}`,
        optionId: optionId || null,
        keyOption: opt?.keyOption || String.fromCharCode(65 + idx),
        content: opt?.content || (typeof opt === 'string' ? opt : ''),
        imageUrl: opt?.imageUrl || opt?.imageUrl1 || '',
        imageFile: null,
        isCorrect: opt?.isCorrect === true || opt?.status === true,
      }
    })

    setEditingId(questionId)
    setEditForm({
      content: question.content || '',
      explanation: question.explanation || '',
      mediaUrl: question.mediaUrl || '',
      mediaFile: null,
      passageId: question.passageId || null,
      questionTypeId: question.questionTypeId || null,
      status: question.status !== undefined ? question.status : 1,
    })
    setEditOptions(normalized)
    setMediaObjectUrl('')
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditForm({})
    setEditOptions([])
    setSaving(false)
    setMediaObjectUrl('')
  }

  const handleAddOption = () => {
    const nextIndex = editOptions.length
    setEditOptions((prev) => [
      ...prev,
      {
        __tempId: `temp-${Date.now()}-${nextIndex}`,
        optionId: null,
        keyOption: String.fromCharCode(65 + nextIndex),
        content: '',
        imageUrl: '',
        imageFile: null,
        isCorrect: false,
      },
    ])
  }

  const handleRemoveOption = (tempId) => {
    setEditOptions((prev) => prev.filter((o) => o.__tempId !== tempId))
  }

  const handleOptionChange = (tempId, field, value) => {
    setEditOptions((prev) =>
      prev.map((o) => (o.__tempId === tempId ? { ...o, [field]: value } : o)),
    )
  }

  const handleSelectCorrect = (tempId) => {
    setEditOptions((prev) => prev.map((o) => ({ ...o, isCorrect: o.__tempId === tempId })))
  }

  const handleSave = async () => {
    const question = data.find((q) => (q.questionBankId || q.id) === editingId)
    if (!question) return

    const questionBankId = question.questionBankId || question.id

    // questionTypeId nếu không đổi thì lấy từ question hiện tại
    const finalQuestionTypeId = editForm.questionTypeId || question.questionTypeId

    // Validate passage-skill compatibility
    if (editForm.passageId && finalQuestionTypeId) {
      if (!validatePassageSkillCompatibility(editForm.passageId, finalQuestionTypeId)) {
        const passage =
          passageMap[editForm.passageId] || allPassages.find((p) => p.passageId === editForm.passageId)
        const questionType = questionTypes.find((t) => t.questionTypeId === finalQuestionTypeId)
        const skillName = ['Nghe', 'Đọc', 'Viết'][questionType?.skill - 1]
        const mediaTypeName = ['Text', 'Hình ảnh', 'Audio'][passage?.mediaType]
        message.error(`Không tương thích: Kỹ năng ${skillName} không thể dùng với đoạn văn loại ${mediaTypeName}`)
        return
      }
    }

    // Validate options
    if (!editOptions || editOptions.length < 2) {
      message.error('Cần ít nhất 2 đáp án')
      return
    }
    const hasCorrect = editOptions.some((o) => o.isCorrect)
    if (!hasCorrect) {
      message.error('Vui lòng chọn 1 đáp án đúng')
      return
    }
    const emptyContent = editOptions.some((o) => !String(o.content || '').trim())
    if (emptyContent) {
      message.error('Nội dung đáp án không được để trống')
      return
    }

    setSaving(true)
    try {
      // Upload question media only when Save
      let finalMediaUrl = editForm.mediaUrl || null
      if (editForm.mediaFile) {
        const isAudio = editForm.mediaFile?.type?.startsWith('audio/')
        finalMediaUrl = isAudio
          ? await uploadQuestionAudioToCloudinary(editForm.mediaFile)
          : await uploadQuestionImageToCloudinary(editForm.mediaFile)
      }

      const wasDraft = (question.status ?? 0) === 0
      const willBeActive = (editForm.status ?? question.status ?? 0) === 1

      // 1) Update question
      await updateQuestionBank({
        questionBankId,
        passageId: editForm.passageId || null,
        questionTypeId: finalQuestionTypeId,
        content: editForm.content,
        mediaUrl: finalMediaUrl,
        explanation: editForm.explanation || null,
      })

      // 2) Options create/update/delete
      const originalRaw = question.options || question.answers || []
      const originalIds = originalRaw
        .map((opt) => opt?.optionId || opt?.id || opt?.questionOptionId || opt?.questionBankOptionId)
        .filter(Boolean)

      const currentExistingIds = editOptions.map((o) => o.optionId).filter(Boolean)
      const toDelete = originalIds.filter((id) => !currentExistingIds.includes(id))

      const updateOrCreatePromises = editOptions.map(async (o) => {
        let finalImageUrl = o.imageUrl || null
        if (o.imageFile) {
          finalImageUrl = await uploadOptionImageToCloudinary(o.imageFile)
        }

        const payload = {
          keyOption: o.keyOption,
          content: o.content,
          imageUrl1: finalImageUrl,
          isCorrect: !!o.isCorrect,
        }

        if (o.optionId) {
          return updateQuestionBankOption(questionBankId, o.optionId, payload)
        }

        return createQuestionBankOption(questionBankId, payload)
      })

      const deletePromises = toDelete.map((optionId) => deleteQuestionBankOption(questionBankId, optionId))

      await Promise.all([...updateOrCreatePromises, ...deletePromises])

      // Nếu đổi từ Nháp -> Hoạt động thì gọi activate
      if (wasDraft && willBeActive) {
        await activateQuestionBanks([questionBankId])
      }

      message.success('Đã cập nhật câu hỏi & đáp án')

      setEditingId(null)
      setEditForm({})
      setEditOptions([])
    } catch (error) {
      message.error(error?.message || 'Cập nhật thất bại')
    } finally {
      setSaving(false)
    }
  }

  const handleTypeSelect = (type) => {
    setEditForm(prev => ({ ...prev, questionTypeId: type.questionTypeId }))
    setShowTypeSelector(false)
    
    // Validate if passage is selected
    if (editForm.passageId) {
      if (!validatePassageSkillCompatibility(editForm.passageId, type.questionTypeId)) {
        const passage = passageMap[editForm.passageId] || allPassages.find(p => p.passageId === editForm.passageId)
        const skillName = ['Nghe', 'Đọc', 'Viết'][type.skill - 1]
        const mediaTypeName = ['Text', 'Hình ảnh', 'Audio'][passage?.mediaType]
        message.warning(`Cảnh báo: Kỹ năng ${skillName} không tương thích với đoạn văn loại ${mediaTypeName}. Vui lòng chọn lại passage hoặc bộ câu hỏi.`)
      }
    }
  }

  if (loading || loadingPassage) {
    return <Spin size="large" style={{ display: 'block', marginTop: 50 }} />
  }

  if (!data || data.length === 0) {
    return <Text type="secondary">Không có câu hỏi nào phù hợp.</Text>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {data.map((question, index) => {
        const key = question.questionBankId || question.id || index
        const options = question.options || question.answers || []
        const hasOptions = Array.isArray(options) && options.length > 0
        const passage = question.passageId ? passageMap[question.passageId] : null
        const hasPassage = !!question.passageId && !!passage
        const isEditing = editingId === key
        const currentForm = isEditing ? editForm : {
          content: question.content || '',
          explanation: question.explanation || '',
          mediaUrl: question.mediaUrl || '',
          passageId: question.passageId || null,
          questionTypeId: question.questionTypeId || null,
          status: question.status !== undefined ? question.status : 1,
        }
        const currentPassage = currentForm.passageId ? (passageMap[currentForm.passageId] || allPassages.find(p => p.passageId === currentForm.passageId)) : null
        const currentQuestionType = currentForm.questionTypeId ? questionTypes.find(t => t.questionTypeId === currentForm.questionTypeId) : null

        return (
        <Card
            key={key}
            title={
              <Text>
                Câu {index + 1}
                
              </Text>
            }
          bordered={false}
          style={{
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            borderRadius: '8px',
            backgroundColor: '#fafafa',
          }}
          extra={
            <Space>
              {isEditing ? (
                <>
                  <Button type="text" icon={<SaveOutlined />} onClick={handleSave} disabled={saving} loading={saving}>
                    Lưu
                  </Button>
                  <Button type="text" icon={<CloseOutlined />} onClick={handleCancelEdit}>
                    Hủy
              </Button>
                </>
              ) : (
                <>
                  <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(key)}>
                Sửa
              </Button>
              <Popconfirm
                title="Xóa câu hỏi"
                description="Bạn có chắc chắn muốn xóa câu hỏi này?"
                  onConfirm={() => onDelete?.(key)}
                okText="Xóa"
                cancelText="Hủy"
              >
                <Button type="text" danger icon={<DeleteOutlined />}>
                  Xóa
                </Button>
              </Popconfirm>
                </>
              )}
            </Space>
          }
        >
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              {/* Change Question Type Button */}
              {isEditing && (
                <div>
                  <Button 
                    type="dashed" 
                    onClick={() => setShowTypeSelector(true)}
                    style={{ width: '100%', marginBottom: 8 }}
                  >
                    {currentQuestionType ? `Đổi bộ câu hỏi: ${currentQuestionType.name}` : 'Đổi bộ câu hỏi'}
                  </Button>
                  {currentQuestionType && (
                    <div style={{ padding: 8, backgroundColor: '#f5f5f5', borderRadius: 4, fontSize: '12px' }}>
                      <div><strong>Kỹ năng:</strong> {['Nghe', 'Đọc', 'Viết'][currentQuestionType.skill - 1]}</div>
                      <div><strong>Độ khó:</strong> {['Dễ', 'Trung bình', 'Khó'][currentQuestionType.difficulty - 1]}</div>
                    </div>
                  )}
                </div>
              )}

              {/* Passage Section */}
              {isEditing ? (
                <div style={{ marginBottom: 16 }}>
                  <Text strong style={{ display: 'block', marginBottom: 8 }}>Đoạn văn (nếu có):</Text>
                  <Select
                    style={{ width: '100%' }}
                    placeholder="Chọn đoạn văn"
                    value={currentForm.passageId}
                    onChange={(value) => {
                      setEditForm(prev => ({ ...prev, passageId: value }))
                      // Validate if questionType is selected
                      if (currentForm.questionTypeId && value) {
                        const selectedPassage = allPassages.find(p => p.passageId === value)
                        if (selectedPassage && !validatePassageSkillCompatibility(value, currentForm.questionTypeId)) {
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
              ) : hasPassage ? (
                <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                  <Text strong>Đoạn văn: {passage.title}</Text>
                  {passage.mediaType === 1 && passage.imageUrl ? (
                    <div style={{ marginTop: 8 }}>
                      <img 
                        src={passage.imageUrl} 
                        alt={passage.title} 
                        style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 4 }} 
                      />
                    </div>
                  ) : (
                    <Paragraph style={{ marginTop: 8, marginBottom: 0 }}>{passage.content}</Paragraph>
                  )}
                </div>
              ) : null}

              {/* Content */}
              {isEditing ? (
                <div>
                  <Text strong style={{ display: 'block', marginBottom: 8 }}>Nội dung câu hỏi:</Text>
                  <TextArea
                    rows={3}
                    value={currentForm.content}
                    onChange={(e) => setEditForm(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Nhập nội dung câu hỏi"
                  />
                </div>
              ) : (
              <Paragraph strong style={{ marginBottom: 4 }}>
            {question.content}
          </Paragraph>
              )}

              {/* Media URL */}
              {isEditing ? (
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
                    {mediaObjectUrl || currentForm.mediaUrl ? (
                      <p style={{ marginTop: 8, marginBottom: 0, fontSize: 12, color: '#666' }}>
                        {editForm?.mediaFile ? `File đã chọn: ${editForm.mediaFile.name}` : `Đã chọn: ${currentForm.mediaUrl}`}
                      </p>
                    ) : null}
                  </Dragger>

                  {(mediaObjectUrl || currentForm.mediaUrl) ? (
                    <div style={{ marginTop: 12 }}>
                      {isAudioUrl(mediaObjectUrl || currentForm.mediaUrl) ? (
                        <audio controls style={{ width: '100%' }}>
                          <source src={mediaObjectUrl || currentForm.mediaUrl} />
                          Trình duyệt không hỗ trợ phát audio.
                        </audio>
                      ) : (
                        <img
                          src={mediaObjectUrl || currentForm.mediaUrl}
                          alt="Preview"
                          style={{ maxWidth: '100%', maxHeight: 240, borderRadius: 8, border: '1px solid #d9d9d9' }}
                        />
                      )}
                    </div>
                  ) : null}

                  {(mediaObjectUrl || currentForm.mediaUrl) ? (
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
              ) : question.mediaUrl ? (
                question.mediaUrl.match(/\.(mp3|wav|ogg)(\?|#|$)/i) ? (
                  <audio controls style={{ width: '100%', marginTop: 4 }}>
                    <source src={question.mediaUrl} />
                    Trình duyệt không hỗ trợ phát audio.
                  </audio>
                ) : (
                  <img
                    src={question.mediaUrl}
                    alt="Question media"
                    style={{ maxWidth: '100%', maxHeight: 240, borderRadius: 8, marginTop: 8 }}
                  />
                )
              ) : null}

              {/* Explanation */}
              {isEditing ? (
                <div>
                  <Text strong style={{ display: 'block', marginBottom: 8 }}>Giải thích:</Text>
                  <TextArea
                    rows={2}
                    value={currentForm.explanation}
                    onChange={(e) => setEditForm(prev => ({ ...prev, explanation: e.target.value }))}
                    placeholder="Nhập giải thích"
                  />
                </div>
              ) : question.explanation ? (
                <Text type="secondary" style={{ display: 'block' }}>
                  {question.explanation}
                </Text>
              ) : null}

              {/* Status */}
              {isEditing ? (
                <div style={{ marginTop: 8 }}>
                  <Text strong style={{ display: 'block', marginBottom: 4 }}>Trạng thái:</Text>
                  <Switch
                    checkedChildren="Hoạt động"
                    unCheckedChildren="Nháp"
                    checked={currentForm.status === 1}
                    onChange={(checked) => setEditForm(prev => ({ ...prev, status: checked ? 1 : 0 }))}
                  />
                </div>
              ) : question.status !== undefined ? (
                <Space wrap>
                  <Tag color={question.status === 1 ? 'green' : 'default'}>
                    {question.status === 1 ? 'Hoạt động' : 'Nháp'}
                  </Tag>
                </Space>
              ) : null}
            </Space>

            {isEditing ? (
              <div style={{ marginTop: 12 }}>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>Đáp án:</Text>

                {editOptions.map((opt, idx) => {
                  const isCorrect = !!opt.isCorrect
                  return (
                    <div
                      key={opt.__tempId}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '44px 1fr 1fr 40px',
                        gap: 8,
                        alignItems: 'center',
                        padding: 10,
                        borderRadius: 8,
                        border: `1px solid ${isCorrect ? '#52c41a' : '#d9d9d9'}`,
                        backgroundColor: isCorrect ? '#f6ffed' : '#fff',
                        marginBottom: 8,
                      }}
                    >
                      <Checkbox
                        checked={isCorrect}
                        onChange={() => handleSelectCorrect(opt.__tempId)}
                        style={{ justifySelf: 'center' }}
                      >
                        {String.fromCharCode(65 + idx)}
                      </Checkbox>

                      <Input
                        value={opt.content}
                        onChange={(e) => handleOptionChange(opt.__tempId, 'content', e.target.value)}
                        placeholder={`Nội dung đáp án ${String.fromCharCode(65 + idx)}`}
                      />

                      <div>
                        <Dragger
                          name="file"
                          multiple={false}
                          showUploadList={false}
                          accept="image/*"
                          beforeUpload={(file) => {
                            const isImage = file.type.startsWith('image/')
                            if (!isImage) {
                              message.error('Chỉ chấp nhận file hình ảnh!')
                              return Upload.LIST_IGNORE
                            }
                            handleOptionChange(opt.__tempId, 'imageFile', file)
                            return false
                          }}
                          style={{ padding: '8px 0' }}
                        >
                          <p className="ant-upload-drag-icon" style={{ margin: 0 }}>
                            <InboxOutlined style={{ fontSize: 22 }} />
                          </p>
                          <p className="ant-upload-text" style={{ margin: 0, fontSize: 12 }}>
                            Tải ảnh (tùy chọn)
                          </p>
                          {opt.imageFile || opt.imageUrl ? (
                            <p style={{ marginTop: 6, marginBottom: 0, fontSize: 11, color: '#666' }}>
                              {opt.imageFile ? `File đã chọn: ${opt.imageFile.name}` : 'Đã chọn'}
                            </p>
                          ) : null}
                        </Dragger>
                        {(opt.imageFile || opt.imageUrl) ? (
                          <Button
                            type="link"
                            danger
                            onClick={() => {
                              handleOptionChange(opt.__tempId, 'imageUrl', '')
                              handleOptionChange(opt.__tempId, 'imageFile', null)
                            }}
                            style={{ paddingLeft: 0 }}
                          >
                            Xóa ảnh
                          </Button>
                        ) : null}

                        {(opt.imageFile || opt.imageUrl) ? (
                          <div style={{ marginTop: 8 }}>
                            <img
                              src={opt.imageFile ? createObjectUrl(opt.imageFile) : opt.imageUrl}
                              alt="Preview"
                              style={{ maxWidth: '100%', maxHeight: 140, borderRadius: 6, border: '1px solid #d9d9d9' }}
                            />
                          </div>
                        ) : null}
                      </div>

                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemoveOption(opt.__tempId)}
                        disabled={editOptions.length <= 2}
                      />
                    </div>
                  )
                })}

                <Button
                  type="dashed"
                  block
                  icon={<PlusOutlined />}
                  onClick={handleAddOption}
                  style={{ marginTop: 8 }}
                >
                  Thêm đáp án
                </Button>
              </div>
            ) : hasOptions ? (
              <Row gutter={[16, 16]} style={{ marginTop: 12 }}>
                {options.map((option, ansIndex) => {
                  const isCorrect = option.status === true || option.isCorrect === true
                  return (
              <Col span={12} key={ansIndex}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '8px 12px',
                    borderRadius: '6px',
                          border: `1px solid ${isCorrect ? '#52c41a' : '#d9d9d9'}`,
                          backgroundColor: isCorrect ? '#f6ffed' : '#fff',
                  }}
                >
                        <Tag color={isCorrect ? 'success' : 'default'} style={{ marginRight: 10 }}>
                    {String.fromCharCode(65 + ansIndex)}
                  </Tag>
                        <Text>{option.content || option}</Text>
                        {option.imageUrl || option.imageUrl1 ? (
                          <img
                            src={option.imageUrl || option.imageUrl1}
                            alt="Option"
                            style={{ maxWidth: 80, maxHeight: 80, marginLeft: 8, borderRadius: 6 }}
                          />
                        ) : null}
                </div>
              </Col>
                  )
                })}
          </Row>
            ) : null}
        </Card>
        )
      })}

      {/* Question Type Selector Modal */}
      <Modal
        title="Chọn bộ câu hỏi"
        open={showTypeSelector}
        onCancel={() => setShowTypeSelector(false)}
        footer={null}
        width={800}
      >
        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
          {loadingTypes ? (
            <div style={{ textAlign: 'center', padding: 20 }}>Đang tải...</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16 }}>
              {questionTypes.map((type) => {
                const isSelected = editForm?.questionTypeId === type.questionTypeId
                const isCompatible = !editForm?.passageId || validatePassageSkillCompatibility(editForm.passageId, type.questionTypeId)
                
                return (
                  <div 
                    key={type.questionTypeId}
                    onClick={() => handleTypeSelect(type)}
                    style={{
                      border: `1px solid ${isSelected ? '#1890ff' : (!isCompatible ? '#ff4d4f' : '#d9d9d9')}`,
                      borderRadius: 4,
                      padding: 12,
                      cursor: 'pointer',
                      backgroundColor: isSelected ? '#e6f7ff' : (!isCompatible ? '#fff1f0' : '#fff'),
                      transition: 'all 0.3s',
                      opacity: !isCompatible ? 0.7 : 1,
                    }}
                  >
                    <div><strong>{type.name}</strong></div>
                    <div>Kỹ năng: {['Nghe', 'Đọc', 'Viết'][type.skill - 1]}</div>
                    <div>Độ khó: {['Dễ', 'Trung bình', 'Khó'][type.difficulty - 1]}</div>
                    <div>Mã: {type.code}</div>
                    {!isCompatible && editForm.passageId && (
                      <div style={{ color: '#ff4d4f', fontSize: '11px', marginTop: 4 }}>
                        ⚠️ Không tương thích với passage đã chọn
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}

