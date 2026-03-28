import React, { useState, useEffect } from 'react'
import {
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Typography,
  message,
  Button,
  Card,
  Modal,
  Upload,
  Tabs,
  Tag,
  Tooltip,
  Table,
  Row,
  Col,
} from 'antd'
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  InboxOutlined,
  MenuOutlined
} from '@ant-design/icons'
import { fetchQuestionTypes, updateExamTemplateParts, uploadTemplatePartImageToCloudinary, updateTemplatePart } from '../../../../back-office/api/admin-index.js'

const { Title, Text } = Typography
const { TextArea } = Input

const MAX_PARTS = 3

// Component riêng cho Image Upload để tránh lỗi Form.Item với render function
// Logic tương tự VocabularyEditModal: preview ngay khi chọn, upload khi submit
const ImageUploadField = ({ value, onChange }) => {
  // State để lưu preview URL (giống VocabularyEditModal)
  const [previewUrl, setPreviewUrl] = React.useState(null)
  const [selectedFile, setSelectedFile] = React.useState(null)

  // Sync previewUrl từ value khi value thay đổi (từ database hoặc từ form)
  React.useEffect(() => {
    // Nếu value là string URL (từ database, chưa được normalize)
    if (value && typeof value === 'string') {
      setPreviewUrl(value)
      setSelectedFile(null)
      return
    }

    // Nếu value là array (fileList)
    if (value && Array.isArray(value) && value.length > 0) {
      const fileItem = value[0]
      // Nếu có URL (từ database hoặc base64 từ file mới)
      if (fileItem?.url) {
        setPreviewUrl(fileItem.url)
      }
      // Nếu có originFileObj (file mới được chọn)
      if (fileItem?.originFileObj) {
        setSelectedFile(fileItem.originFileObj)
      }
    } else {
      // Nếu value rỗng, reset preview
      setPreviewUrl(null)
      setSelectedFile(null)
    }
  }, [value])

  const beforeUpload = (file) => {
    // Kiểm tra loại file
    const isImage = file.type.startsWith('image/')
    if (!isImage) {
      message.error('Chỉ chấp nhận file ảnh!')
      return false
    }

    // Kiểm tra kích thước file (tối đa 5MB)
    const isLt5M = file.size / 1024 / 1024 < 5
    if (!isLt5M) {
      message.error('Ảnh phải nhỏ hơn 5MB!')
      return false
    }

    // Lưu file để upload sau
    setSelectedFile(file)

    // Đọc file để hiển thị preview trước (không upload ngay)
    const reader = new FileReader()

    reader.onload = (e) => {
      const previewUrl = e.target?.result

      // Set preview URL để hiển thị ngay
      setPreviewUrl(previewUrl)

      // Tạo fileList để lưu vào form (giữ originFileObj để upload sau)
      const previewFileList = [{
        uid: file.uid || `-${Date.now()}`,
        name: file.name,
        status: 'done',
        url: previewUrl, // Preview từ FileReader (base64)
        thumbUrl: previewUrl,
        originFileObj: file // Lưu file object để upload sau khi submit - QUAN TRỌNG
      }]

      // Gọi onChange để cập nhật form value
      onChange(previewFileList)
      message.success('Đã chọn ảnh. Ảnh sẽ được upload khi bạn bấm "Lưu thay đổi"')
    }

    reader.onerror = () => {
      message.error('Không thể đọc file ảnh')
      setPreviewUrl(null)
      setSelectedFile(null)
      onChange([])
    }

    // Đọc file dưới dạng Data URL để preview
    reader.readAsDataURL(file)

    return false // Prevent auto upload
  }

  const handleRemove = () => {
    setPreviewUrl(null)
    setSelectedFile(null)
    onChange([])
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Upload.Dragger
        name="file"
        multiple={false}
        showUploadList={false}
        beforeUpload={beforeUpload}
        accept="image/*"
        style={{ fontSize: 13, padding: 8 }}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined style={{ fontSize: 24, color: '#1890ff' }} />
        </p>
        <p className="ant-upload-text" style={{ fontSize: 14 }}>
          Click hoặc kéo thả ảnh vào đây để upload
        </p>
        <p className="ant-upload-hint" style={{ fontSize: 14, color: '#999' }}>
          Hỗ trợ upload ảnh (JPG, PNG, GIF, etc.). Ảnh sẽ được upload khi bạn bấm "Lưu thay đổi"
        </p>
      </Upload.Dragger>
      {previewUrl ? (
        <div style={{
          border: '1px solid #f0f0f0',
          borderRadius: 6,
          padding: 8,
          textAlign: 'center',
          position: 'relative',
          backgroundColor: '#fafafa'
        }}>
          <img
            src={previewUrl}
            alt="Preview"
            style={{
              maxWidth: '100%',
              maxHeight: 200,
              objectFit: 'contain',
              display: 'block',
              margin: '0 auto'
            }}
            onError={(e) => {
              console.error('Error loading preview image:', previewUrl)
              e.target.style.display = 'none'
            }}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={handleRemove}
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              fontSize: 12
            }}
            size="small"
          >
            Xóa
          </Button>
        </div>
      ) : null}
    </div>
  )
}

