'use client'
import React, { useState, useEffect } from 'react'
import { Modal, Form, Space, Button, message, Spin, Divider, Typography } from 'antd'
const { Title } = Typography
import { fetchPassages, fetchQuestionTypes, updateQuestionBank, activateQuestionBanks } from '../../../api/question-bank-management.js'
import { uploadOptionImageToCloudinary, uploadQuestionAudioToCloudinary, uploadQuestionImageToCloudinary } from '../../../../back-office/api/cloudinary.js'
import { QuestionEditForm } from './QuestionEditForm'
import { OptionsEditor } from './OptionsEditor'
import { QuestionTypeSelectorModal } from './QuestionTypeSelectorModal'

const QUESTION_BANK_STATUS = {
  DRAFT: 0,
  ACTIVE: 1,
  DELETED: 2,
  PENDING_APPROVAL: 3,
  REJECTED: 4,
  ASSIGNED: 5,
}

import { Tabs } from 'antd'

export function QuestionUpdateModal({ open, question, onCancel, onUpdated }) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('1')
  
  const [editForm, setEditForm] = useState({})
  const [editOptions, setEditOptions] = useState([])
  const [allPassages, setAllPassages] = useState([])
  const [questionTypes, setQuestionTypes] = useState([])
  const [showTypeSelector, setShowTypeSelector] = useState(false)
  const [loadingPassages, setLoadingPassages] = useState(false)
  const [loadingTypes, setLoadingTypes] = useState(false)
  const [mediaObjectUrl, setMediaObjectUrl] = useState('')

  useEffect(() => {
    if (open && question) {
      const rawOptions = question.options || question.answers || []
      const normalized = rawOptions.map((opt, idx) => {
        const optionId = opt?.optionId || opt?.id || opt?.questionOptionId || opt?.questionBankOptionId
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
      setActiveTab('1')
      
      loadInitialData()
    }
  }, [open, question])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      const [passages, types] = await Promise.all([
        fetchPassages(),
        fetchQuestionTypes()
      ])
      setAllPassages(passages)
      setQuestionTypes(types)
    } catch (error) {
      message.error('Không thể tải dữ liệu bổ trợ')
    } finally {
      setLoading(false)
    }
  }

  const validatePassageSkillCompatibility = (passageId, questionTypeId) => {
    if (!passageId || !questionTypeId) return true
    const passage = allPassages.find(p => p.passageId === passageId)
    const questionType = questionTypes.find(t => t.questionTypeId === questionTypeId)
    if (!passage || !questionType) return true
    const skill = questionType.skill
    const mediaType = passage.mediaType
    if (skill === 1 && mediaType !== 2) return false
    if ((skill === 2 || skill === 3) && mediaType !== 0 && mediaType !== 1) return false
    return true
  }

  const handleSave = async () => {
    const questionBankId = question.questionBankId || question.id
    const currentStatus = question.status ?? QUESTION_BANK_STATUS.DRAFT
    const finalQuestionTypeId = editForm.questionTypeId || question.questionTypeId

    const newQuestionType = questionTypes.find(t => t.questionTypeId === finalQuestionTypeId)
    const newSkill = newQuestionType?.skill

    if (!validatePassageSkillCompatibility(editForm.passageId, finalQuestionTypeId)) {
        message.error('Kỹ năng không tương thích với loại đoạn văn')
        return
    }

    setSaving(true)
    try {
      let finalMediaUrl = editForm.mediaUrl
      if (editForm.mediaFile) {
        const isAudio = editForm.mediaFile?.type?.startsWith('audio/')
        finalMediaUrl = isAudio
          ? await uploadQuestionAudioToCloudinary(editForm.mediaFile)
          : await uploadQuestionImageToCloudinary(editForm.mediaFile)
      }

      const patchPayload = {
        questionBankId,
        questionTypeId: finalQuestionTypeId,
        content: editForm.content || '',
        explanation: editForm.explanation || '',
        mediaUrl: finalMediaUrl || '',
        passageId: editForm.passageId === '' ? '' : (editForm.passageId || null),
      }

      const optionsToSend = []
      if (editOptions && editOptions.length > 0) {
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

      if (newSkill === 3) patchPayload.options = []
      else patchPayload.options = optionsToSend

      await updateQuestionBank(patchPayload)

      if (currentStatus === QUESTION_BANK_STATUS.DRAFT && editForm.status === 1) {
        await activateQuestionBanks([questionBankId])
      }

      message.success('Cập nhật thành công')
      if (onUpdated) onUpdated()
    } catch (error) {
      message.error(error?.message || 'Cập nhật thất bại')
    } finally {
      setSaving(false)
    }
  }

  const tabItems = [
    {
      key: '1',
      label: <span style={{ fontWeight: 600 }}>1. Nội dung câu hỏi</span>,
      children: (
        <div style={{ marginTop: 8 }}>
          <QuestionEditForm
            editForm={editForm}
            setEditForm={setEditForm}
            mediaObjectUrl={mediaObjectUrl}
            setMediaObjectUrl={setMediaObjectUrl}
            allPassages={allPassages}
            loadingPassages={loadingPassages}
            currentPassage={editForm.passageId ? allPassages.find(p => p.passageId === editForm.passageId) : null}
            currentQuestionType={editForm.questionTypeId ? questionTypes.find(t => t.questionTypeId === editForm.questionTypeId) : null}
            validatePassageSkillCompatibility={validatePassageSkillCompatibility}
            onOpenTypeSelector={() => setShowTypeSelector(true)}
          />
        </div>
      )
    },
    {
      key: '2',
      label: <span style={{ fontWeight: 600 }}>2. Đáp án</span>,
      children: (
        <div style={{ marginTop: 8 }}>
          <OptionsEditor
            options={editOptions}
            onAddOption={() => setEditOptions(prev => [...prev, { __tempId: `temp-${Date.now()}`, keyOption: String(prev.length + 1), content: '', isCorrect: false }])}
            onRemoveOption={(id) => setEditOptions(prev => prev.filter(o => o.__tempId !== id))}
            onOptionChange={(id, f, v) => setEditOptions(prev => prev.map(o => o.__tempId === id ? { ...o, [f]: v } : o))}
            onSelectCorrect={(id) => setEditOptions(prev => prev.map(o => ({ ...o, isCorrect: o.__tempId === id })))}
          />
        </div>
      )
    }
  ]

  return (
    <Modal
      title={
        <div style={{ padding: '8px 0' }}>
          <Title level={4} style={{ margin: 0 }}>Chỉnh sửa câu hỏi</Title>
          <div style={{ fontSize: 13, color: '#8c8c8c', fontWeight: 400 }}>Cập nhật thông tin và đáp án của câu hỏi</div>
        </div>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      width={900}
      centered
      destroyOnHidden
      styles={{
        body: { padding: '4px 24px 12px' }
      }}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>
      ) : (
        <div>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            style={{ marginBottom: 12 }}
          />
          
          <Divider style={{ margin: '8px 0 16px' }} />

          <div style={{ textAlign: 'right' }}>
            <Space size="middle">
              <Button onClick={onCancel}>
                Hủy
              </Button>
              <Button
                type="primary"
                onClick={handleSave}
                loading={saving}
              >
                Lưu thay đổi
              </Button>
            </Space>
          </div>

          <QuestionTypeSelectorModal
            open={showTypeSelector}
            onCancel={() => setShowTypeSelector(false)}
            questionTypes={questionTypes}
            loadingTypes={loadingTypes}
            editForm={editForm}
            validatePassageSkillCompatibility={validatePassageSkillCompatibility}
            onSelect={(type) => {
              setEditForm(prev => ({ ...prev, questionTypeId: type.questionTypeId }))
              setShowTypeSelector(false)
            }}
          />
        </div>
      )}
    </Modal>
  )
}

