'use client'

import React, { useEffect, useState } from 'react'
import { Typography, Spin, message, Pagination } from 'antd'
import { fetchPassageById, fetchPassages, fetchQuestionTypes, updateQuestionBank, activateQuestionBanks, deleteQuestionBank } from '../../../api/question-bank-management'
import { uploadOptionImageToCloudinary, uploadQuestionAudioToCloudinary, uploadQuestionImageToCloudinary } from '../../../../admin/api/cloudinary'
import { showAdminSuccess, showAdminError } from 'components/HelperAdmin'
import { QuestionCard } from './QuestionCard'
import { QuestionTypeSelectorModal } from './QuestionTypeSelectorModal'

const { Text } = Typography

/**
 * QuestionCardList Component
 * Hiển thị danh sách câu hỏi dưới dạng các card, mỗi card là một câu hỏi và các đáp án.
 * Nếu câu hỏi có passageId thì hiển thị passageTitle trong title.
 */
export function QuestionCardList({
  data,
  loading,
  onEdit,
  onDelete,
  onDeleted,
  onRefresh,
  pagination,
}) {
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
  const [deletingId, setDeletingId] = useState(null)

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
    
    // Skill 1 (Listening) only accepts mediaType 2 (Audio)
    if (skill === 1 && mediaType !== 2) {
      return false
    }
    
    // Skill 2 (Reading) and 3 (Writing) accept mediaType 0 (Text) or 1 (Image)
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
      // Convert keyOption to "1", "2", "3", "4" format if it's A, B, C, D
      let keyOption = opt?.keyOption || String(idx + 1)
      if (keyOption.length === 1 && keyOption >= 'A' && keyOption <= 'Z') {
        keyOption = String(keyOption.charCodeAt(0) - 64)
      }
      return {
        __tempId: optionId || `temp-${Date.now()}-${idx}`,
        optionId: optionId || null,
        keyOption: keyOption,
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
        keyOption: String(nextIndex + 1), // "1", "2", "3", "4"
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

  const handleDeleteQuestion = async (questionId) => {
    const question = data.find((q) => (q.questionBankId || q.id) === questionId)
    if (!question) return

    const questionBankId = question.questionBankId || question.id

    try {
      setDeletingId(questionId)
      await deleteQuestionBank(questionBankId)
      showAdminSuccess('Đã xóa câu hỏi thành công')
      if (onDeleted) {
        onRefresh ? onRefresh() : onDeleted?.(questionId)
      }
    } catch (error) {
      showAdminError(error?.message || 'Xóa câu hỏi thất bại')
    } finally {
      setDeletingId(null)
    }
  }

  const handleSave = async () => {
    const question = data.find((q) => (q.questionBankId || q.id) === editingId)
    if (!question) return

    const questionBankId = question.questionBankId || question.id
    const oldQuestionTypeId = question.questionTypeId
    const finalQuestionTypeId = editForm.questionTypeId || oldQuestionTypeId

    // Get old and new skill
    const oldQuestionType = questionTypes.find(t => t.questionTypeId === oldQuestionTypeId)
    const newQuestionType = questionTypes.find(t => t.questionTypeId === finalQuestionTypeId)
    const oldSkill = oldQuestionType?.skill
    const newSkill = newQuestionType?.skill

    // Validate passage-skill compatibility
    if (editForm.passageId !== undefined && editForm.passageId !== null && editForm.passageId !== '' && finalQuestionTypeId) {
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

    // Prepare final values for PATCH
    let finalMediaUrl = editForm.mediaUrl
    if (editForm.mediaFile) {
      const isAudio = editForm.mediaFile?.type?.startsWith('audio/')
      finalMediaUrl = isAudio
        ? await uploadQuestionAudioToCloudinary(editForm.mediaFile)
        : await uploadQuestionImageToCloudinary(editForm.mediaFile)
    }

    // Determine what to send for PATCH (only fields with "intent to update")
    const patchPayload = {
      questionBankId,
    }

    // Handle QuestionTypeId (string field)
    if (editForm.questionTypeId !== undefined && editForm.questionTypeId !== null) {
      patchPayload.questionTypeId = editForm.questionTypeId
    }

    // Handle Content (string field: null = no update, "" = update to empty, value = update)
    if (editForm.content !== undefined) {
      patchPayload.content = editForm.content === null ? null : (editForm.content || '')
    }

    // Handle Explanation (string field)
    if (editForm.explanation !== undefined) {
      patchPayload.explanation = editForm.explanation === null ? null : (editForm.explanation || '')
    }

    // Handle MediaUrl (string field)
    if (editForm.mediaFile !== undefined || editForm.mediaUrl !== undefined) {
      patchPayload.mediaUrl = finalMediaUrl === null ? null : (finalMediaUrl || '')
    }

    // Handle PassageId (special: null = no update, "" = remove passage, value = update)
    if (editForm.passageId !== undefined) {
      if (editForm.passageId === null) {
        // Don't include in payload (no update)
      } else if (editForm.passageId === '') {
        patchPayload.passageId = '' // Remove passage
      } else {
        patchPayload.passageId = editForm.passageId
      }
    }

    // Handle Options (array: not sent = no update, null = no update, [] = delete all, [items] = replace-all)
    // Always send options when editing (replace-all)
    const optionsToSend = []
    
    // Validate options before sending
    if (editOptions && editOptions.length > 0) {
      // Validate: 2-4 options
      if (editOptions.length < 2 || editOptions.length > 4) {
        message.error('Cần từ 2 đến 4 đáp án')
        return
      }

      // Validate: keyOption must be "1", "2", "3", "4" and unique
      const keyOptions = editOptions.map(o => o.keyOption)
      const validKeys = ['1', '2', '3', '4']
      const invalidKeys = keyOptions.filter(k => !validKeys.includes(k))
      if (invalidKeys.length > 0) {
        message.error('keyOption phải là "1", "2", "3", hoặc "4"')
        return
      }
      const uniqueKeys = new Set(keyOptions)
      if (uniqueKeys.size !== keyOptions.length) {
        message.error('keyOption không được trùng lặp')
        return
      }

      // Validate: each option must have content or imageUrl
      const invalidOptions = editOptions.filter(o => !o.content?.trim() && !o.imageUrl?.trim())
      if (invalidOptions.length > 0) {
        message.error('Mỗi đáp án phải có nội dung hoặc hình ảnh')
        return
      }

      // Validate: exactly 1 correct answer
      const correctCount = editOptions.filter(o => o.isCorrect).length
      if (correctCount !== 1) {
        message.error('Phải có đúng 1 đáp án đúng')
        return
      }

      // Prepare options payload
      for (const opt of editOptions) {
        let finalImageUrl = opt.imageUrl || ''
        if (opt.imageFile) {
          finalImageUrl = await uploadOptionImageToCloudinary(opt.imageFile) || ''
        }

        optionsToSend.push({
          keyOption: opt.keyOption,
          content: opt.content || '',
          imageUrl: finalImageUrl,
          isCorrect: !!opt.isCorrect,
        })
      }
    }

    // Validate according to final Skill
    if (newSkill === 3) {
      // Writing: không được có options
      if (optionsToSend.length > 0) {
        message.error('Kỹ năng Viết không được có đáp án')
        return
      }
      patchPayload.options = []
    } else if (newSkill === 1) {
      // Listening: bắt buộc MediaUrl
      const finalMedia = patchPayload.mediaUrl || finalMediaUrl
      if (!finalMedia || !finalMedia.trim()) {
        message.error('Kỹ năng Nghe bắt buộc phải có MediaUrl')
        return
      }
      if (optionsToSend.length > 0) {
        patchPayload.options = optionsToSend
      }
    } else if (newSkill === 2) {
      // Reading: bắt buộc Content
      const finalContent = patchPayload.content !== undefined ? patchPayload.content : editForm.content
      if (!finalContent || !finalContent.trim()) {
        message.error('Kỹ năng Đọc bắt buộc phải có Content')
        return
      }
      if (optionsToSend.length > 0) {
        patchPayload.options = optionsToSend
      }
    } else {
      // Unknown skill, allow options
      if (optionsToSend.length > 0) {
        patchPayload.options = optionsToSend
      }
    }

    // Validate when changing Skill
    if (oldSkill && newSkill && oldSkill !== newSkill) {
      // Reading → Listening
      if (oldSkill === 2 && newSkill === 1) {
        const finalMedia = patchPayload.mediaUrl || finalMediaUrl
        if (!finalMedia || !finalMedia.trim()) {
          message.error('Khi đổi từ Đọc sang Nghe, bắt buộc phải có MediaUrl')
          return
        }
      }
      // Writing → Listening
      if (oldSkill === 3 && newSkill === 1) {
        const finalMedia = patchPayload.mediaUrl || finalMediaUrl
        if (!finalMedia || !finalMedia.trim()) {
          message.error('Khi đổi từ Viết sang Nghe, bắt buộc phải có MediaUrl')
          return
        }
      }
      // Writing → Reading
      if (oldSkill === 3 && newSkill === 2) {
        const finalContent = patchPayload.content !== undefined ? patchPayload.content : editForm.content
        if (!finalContent || !finalContent.trim()) {
          message.error('Khi đổi từ Viết sang Đọc, bắt buộc phải có Content')
          return
        }
      }
      // Reading → Writing
      if (oldSkill === 2 && newSkill === 3) {
        if (optionsToSend.length > 0) {
          message.error('Khi đổi từ Đọc sang Viết, phải xóa toàn bộ đáp án (gửi options: [])')
          return
        }
        patchPayload.options = []
      }
      // Listening → Reading
      if (oldSkill === 1 && newSkill === 2) {
        const finalContent = patchPayload.content !== undefined ? patchPayload.content : editForm.content
        if (!finalContent || !finalContent.trim()) {
          message.error('Khi đổi từ Nghe sang Đọc, bắt buộc phải có Content')
          return
        }
        if (optionsToSend.length > 0) {
          message.error('Khi đổi từ Nghe sang Đọc, phải xóa toàn bộ đáp án (gửi options: [])')
          return
        }
        patchPayload.options = []
      }
    }

    setSaving(true)
    try {
      const wasDraft = (question.status ?? 0) === 0
      const willBeActive = (editForm.status ?? question.status ?? 0) === 1

      // Update question with PATCH payload
      await updateQuestionBank(patchPayload)

      // Nếu đổi từ Nháp -> Hoạt động thì gọi activate
      if (wasDraft && willBeActive) {
        await activateQuestionBanks([questionBankId])
      }

      message.success('Đã cập nhật câu hỏi & đáp án')

      setEditingId(null)
      setEditForm({})
      setEditOptions([])

      if (onRefresh) {
        onRefresh()
      }
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
        const passage = question.passageId ? passageMap[question.passageId] : null
        const isEditing = editingId === key
        const currentPassage = editForm.passageId ? (passageMap[editForm.passageId] || allPassages.find(p => p.passageId === editForm.passageId)) : null
        const currentQuestionType = editForm.questionTypeId ? questionTypes.find(t => t.questionTypeId === editForm.questionTypeId) : null

        return (
          <QuestionCard
            key={key}
            question={question}
            index={index}
            isEditing={isEditing}
            editingId={editingId}
            saving={saving}
            deletingId={deletingId}
            editForm={editForm}
            setEditForm={setEditForm}
            editOptions={editOptions}
            mediaObjectUrl={mediaObjectUrl}
            setMediaObjectUrl={setMediaObjectUrl}
            passage={passage}
            allPassages={allPassages}
            loadingPassages={loadingPassages}
            currentPassage={currentPassage}
            currentQuestionType={currentQuestionType}
            validatePassageSkillCompatibility={validatePassageSkillCompatibility}
            onEdit={handleEdit}
            onCancelEdit={handleCancelEdit}
            onSave={handleSave}
            onDeleteQuestion={handleDeleteQuestion}
            onAddOption={handleAddOption}
            onRemoveOption={handleRemoveOption}
            onOptionChange={handleOptionChange}
            onSelectCorrect={handleSelectCorrect}
            onOpenTypeSelector={() => setShowTypeSelector(true)}
          />
        )
      })}

      <QuestionTypeSelectorModal
        open={showTypeSelector}
        onCancel={() => setShowTypeSelector(false)}
        questionTypes={questionTypes}
        loadingTypes={loadingTypes}
        editForm={editForm}
        validatePassageSkillCompatibility={validatePassageSkillCompatibility}
        onSelect={handleTypeSelect}
      />

      {pagination?.total > pagination?.pageSize ? (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
          <Pagination
            current={pagination.current}
            pageSize={pagination.pageSize}
            total={pagination.total}
            showSizeChanger={false}
            onChange={(page) => pagination.onChange?.(page)}
          />
        </div>
      ) : null}
    </div>
  )
}