// Skill mapping theo enum QuestionSkill
const skillOptions = [
  { value: 1, label: 'Nghe' },      // Listening = 1
  { value: 3, label: 'Viết' },      // Writing = 3
  { value: 2, label: 'Đọc' },       // Reading = 2
]

// Thứ tự sắp xếp kỹ năng: Nghe (1) -> Viết (3) -> Đọc (2)
const skillSortOrder = {
  1: 1, // Nghe
  3: 2, // Viết
  2: 3  // Đọc
}

const sortPartsBySkill = (parts) => {
  if (!parts || !Array.isArray(parts)) return []
  return [...parts].sort((a, b) => {
    const orderA = skillSortOrder[a.Skill] || 99
    const orderB = skillSortOrder[b.Skill] || 99
    return orderA - orderB
  })
}

// Helper function để lấy label của skill
export const getSkillLabel = (skill) => {
  const option = skillOptions.find(opt => opt.value === skill)
  return option?.label || `Skill ${skill}`
}

export default function ExamTemplatePartsForm({ examTemplateId, initialParts = [], examTemplate = null, onPartsAdded, onDirtyChange }) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [activePartIndex, setActivePartIndex] = useState(0)
  const [addPartModalOpen, setAddPartModalOpen] = useState(false)
  const [selectedSkillForNewPart, setSelectedSkillForNewPart] = useState(null)
  const [editingGroup, setEditingGroup] = useState(null) // { partName, groupName, groupIndex, groupKey, skill }
  const [initialGroupValues, setInitialGroupValues] = useState(null) // Lưu giá trị ban đầu để Hủy
  const [modifiedGroups, setModifiedGroups] = useState(new Set()) // Track các bộ câu đã được chỉnh sửa ('partIdx-groupIdx')

  const addPartRef = React.useRef(null) // Ref để lưu hàm add từ Form.List
  const partsCountRef = React.useRef(0) // Ref để lưu số lượng phần hiện tại
  const loadedSkillsRef = React.useRef(new Set()) // Ref để track các skill đã load

  // State để lưu questionTypes theo skill
  const [questionTypesBySkill, setQuestionTypesBySkill] = useState({})
  const [loadingQuestionTypes, setLoadingQuestionTypes] = useState({})

  // Lấy examType từ examTemplate (1 = TOPIK I, 2 = TOPIK II)
  const examType = examTemplate?.type ||
    (examTemplate?.examType === 'TOPIK I' ? 1 :
      examTemplate?.examType === 'TOPIK II' ? 2 : null) || null

  // Template đã xuất bản (status = 1) thì chỉ cho xem, không cho chỉnh sửa
  const isActiveTemplate = examTemplate?.status === 1

  // Function để fetch question types theo skill
  const loadQuestionTypes = React.useCallback(async (skill) => {
    if (!skill || !examType) return

    // Nếu đã load rồi thì không load lại
    if (loadedSkillsRef.current.has(skill)) return

    try {
      loadedSkillsRef.current.add(skill)
      setLoadingQuestionTypes(prev => ({ ...prev, [skill]: true }))

      const types = await fetchQuestionTypes({ skill, examType })
      setQuestionTypesBySkill(prev => ({ ...prev, [skill]: types || [] }))
    } catch (error) {
      console.error('Error loading question types:', error)
      loadedSkillsRef.current.delete(skill) // Cho phép retry
      setQuestionTypesBySkill(prev => ({ ...prev, [skill]: [] }))
    } finally {
      setLoadingQuestionTypes(prev => ({ ...prev, [skill]: false }))
    }
  }, [examType])

  // Watch skill changes trong form để tự động load question types
  const watchParts = Form.useWatch('parts', form)

  useEffect(() => {
    if (!examType || !watchParts || !Array.isArray(watchParts)) return

    // Sử dụng requestAnimationFrame và setTimeout để đảm bảo không gọi setState trong quá trình render
    const rafId = requestAnimationFrame(() => {
      // Sử dụng setTimeout để đảm bảo chạy sau khi render hoàn tất
      setTimeout(() => {
        watchParts.forEach((part) => {
          if (part?.Skill && !loadedSkillsRef.current.has(part.Skill)) {
            // Kiểm tra xem có cần load không (chưa có trong state và không đang load)
            const types = questionTypesBySkill[part.Skill] || []
            if (types.length === 0 && !loadingQuestionTypes[part.Skill]) {
              loadQuestionTypes(part.Skill)
            }
          }
        })
      }, 0)
    })

    return () => cancelAnimationFrame(rafId)
  }, [watchParts, examType, loadQuestionTypes, questionTypesBySkill, loadingQuestionTypes])

  // Khi initialParts thay đổi (từ server), cập nhật form
  useEffect(() => {
    if (initialParts && Array.isArray(initialParts)) {
      // Sắp xếp theo Skill: Nghe (1) -> Viết (3) -> Đọc (2)
      const sortedParts = sortPartsBySkill(initialParts)
      form.setFieldsValue({ parts: sortedParts })
    } else {
      form.setFieldsValue({ parts: [] })
    }
  }, [initialParts, form])

  // Cập nhật dirty state cho component cha
  useEffect(() => {
    if (onDirtyChange) {
      const parts = form.getFieldValue('parts') || []
      const hasNewGroup = parts.some(part =>
        (part.QuestionGroups || []).some(group => !group.TemplatePartId)
      )
      const isDirty = hasNewGroup || modifiedGroups.size > 0
      onDirtyChange(isDirty)
    }
  }, [modifiedGroups, onDirtyChange, watchParts])


  const handleSubmit = async (values) => {
    try {
      setLoading(true)

      // Kiểm tra trạng thái - chỉ cho phép add/update khi status = 0 (Nháp)
      const currentStatus = examTemplate?.status ?? 0
      if (currentStatus !== 0) {
        message.error('Chỉ có thể thêm hoặc cập nhật parts khi mẫu đề ở trạng thái Nháp')
        return
      }

      // Lấy giá trị thực tế từ form để đảm bảo có originFileObj
      // Sử dụng getFieldsValue(true) để lấy tất cả giá trị bao gồm cả các field không được touched
      const formValues = form.getFieldsValue(true)
      const actualParts = formValues.parts || values.parts || []

      // Format data để gửi lên API theo schema TemplateParts
      // Chỉ lấy các parts mới (không có TemplatePartId) để add thêm
      // Mỗi phần (Part) có Skill, và trong phần đó có nhiều TemplateParts (QuestionGroups)
      // Mỗi TemplatePart cần có: Skill (từ Part cha hoặc từ chính nó), QuestionFrom, QuestionTo, PartTitle, Instruction, Mark, ExampleUrl, QuestionTypeId
      const newTemplateParts = []
      const updatePromises = []

      if (actualParts && Array.isArray(actualParts)) {
        // Trước tiên, upload tất cả các ảnh chưa upload lên Cloudinary
        for (let partIndex = 0; partIndex < actualParts.length; partIndex++) {
          const part = actualParts[partIndex]
          const questionGroups = part.QuestionGroups || []
          const partSkill = part.Skill // Skill từ Part cha

          for (let groupIndex = 0; groupIndex < questionGroups.length; groupIndex++) {
            const group = questionGroups[groupIndex]

            // Lấy ExampleUrl từ form field trực tiếp để đảm bảo có originFileObj
            const exampleUrlFieldPath = ['parts', partIndex, 'QuestionGroups', groupIndex, 'ExampleUrl']
            const exampleUrlValue = form.getFieldValue(exampleUrlFieldPath) || group?.ExampleUrl

            let exampleUrl = null

            // Kiểm tra xem có file cần upload không
            if (exampleUrlValue) {
              if (Array.isArray(exampleUrlValue) && exampleUrlValue.length > 0) {
                const fileItem = exampleUrlValue[0]
                if (fileItem?.originFileObj) {
                  try {
                    const imageUrl = await uploadTemplatePartImageToCloudinary(fileItem.originFileObj)
                    if (imageUrl) exampleUrl = imageUrl
                  } catch (error) {
                    console.error('Error uploading image:', error)
                    message.error(`Lỗi upload ảnh: ${error.message || 'Upload thất bại'}`)
                  }
                } else if (fileItem?.url && (fileItem.url.startsWith('http://') || fileItem.url.startsWith('https://'))) {
                  exampleUrl = fileItem.url
                }
              } else if (typeof exampleUrlValue === 'string') {
                exampleUrl = exampleUrlValue
              }
            }

            const payload = {
              examTemplateId: examTemplateId,
              Skill: group.Skill || partSkill,
              QuestionFrom: group.QuestionFrom,
              QuestionTo: group.QuestionTo,
              PartTitle: group.PartTitle,
              Instruction: group.Instruction,
              Mark: group.Mark,
              ExampleUrl: exampleUrl || null,
              QuestionTypeId: group.QuestionTypeId,
            }

            // Nếu đã có TemplatePartId thì gán vào updatePromises để update
            if (group.TemplatePartId) {
              updatePromises.push(updateTemplatePart(group.TemplatePartId, payload))
            } else {
              // Nếu chưa có TemplatePartId thì add vào mảng để tạo mới
              newTemplateParts.push(payload)
            }
          }
        }
      }

      // Kiểm tra xem có gì để lưu không
      if (newTemplateParts.length === 0 && updatePromises.length === 0) {
        message.info('Không có thay đổi nào cần lưu.')
        return
      }

      // Thực thi các promise update
      if (updatePromises.length > 0) {
        await Promise.all(updatePromises)
      }

      // Thực thi api add mới nếu có
      if (newTemplateParts.length > 0) {
        await updateExamTemplateParts(examTemplateId, newTemplateParts)
      }

      // Sau khi lưu thành công, tắt chế độ chỉnh sửa cho tất cả các bộ câu

      message.success(`Đã lưu cấu trúc đề thi thành công (${updatePromises.length} cập nhật, ${newTemplateParts.length} thêm mới)`)

      // Gọi callback để component cha reload lại dữ liệu
      if (onPartsAdded) {
        onPartsAdded()
      }
    } catch (error) {
      message.error(error.message || 'Thêm parts thất bại')
    } finally {
      setLoading(false)
    }
  }

  // Tập kỹ năng đã tồn tại để chặn tạo trùng (ví dụ đã có Đọc thì không cho thêm Đọc nữa)
  const existingSkills = React.useMemo(() => {
    const parts = form.getFieldValue('parts') || []
    if (!Array.isArray(parts)) return new Set()

    return new Set(
      parts
        .map((p) => p?.Skill)
        .filter((s) => s === 1 || s === 2 || s === 3)
    )
  }, [form, watchParts])

  // Lọc question types theo skill từ API
  // QuestionTypeId là foreign key trỏ đến bảng QuestionTypes để lấy thông tin dạng câu hỏi
  const getQuestionTypesBySkill = React.useCallback((skill, includeInactive = false) => {
    if (!skill) return []

    // Lấy question types từ state (đã được load từ API)
    const types = questionTypesBySkill[skill] || []

    // Filter và map về format cho Select hoặc Table
    return types
      .filter((qt) => includeInactive || (qt.IsActive !== false && qt.isActive !== false))
      .map((qt) => {
        const code = qt.Code || qt.code || ''
        const name = qt.Name || qt.name || ''
        const difficulty = qt.Difficulty || qt.difficulty || ''
        const description = qt.Description || qt.description || ''

        // Format: code - name - [Độ khó]: difficulty - description
        const difficultyText = difficulty ? `Độ khó: ${difficulty}` : ''
        const label = [code, name, difficultyText, description]
          .filter(Boolean)
          .join(' - ')

        return {
          value: qt.QuestionTypeId || qt.questionTypeId, // QuestionTypeId trỏ đến QuestionTypes table
          label: label,
          description: description,
          code: code,
          name: name,
          difficulty: difficulty,
        }
      })
  }, [questionTypesBySkill])

  // Hàm check trùng lặp số câu hỏi
  const validateQuestionRange = (_, value) => {
    if (value === undefined || value === null) return Promise.resolve()

    const { partName, groupName, groupIndex } = editingGroup || {}
    const formValues = form.getFieldsValue(true)
    const currentGroup = formValues?.parts?.[partName]?.QuestionGroups?.[groupName]

    if (!currentGroup) return Promise.resolve()

    const from = currentGroup.QuestionFrom
    const to = currentGroup.QuestionTo

    if (from === undefined || to === undefined) return Promise.resolve()
    if (from > to) return Promise.reject(new Error('Số câu bắt đầu không được lớn hơn câu kết thúc'))

    // Duyệt qua tất cả các phần và tất cả các bộ câu hỏi
    const allParts = formValues.parts || []
    for (let pIdx = 0; pIdx < allParts.length; pIdx++) {
      const groups = allParts[pIdx].QuestionGroups || []
      for (let gIdx = 0; gIdx < groups.length; gIdx++) {
        // Bỏ qua chính nó
        // Use partName and groupName from editingGroup to identify the current group
        if (pIdx === partName && gIdx === groupName) continue

        const other = groups[gIdx]
        if (!other || other.QuestionFrom === undefined || other.QuestionTo === undefined) continue

        // Kiểm tra overlap
        if (Math.max(from, other.QuestionFrom) <= Math.min(to, other.QuestionTo)) {
          return Promise.reject(new Error(`Số câu ${from}-${to} trùng với Nhóm ${gIdx + 1} của Phần ${pIdx + 1} (${other.QuestionFrom}-${other.QuestionTo})`))
        }
      }
    }

    return Promise.resolve()
  }

  // Hàm mở modal chỉnh sửa và sao lưu giá trị ban đầu
  const handleOpenEditGroup = (groupInfo) => {
    const { partName, groupName } = groupInfo
    const currentValues = form.getFieldValue(['parts', partName, 'QuestionGroups', groupName])

    // Sao lưu giá trị ban đầu để có thể Hủy (bảo toàn File objects cho upload ảnh)
    const backup = currentValues ? { ...currentValues } : {}
    if (Array.isArray(currentValues?.ExampleUrl)) {
      backup.ExampleUrl = [...currentValues.ExampleUrl]
    }

    setInitialGroupValues(backup)
    setEditingGroup(groupInfo)
  }

  // Hàm hủy chỉnh sửa - khôi phục lại giá trị ban đầu
  const handleCancelEdit = () => {
    if (editingGroup && initialGroupValues) {
      const { partName, groupName } = editingGroup
      form.setFieldValue(['parts', partName, 'QuestionGroups', groupName], initialGroupValues)

      // Re-validate các bộ câu khác vì dải câu vừa được phục hồi có thể hết lỗi
      form.validateFields()
    }
    setEditingGroup(null)
    setInitialGroupValues(null)
  }

  // Hàm lưu chỉnh sửa - chỉ đơn giản là đóng modal vì form đã được cập nhật
  const handleSaveEdit = async () => {
    try {
      const { partName, groupName, groupKey } = editingGroup

      // Kiểm tra validation trước khi lưu tạm
      await form.validateFields([
        ['parts', partName, 'QuestionGroups', groupName, 'QuestionFrom'],
        ['parts', partName, 'QuestionGroups', groupName, 'QuestionTo'],
        ['parts', partName, 'QuestionGroups', groupName, 'QuestionTypeId'],
        ['parts', partName, 'QuestionGroups', groupName, 'Mark'],
        ['parts', partName, 'QuestionGroups', groupName, 'PartTitle'],
        ['parts', partName, 'QuestionGroups', groupName, 'Instruction']
      ])

      const currentValues = form.getFieldValue(['parts', partName, 'QuestionGroups', groupName])

      // So sánh để đánh dấu modified (sử dụng stringify đơn giản cho các trường text/number)
      const simplifiedBackup = { ...initialGroupValues, ExampleUrl: undefined }
      const simplifiedCurrent = { ...currentValues, ExampleUrl: undefined }
      const isModified = JSON.stringify(simplifiedBackup) !== JSON.stringify(simplifiedCurrent) ||
        initialGroupValues?.ExampleUrl?.length !== currentValues?.ExampleUrl?.length

      if (isModified) {
        setModifiedGroups(prev => new Set(prev).add(groupKey))
      }

      setEditingGroup(null)
      setInitialGroupValues(null)
    } catch (error) {
      // Nếu có lỗi validation (như trùng dải câu), Modal sẽ không đóng
      console.error('Validation failed:', error)
    }
  }


  return (
    <>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          parts: initialParts.length > 0 ? initialParts : [], // Không tự động tạo phần trống
        }}
      >
        {/* Dynamic parts */}
        <Form.List name="parts">
          {(fields, { add, remove }) => {
            const partsCount = fields.length
            const canAddMore = partsCount < MAX_PARTS

            // Lưu hàm add và partsCount vào ref để Modal có thể sử dụng
            addPartRef.current = add
            partsCountRef.current = partsCount

            const handleAddPart = () => {
              if (isActiveTemplate) return
              if (canAddMore) {
                setAddPartModalOpen(true)
              }
            }

            const handleRemovePart = (name) => {
              remove(name)
              // Nếu xóa phần đang active, chuyển sang phần trước đó
              if (activePartIndex >= partsCount - 1) {
                setActivePartIndex(Math.max(0, activePartIndex - 1))
              }
            }

            // Đảm bảo activePartIndex hợp lệ
            const validActiveIndex = Math.min(activePartIndex, partsCount - 1)

            const items = fields.map(({ key, name }, index) => {
              const partData = form.getFieldValue(['parts', name])
              const skillName = partData?.Skill || ''
              const skillLabel = skillOptions.find((opt) => opt.value === skillName)?.label || ''
              const isActive = index === validActiveIndex

              return {
                key: String(index),
                label: (
                  <span style={{ fontSize: 14 }}>
                    Phần {index + 1} {skillLabel}
                  </span>
                ),
                children: null,
              }
            })

            const onTabChange = (key) => {
              setActivePartIndex(parseInt(key))
            }

            return (
              <div style={{ background: '#fff', borderRadius: 8 }}>
                <div style={{ marginBottom: 16 }}>
                  <style>
                    {`
                      .exam-parts-tabs .ant-tabs-tab {
                        transition: all 0.3s;
                        border-radius: 8px 8px 0 0 !important;
                        margin-right: 4px !important;
                      }
                      .exam-parts-tabs .ant-tabs-tab-active {
                        background-color: #1890ff !important;
                        border-color: #1890ff !important;
                      }
                      .exam-parts-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
                        color: #fff !important;
                      }
                      .exam-parts-tabs .ant-tabs-tab-active .ant-tabs-tab-btn span {
                        color: #fff !important;
                      }
                      .exam-parts-tabs .ant-tabs-tab:hover span {
                        color: #1890ff !important;
                      }
                      .exam-parts-tabs .ant-tabs-tab-active:hover span {
                        color: #fff !important;
                      }
                    `}
                  </style>
                  <Tabs
                    activeKey={String(validActiveIndex >= 0 ? validActiveIndex : 0)}
                    onChange={onTabChange}
                    items={items}
                    type="card"
                    className="exam-parts-tabs"
                    style={{ flex: 1, marginBottom: -16 }}
                    tabBarExtraContent={
                      <Space>
                        {fields.length > 0 && !isActiveTemplate && (
                          <Button
                            type="text"
                            danger
                            size="middle"
                            icon={<DeleteOutlined />}
                            onClick={() => handleRemovePart(fields[validActiveIndex]?.name)}
                            style={{ fontSize: 13 }}
                          >
                            Xóa phần này
                          </Button>
                        )}
                        {canAddMore && !isActiveTemplate && (
                          <Button
                            type="primary"
                            ghost
                            icon={<PlusOutlined />}
                            onClick={handleAddPart}
                            size="middle"
                          >
                            Thêm phần
                          </Button>
                        )}
                      </Space>
                    }
                  />
                </div>

                {/* Empty State */}
                {fields.length === 0 && !isActiveTemplate && (
                  <Card
                    style={{
                      border: '2px dashed #f0f0f0',
                      textAlign: 'center',
                      padding: '60px 24px',
                      background: '#fafafa',
                      borderRadius: 12
                    }}
                  >
                    <Space orientation="vertical" size="large">
                      <div style={{ fontSize: 40, color: '#d9d9d9' }}><PlusOutlined /></div>
                      <div>
                        <Title level={5}>Chưa có phần nào được thiết lập</Title>
                        <Text type="secondary">Vui lòng chọn kỹ năng để bắt đầu xây dựng cấu trúc đề thi</Text>
                      </div>
                      <Button type="primary" onClick={handleAddPart}>Bắt đầu ngay</Button>
                    </Space>
                  </Card>
                )}

                {/* Main Content Area */}
                {fields.length > 0 && fields[validActiveIndex] && (() => {
                  const { key: partKey, name: partName, ...restPartField } = fields[validActiveIndex]
                  const skill = form.getFieldValue(['parts', partName, 'Skill'])

                  return (
                    <div key={partKey} style={{ marginTop: 16 }}>
                      <div style={{
                        border: '1px solid #f0f0f0',
                        borderRadius: '8px',
                        padding: '20px 24px',
                        background: '#fff'
                      }}>
                        <Form.Item {...restPartField} name={[partName, 'Skill']} hidden>
                          <Input type="hidden" />
                        </Form.Item>

                        <Form.List name={[partName, 'QuestionGroups']}>
                          {(groupFields, { add: addGroup, remove: removeGroup, move: moveGroup }) => {
                            // Lấy cả các question types đã bị ẩn (inactive) để hiển thị code trong bảng
                            const allQuestionTypes = getQuestionTypesBySkill(skill, true)
                            const tableData = groupFields.map(({ key, name }, index) => {
                              const values = form.getFieldValue(['parts', partName, 'QuestionGroups', name]) || {}
                              return {
                                ...values,
                                key,
                                name,
                                index
                              }
                            })

                            const columns = [
                              {
                                title: <Text style={{ fontSize: 13, color: '#8c8c8c' }}>STT</Text>,
                                dataIndex: 'index',
                                key: 'index',
                                width: 60,
                                render: (i) => <Text type="secondary" style={{ fontSize: 13 }}>#{i + 1}</Text>
                              },
                              {
                                title: <Text style={{ fontSize: 13, color: '#8c8c8c' }}>Dạng câu & Tiêu đề phu</Text>,
                                key: 'typeAndTitle',
                                render: (_, record) => {
                                  const type = allQuestionTypes.find(t => t.value === record.QuestionTypeId)
                                  return (
                                    <Space orientation="vertical" size={2}>
                                      <Space>
                                        <Tag color="blue" variant="filled" style={{ fontSize: 12, margin: 0 }}>
                                          {type?.code || '??'}
                                        </Tag>
                                        <Text strong style={{ fontSize: 15, color: '#262626' }}>
                                          {type?.name || 'Chưa thiết lập'}
                                        </Text>
                                      </Space>
                                      {record.PartTitle && (
                                        <Text type="secondary" style={{ fontSize: 13, marginLeft: 2 }}>
                                          {record.PartTitle}
                                        </Text>
                                      )}
                                    </Space>
                                  )
                                }
                              },
                              {
                                title: <Text style={{ fontSize: 13, color: '#8c8c8c' }}>Phạm vi</Text>,
                                key: 'range',
                                align: 'center',
                                width: 160,
                                render: (_, record) => (
                                  <Tag color="cyan" style={{ border: 'none', padding: '2px 10px', fontSize: 14 }}>
                                    Câu {record.QuestionFrom || '?'}-{record.QuestionTo || '?'}
                                  </Tag>
                                )
                              },
                              {
                                title: <Text style={{ fontSize: 13, color: '#8c8c8c' }}>Điểm</Text>,
                                dataIndex: 'Mark',
                                key: 'Mark',
                                align: 'center',
                                width: 100,
                                render: (mark) => <Text strong style={{ color: '#F87218', fontSize: 16 }}>{mark || 0}</Text>
                              },
                              {
                                title: <Text style={{ fontSize: 13, color: '#8c8c8c' }}>Thao tác</Text>,
                                key: 'actions',
                                width: 120,
                                align: 'center',
                                render: (_, record) => (
                                  <div className="row-action-buttons">
                                    <Space size="small">
                                      <Tooltip title="Chỉnh sửa chi tiết">
                                        <Button
                                          type="text"
                                          size="middle"
                                          icon={<EditOutlined style={{ color: '#1890ff' }} />}
                                          onClick={() => handleOpenEditGroup({ partName, groupName: record.name, groupIndex: record.index, groupKey: record.key, skill })}
                                        />
                                      </Tooltip>
                                      {!isActiveTemplate && (
                                        <Tooltip title="Xóa">
                                          <Button
                                            type="text"
                                            danger
                                            size="middle"
                                            icon={<DeleteOutlined style={{ fontSize: 16 }} />}
                                            onClick={() => removeGroup(record.index)}
                                          />
                                        </Tooltip>
                                      )}
                                    </Space>
                                  </div>
                                )
                              }
                            ]

                            return (
                              <div style={{ padding: '0 4px' }}>
                                {groupFields.length === 0 ? (
                                  <div style={{ padding: '40px', textAlign: 'center', border: '1px dashed #d9d9d9', borderRadius: 8, background: '#fafafa' }}>
                                    <Text type="secondary">Chưa có bộ câu hỏi nào cho phần này.</Text>
                                    <br />
                                    {!isActiveTemplate && (
                                      <Button
                                        type="primary"
                                        ghost
                                        icon={<PlusOutlined />}
                                        style={{ marginTop: 16 }}
                                        onClick={() => {
                                          addGroup({ Skill: skill, QuestionFrom: 1, QuestionTo: 1, Mark: 1 })
                                          // Để groupFields cập nhật, ta dùng setTimeout
                                          setTimeout(() => {
                                            const updatedValues = form.getFieldsValue(true)
                                            const currentGroups = updatedValues.parts[partName].QuestionGroups
                                            const newIndex = currentGroups.length - 1
                                            // Lấy key từ groupFields thực tế bằng cách render lại hoặc đoán index
                                            handleOpenEditGroup({
                                              partName,
                                              groupName: newIndex,
                                              groupIndex: newIndex,
                                              groupKey: `new-${Date.now()}`, // Temporary fallback if key not yet available
                                              skill
                                            })
                                          }, 0)
                                        }}
                                      >
                                        Thêm bộ câu đầu tiên
                                      </Button>
                                    )}
                                  </div>
                                ) : (
                                  <>
                                    <style>
                                      {`
                                        .row-action-buttons {
                                          opacity: 0;
                                          transition: opacity 0.2s;
                                        }
                                        .ant-table-row:hover .row-action-buttons {
                                          opacity: 1;
                                        }
                                        .modified-row {
                                          background-color: #fffbe6 !important;
                                        }
                                        .modified-row:hover > td {
                                          background-color: #fff1b8 !important;
                                        }
                                      `}
                                    </style>
                                    <Table
                                      dataSource={tableData}
                                      columns={columns}
                                      pagination={false}
                                      size="large"
                                      bordered={false}
                                      rowKey="key"
                                      rowClassName={(record) => (!record.TemplatePartId || modifiedGroups.has(record.key)) ? 'modified-row' : ''}
                                      scroll={{ y: 400 }} // Tăng nhẹ chiều cao
                                      style={{ marginBottom: 16 }}
                                    />
                                    {!isActiveTemplate && (
                                      <Button
                                        type="dashed"
                                        block
                                        icon={<PlusOutlined />}
                                        style={{
                                          height: 48,
                                          borderRadius: 8,
                                          fontSize: 15,
                                          color: '#8c8c8c'
                                        }}
                                        onClick={() => {
                                          const lastGroup = tableData[tableData.length - 1]
                                          const nextFrom = lastGroup ? (lastGroup.QuestionTo + 1) : 1
                                          addGroup({ Skill: skill, QuestionFrom: nextFrom, QuestionTo: nextFrom, Mark: 1 })
                                          setTimeout(() => {
                                            const updatedValues = form.getFieldsValue(true)
                                            const currentGroups = updatedValues.parts[partName].QuestionGroups
                                            const newIndex = currentGroups.length - 1
                                            handleOpenEditGroup({
                                              partName,
                                              groupName: newIndex,
                                              groupIndex: newIndex,
                                              groupKey: `new-${Date.now()}`,
                                              skill
                                            })
                                          }, 0)
                                        }}
                                      >
                                        Thêm bộ câu hỏi mới
                                      </Button>
                                    )}
                                  </>
                                )}
                              </div>
                            )
                          }}
                        </Form.List>
                      </div>
                    </div>
                  )
                })()}

                {!isActiveTemplate && (
                  <div style={{ marginTop: 24, textAlign: 'right' }}>
                    <Button
                      type="primary"
                      block
                      onClick={() => form.submit()}
                      loading={loading}
                      size="large"
                      style={{
                        borderRadius: 8,
                        // minWidth: '100px'
                      }}
                    >
                      Lưu
                    </Button>
                  </div>
                )}
              </div>
            )
          }}
        </Form.List>

        {/* Modal chọn skill khi thêm phần mới */}
        <Modal
          title="Chọn kỹ năng cho phần mới"
          open={addPartModalOpen}
          onOk={() => {
            if (!selectedSkillForNewPart) {
              message.warning('Vui lòng chọn kỹ năng')
              return
            }

            if (existingSkills.has(selectedSkillForNewPart)) {
              message.error(`Đã tồn tại phần "${getSkillLabel(selectedSkillForNewPart)}".`)
              return
            }

            // Cách tiếp cận mới: Lấy các phần hiện tại, thêm phần mới, sort lại và set lại form
            const currentParts = form.getFieldValue('parts') || []
            const newParts = [...currentParts, { Skill: selectedSkillForNewPart, QuestionGroups: [] }]
            const sortedParts = sortPartsBySkill(newParts)

            form.setFieldsValue({ parts: sortedParts })

            // Tìm index mới của skill vừa thêm
            const newIndex = sortedParts.findIndex(p => p.Skill === selectedSkillForNewPart)
            if (newIndex !== -1) {
              setActivePartIndex(newIndex)
            }

            setAddPartModalOpen(false)
            setSelectedSkillForNewPart(null)
          }}
          onCancel={() => {
            setAddPartModalOpen(false)
            setSelectedSkillForNewPart(null)
          }}
          okText="Tạo phần"
          cancelText="Hủy"
          width={400}
        >
          <div style={{ padding: '16px 0' }}>
            <Select
              placeholder="Chọn kỹ năng"
              size="middle"
              options={skillOptions.map((opt) => ({
                ...opt,
                disabled: existingSkills.has(opt.value),
              }))}
              value={selectedSkillForNewPart}
              onChange={(value) => setSelectedSkillForNewPart(value)}
              style={{ width: '100%' }}
            />
          </div>
        </Modal>

        {/* Modal chỉnh sửa chi tiết bộ câu hỏi */}
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', backgroundColor: '#e6f7ff',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <EditOutlined style={{ color: '#1890ff', fontSize: 14 }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>Chi tiết bộ câu hỏi</span>
                <Text type="secondary" style={{ fontSize: 14 }}>{editingGroup && `Nhóm ${editingGroup.groupIndex + 1} - ${getSkillLabel(editingGroup.skill)}`}</Text>
              </div>
            </div>
          }
          open={!!editingGroup}
          onOk={handleSaveEdit}
          onCancel={handleCancelEdit}
          footer={[
            <Button
              key="cancel"
              size="middle"
              style={{ borderRadius: 8, minWidth: 100 }}
              onClick={handleCancelEdit}
            >
              Hủy
            </Button>,
            <Button
              key="submit"
              type="primary"
              size="middle"
              style={{ borderRadius: 8, minWidth: 100, backgroundColor: '#1890ff' }}
              onClick={handleSaveEdit}
            >
              Lưu
            </Button>
          ]}
          width={900}
          centered
          destroyOnHidden={false}
        >
          {editingGroup && (() => {
            const { partName, groupName, skill } = editingGroup
            const questionTypes = getQuestionTypesBySkill(skill)

            return (
              <div style={{ padding: '8px 0' }}>
                <Row gutter={24}>
                  <Col span={14}>
                    <Form.Item
                      name={['parts', partName, 'QuestionGroups', groupName, 'QuestionTypeId']}
                      label={<Text strong style={{ fontSize: 14 }}>Loại câu hỏi</Text>}
                      rules={[{ required: true, message: 'Vui lòng chọn' }]}
                      style={{ marginBottom: 16 }}
                    >
                      <Select
                        options={questionTypes}
                        size="middle"
                        showSearch
                        disabled={isActiveTemplate}
                        placeholder="Chọn dạng câu hỏi..."
                        style={{ borderRadius: 8 }}
                      />
                    </Form.Item>

                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item
                          name={['parts', partName, 'QuestionGroups', groupName, 'QuestionFrom']}
                          label={<Text strong style={{ fontSize: 14 }}>Từ câu</Text>}
                          rules={[
                            { required: true, message: 'Vui lòng nhập' },
                            { validator: validateQuestionRange }
                          ]}
                          style={{ marginBottom: 16 }}
                          validateTrigger={['onChange', 'onBlur']}
                        >
                          <InputNumber min={1} size="middle" style={{ width: '100%', borderRadius: 8 }} disabled={isActiveTemplate} />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          name={['parts', partName, 'QuestionGroups', groupName, 'QuestionTo']}
                          label={<Text strong style={{ fontSize: 14 }}>Đến câu</Text>}
                          rules={[
                            { required: true, message: 'Vui lòng nhập' },
                            { validator: validateQuestionRange }
                          ]}
                          style={{ marginBottom: 16 }}
                          validateTrigger={['onChange', 'onBlur']}
                        >
                          <InputNumber min={1} size="middle" style={{ width: '100%', borderRadius: 8 }} disabled={isActiveTemplate} />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          name={['parts', partName, 'QuestionGroups', groupName, 'Mark']}
                          label={<Text strong style={{ fontSize: 14 }}>Điểm</Text>}
                          rules={[{ required: true, message: 'Vui lòng nhập điểm' }]}
                          style={{ marginBottom: 16 }}
                        >
                          <InputNumber min={0} step={1} size="middle" style={{ width: '100%', borderRadius: 8 }} disabled={isActiveTemplate} />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item
                      name={['parts', partName, 'QuestionGroups', groupName, 'PartTitle']}
                      label={<Text strong style={{ fontSize: 14 }}>Tiêu đề hiển thị</Text>}
                      rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
                      style={{ marginBottom: 16 }}
                    >
                      <Input size="middle" style={{ borderRadius: 8 }} disabled={isActiveTemplate} placeholder="Tiêu đề chính của nhóm câu..." />
                    </Form.Item>

                    <Form.Item
                      name={['parts', partName, 'QuestionGroups', groupName, 'Instruction']}
                      label={<Text strong style={{ fontSize: 14 }}>Hướng dẫn thí sinh</Text>}
                      rules={[{ required: true, message: 'Vui lòng nhập hướng dẫn' }]}
                      style={{ marginBottom: 0 }}
                    >
                      <TextArea rows={4} style={{ borderRadius: 8 }} disabled={isActiveTemplate} placeholder="Ví dụ: Đọc đoạn văn sau và chọn đáp án..." />
                    </Form.Item>
                  </Col>

                  <Col span={10}>
                    <Form.Item
                      name={['parts', partName, 'QuestionGroups', groupName, 'ExampleUrl']}
                      label={<Text strong style={{ fontSize: 14 }}>Ảnh ví dụ</Text>}
                      style={{ marginBottom: 0 }}
                      valuePropName="fileList"
                      getValueFromEvent={e => Array.isArray(e) ? e : e?.fileList}
                    >
                      <ImageUploadField disabled={isActiveTemplate} />
                    </Form.Item>

                    <div style={{ marginTop: 20, padding: 16, background: '#f5f5f5', borderRadius: 8, border: '1px solid #f0f0f0' }}>
                      <Title level={5} style={{ fontSize: 13, marginBottom: 8, color: '#595959' }}>Thông tin bổ sung</Title>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Hãy đảm bảo phạm vi câu hỏi không bị trùng lặp với các bộ câu khác trong cùng một phần.
                        Ảnh ví dụ nên có kích thước rõ nét để thí sinh dễ dàng theo dõi.
                      </Text>
                    </div>
                  </Col>
                </Row>
              </div>
            )
          })()}
        </Modal>
      </Form>
    </>
  )
}

