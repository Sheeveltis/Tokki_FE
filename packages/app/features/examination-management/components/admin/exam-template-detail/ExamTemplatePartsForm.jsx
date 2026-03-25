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
  Divider,
  Card,
  Modal,
  Descriptions,
  Upload,
  Spin,
  Tabs,
  Tag,
  Tooltip,
  List,
  Table,
} from 'antd'
import {
  PlusOutlined,
  DeleteOutlined,
  UpOutlined,
  DownOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  EditOutlined,
  CloseOutlined,
  UploadOutlined,
  InboxOutlined,
  CopyOutlined,
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
  { value: 2, label: 'Đọc' },       // Reading = 2
  { value: 3, label: 'Viết' },      // Writing = 3
]

// Helper function để lấy label của skill
export const getSkillLabel = (skill) => {
  const option = skillOptions.find(opt => opt.value === skill)
  return option?.label || `Skill ${skill}`
}

export default function ExamTemplatePartsForm({ examTemplateId, initialParts = [], examTemplate = null, onPartsAdded }) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [activePartIndex, setActivePartIndex] = useState(0)
  const [addPartModalOpen, setAddPartModalOpen] = useState(false)
  const [selectedSkillForNewPart, setSelectedSkillForNewPart] = useState(null)
  const [collapsedGroups, setCollapsedGroups] = useState(new Set()) // Track các bộ câu đang được collapse
  const [editingGroups, setEditingGroups] = useState(new Set()) // Track các bộ câu đang ở chế độ chỉnh sửa
  const [editingGroup, setEditingGroup] = useState(null) // { partName, groupName, groupIndex, skill }
  const addPartRef = React.useRef(null) // Ref để lưu hàm add từ Form.List
  const partsCountRef = React.useRef(0) // Ref để lưu số lượng phần hiện tại
  const loadedSkillsRef = React.useRef(new Set()) // Ref để track các skill đã load

  // State để lưu questionTypes theo skill
  const [questionTypesBySkill, setQuestionTypesBySkill] = useState({})
  const [loadingQuestionTypes, setLoadingQuestionTypes] = useState({})

  // Lấy examType từ examTemplate (1 = TOPIK I, 2 = TOPIK II, 3 = Test đầu vào)
  const examType = examTemplate?.type ||
    (examTemplate?.examType === 'TOPIK I' ? 1 :
      examTemplate?.examType === 'TOPIK II' ? 2 :
        examTemplate?.examType === 'Test đầu vào' ? 3 : null) || null

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

  // Set initial values
  useEffect(() => {
    if (initialParts.length > 0) {
      form.setFieldsValue({ parts: initialParts })
    } else {
      // Nếu chưa có phần nào, để trống (không tự động tạo phần)
      form.setFieldsValue({ parts: [] })
    }
  }, [initialParts, form])

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

      if (actualParts && Array.isArray(actualParts)) {
        // Trước tiên, upload tất cả các ảnh chưa upload lên Cloudinary
        for (let partIndex = 0; partIndex < actualParts.length; partIndex++) {
          const part = actualParts[partIndex]
          const questionGroups = part.QuestionGroups || []

          for (let groupIndex = 0; groupIndex < questionGroups.length; groupIndex++) {
            const group = questionGroups[groupIndex]

            // Chỉ lấy các parts mới (không có TemplatePartId) để add thêm
            // Nếu đã có TemplatePartId thì bỏ qua (đã tồn tại trong database)
            if (group.TemplatePartId) {
              continue
            }

            // Lấy ExampleUrl từ form field trực tiếp để đảm bảo có originFileObj
            // Sử dụng getFieldValue để lấy giá trị thực tế từ form
            const exampleUrlFieldPath = ['parts', partIndex, 'QuestionGroups', groupIndex, 'ExampleUrl']
            const exampleUrlValue = form.getFieldValue(exampleUrlFieldPath) || group?.ExampleUrl

            let exampleUrl = null

            // Debug: Log để kiểm tra
            console.log('ExampleUrl value:', exampleUrlValue, 'Type:', typeof exampleUrlValue, 'Is Array:', Array.isArray(exampleUrlValue))

            // Kiểm tra xem có file cần upload không
            // ExampleUrl có thể là:
            // 1. Array (fileList từ Upload component với valuePropName="fileList")
            // 2. String URL (từ database hoặc đã upload trước đó)
            // 3. null/undefined

            if (exampleUrlValue) {
              // Nếu là array (fileList từ Upload component)
              if (Array.isArray(exampleUrlValue) && exampleUrlValue.length > 0) {
                const fileItem = exampleUrlValue[0]

                console.log('File item:', fileItem, 'Has originFileObj:', !!fileItem?.originFileObj, 'Has URL:', fileItem?.url)

                // Kiểm tra xem có originFileObj không (file chưa upload)
                if (fileItem?.originFileObj) {
                  try {
                    console.log('Uploading image to Cloudinary...')
                    // Upload file lên Cloudinary
                    const imageUrl = await uploadTemplatePartImageToCloudinary(fileItem.originFileObj)
                    console.log('Upload successful, URL:', imageUrl)
                    if (imageUrl) {
                      exampleUrl = imageUrl
                    }
                  } catch (error) {
                    console.error('Error uploading image:', error)
                    message.error(`Lỗi upload ảnh: ${error.message || 'Upload thất bại'}`)
                    exampleUrl = null
                  }
                }
                // Nếu đã có URL từ Cloudinary (http/https)
                else if (fileItem?.url && (fileItem.url.startsWith('http://') || fileItem.url.startsWith('https://'))) {
                  console.log('Using existing URL:', fileItem.url)
                  exampleUrl = fileItem.url
                }
                // Nếu là base64 preview (data:) nhưng không có originFileObj -> có thể file đã bị mất originFileObj
                else if (fileItem?.url && fileItem.url.startsWith('data:')) {
                  console.warn('File has base64 URL but no originFileObj, cannot upload')
                  message.warning('Ảnh đã được chọn nhưng không thể upload. Vui lòng chọn lại ảnh.')
                  exampleUrl = null
                }
                // Trường hợp khác - có thể file đã bị mất originFileObj
                else {
                  console.warn('File item exists but has no originFileObj or valid URL')
                  exampleUrl = null
                }
              }
              // Nếu đã là string URL (từ database hoặc đã upload trước đó)
              else if (typeof exampleUrlValue === 'string') {
                console.log('Using string URL:', exampleUrlValue)
                exampleUrl = exampleUrlValue
              }
            }

            // Cập nhật lại vào group để dùng cho templateParts
            group.ExampleUrl = exampleUrl

            const partSkill = part.Skill // Skill từ Part cha

            newTemplateParts.push({
              // Không có TemplatePartId vì đây là part mới cần add
              Skill: group.Skill || partSkill, // Ưu tiên Skill từ group, nếu không có thì lấy từ Part cha
              QuestionFrom: group.QuestionFrom,
              QuestionTo: group.QuestionTo,
              PartTitle: group.PartTitle,
              Instruction: group.Instruction,
              Mark: group.Mark,
              ExampleUrl: group.ExampleUrl || null, // URL từ Cloudinary hoặc null
              QuestionTypeId: group.QuestionTypeId, // Foreign key trỏ đến QuestionTypes table
            })
          }
        }
      }

      // Kiểm tra xem có parts mới nào cần add không
      if (newTemplateParts.length === 0) {
        message.info('Không có parts mới nào cần thêm. Các parts đã tồn tại sẽ không được cập nhật.')
        return
      }

      // Sau khi upload tất cả ảnh, gọi API để add các parts mới
      await updateExamTemplateParts(examTemplateId, newTemplateParts)

      // Sau khi lưu thành công, tắt chế độ chỉnh sửa cho tất cả các bộ câu
      setEditingGroups(new Set())

      message.success(`Đã thêm ${newTemplateParts.length} parts mới thành công`)

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
  const getQuestionTypesBySkill = React.useCallback((skill) => {
    if (!skill) return []

    // Lấy question types từ state (đã được load từ API)
    const types = questionTypesBySkill[skill] || []

    // Không gọi loadQuestionTypes ở đây để tránh setState trong render
    // Việc load sẽ được xử lý trong useEffect

    // Filter chỉ lấy active và map về format cho Select
    return types
      .filter((qt) => qt.IsActive !== false && qt.isActive !== false)
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

              return {
                key: String(index),
                label: (
                  <Space>
                    <span style={{ fontSize: 14 }}>Phần {index + 1}</span>
                    <Tag color="blue" style={{ margin: 0, fontSize: 14 }}>{skillLabel}</Tag>
                  </Space>
                ),
                children: null,
              }
            })

            const onTabChange = (key) => {
              setActivePartIndex(parseInt(key))
            }

            return (
              <div style={{ background: '#fff', borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <Tabs
                    activeKey={String(validActiveIndex >= 0 ? validActiveIndex : 0)}
                    onChange={onTabChange}
                    items={items}
                    type="card"
                    style={{ flex: 1, marginBottom: -16 }}
                  />
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
                    <Space direction="vertical" size="large">
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
                    <div key={partKey} style={{ marginTop: 24 }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 16px',
                        background: '#f8f9fa',
                        borderRadius: '8px 8px 0 0',
                        border: '1px solid #f0f0f0',
                        borderBottom: 'none'
                      }}>
                        <Space size="middle">
                          <MenuOutlined style={{ color: '#8c8c8c', fontSize: 18 }} />
                          <Text strong style={{ fontSize: 16 }}>Cấu trúc câu hỏi - {getSkillLabel(skill)}</Text>
                        </Space>
                        {!isActiveTemplate && (
                          <Button
                            type="text"
                            danger
                            size="middle"
                            icon={<DeleteOutlined />}
                            onClick={() => handleRemovePart(partName)}
                            style={{ fontSize: 14 }}
                          >
                            Xóa phần này
                          </Button>
                        )}
                      </div>

                      <div style={{
                        border: '1px solid #f0f0f0',
                        borderRadius: '0 0 8px 8px',
                        padding: '16px 20px',
                        background: '#fff'
                      }}>
                        <Form.Item {...restPartField} name={[partName, 'Skill']} hidden>
                          <Input type="hidden" />
                        </Form.Item>

                        <Form.List name={[partName, 'QuestionGroups']}>
                          {(groupFields, { add: addGroup, remove: removeGroup, move: moveGroup }) => {
                            const questionTypes = getQuestionTypesBySkill(skill)
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
                                title: <Text style={{ fontSize: 14 }}>#</Text>,
                                dataIndex: 'index',
                                key: 'index',
                                width: 50,
                                render: (i) => <Text type="secondary" style={{ fontSize: 14 }}>{i + 1}</Text>
                              },
                              {
                                title: <Text style={{ fontSize: 14 }}>Dạng câu & Tên nhóm</Text>,
                                key: 'typeAndTitle',
                                render: (_, record) => {
                                  const type = questionTypes.find(t => t.value === record.QuestionTypeId)
                                  return (
                                    <Space direction="vertical" size={2}>
                                      <Space>
                                        <Tag color="cyan" style={{ fontSize: 14, margin: 0 }}>{type?.code || '??'}</Tag>
                                        <Text strong style={{ fontSize: 14 }}>{type?.name || 'Dạng câu mới'}</Text>
                                      </Space>
                                      {record.PartTitle && <Text type="secondary" style={{ fontSize: 14 }}>{record.PartTitle}</Text>}
                                    </Space>
                                  )
                                }
                              },
                              {
                                title: <Text style={{ fontSize: 14 }}>Phạm vi</Text>,
                                key: 'range',
                                align: 'center',
                                width: 140,
                                render: (_, record) => (
                                  <Tag color="orange" style={{ padding: '4px 8px', fontSize: 14, margin: 0 }}>
                                    Câu {record.QuestionFrom || '?'} - {record.QuestionTo || '?'}
                                  </Tag>
                                )
                              },
                              {
                                title: <Text style={{ fontSize: 14 }}>Điểm</Text>,
                                dataIndex: 'Mark',
                                key: 'Mark',
                                align: 'center',
                                width: 100,
                                render: (mark) => <Text strong style={{ color: '#F87218', fontSize: 14 }}>{mark || 0}</Text>
                              },
                              {
                                title: <Text style={{ fontSize: 14 }}>Thao tác</Text>,
                                key: 'actions',
                                width: 100,
                                align: 'center',
                                render: (_, record) => (
                                  <Space size="middle">
                                    <Tooltip title="Chỉnh sửa chi tiết">
                                      <Button
                                        type="primary"
                                        ghost
                                        size="middle"
                                        icon={<EditOutlined />}
                                        style={{ borderRadius: 6 }}
                                        onClick={() => setEditingGroup({ partName, groupName: record.name, groupIndex: record.index, skill })}
                                      />
                                    </Tooltip>
                                    {!isActiveTemplate && (
                                      <Tooltip title="Xóa">
                                        <Button
                                          type="text"
                                          danger
                                          size="middle"
                                          icon={<DeleteOutlined style={{ fontSize: 18 }} />}
                                          onClick={() => removeGroup(record.index)}
                                        />
                                      </Tooltip>
                                    )}
                                  </Space>
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
                                          setEditingGroup({ partName, groupName: groupFields.length, groupIndex: groupFields.length, skill })
                                        }}
                                      >
                                        Thêm bộ câu đầu tiên
                                      </Button>
                                    )}
                                  </div>
                                ) : (
                                  <>
                                    <Table
                                      dataSource={tableData}
                                      columns={columns}
                                      pagination={false}
                                      size="middle"
                                      bordered={false}
                                      rowKey="key"
                                      scroll={{ y: 350 }} // Cố định chiều cao và cuộn bên trong
                                      style={{ marginBottom: 16 }}
                                    />
                                    {!isActiveTemplate && (
                                      <Button
                                        type="dashed"
                                        block
                                        icon={<PlusOutlined />}
                                        onClick={() => {
                                          const lastGroup = tableData[tableData.length - 1]
                                          const nextFrom = lastGroup ? (lastGroup.QuestionTo + 1) : 1
                                          addGroup({ Skill: skill, QuestionFrom: nextFrom, QuestionTo: nextFrom, Mark: 1 })
                                          setTimeout(() => {
                                            setEditingGroup({ partName, groupName: groupFields.length, groupIndex: groupFields.length, skill })
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
                      onClick={() => form.submit()}
                      loading={loading}
                      size="large"
                      style={{
                        borderRadius: 8, minWidth: 160, height: 45,
                        backgroundColor: '#F87218', borderColor: '#F87218',
                        boxShadow: '0 4px 10px rgba(248, 114, 24, 0.2)'
                      }}
                    >
                      Xác nhận lưu tất cả
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

            if (addPartRef.current) {
              addPartRef.current({
                Skill: selectedSkillForNewPart,
                QuestionGroups: []
              })
              setActivePartIndex(partsCountRef.current)
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
          onOk={() => setEditingGroup(null)}
          onCancel={() => setEditingGroup(null)}
          footer={[
            <Button
              key="close"
              type="primary"
              size="middle"
              style={{ borderRadius: 8, minWidth: 100, backgroundColor: '#1890ff' }}
              onClick={() => setEditingGroup(null)}
            >
              Đóng
            </Button>
          ]}
          width={560}
          centered
          destroyOnClose={false}
        >
          {editingGroup && (() => {
            const { partName, groupName, skill } = editingGroup
            const questionTypes = getQuestionTypesBySkill(skill)

            return (
              <div style={{ padding: '4px 0 16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  <Form.Item
                    name={['parts', partName, 'QuestionGroups', groupName, 'QuestionTypeId']}
                    label={<Text strong style={{ fontSize: 14 }}>Loại câu hỏi</Text>}
                    rules={[{ required: true, message: 'Vui lòng chọn' }]}
                    style={{ gridColumn: '1 / -1', marginBottom: 12 }}
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

                  <Form.Item
                    name={['parts', partName, 'QuestionGroups', groupName, 'QuestionFrom']}
                    label={<Text strong style={{ fontSize: 14 }}>Từ câu</Text>}
                    rules={[{ required: true }]}
                    style={{ marginBottom: 12 }}
                  >
                    <InputNumber min={1} size="middle" style={{ width: '100%', borderRadius: 8 }} disabled={isActiveTemplate} />
                  </Form.Item>

                  <Form.Item
                    name={['parts', partName, 'QuestionGroups', groupName, 'QuestionTo']}
                    label={<Text strong style={{ fontSize: 14 }}>Đến câu</Text>}
                    rules={[{ required: true }]}
                    style={{ marginBottom: 12 }}
                  >
                    <InputNumber min={1} size="middle" style={{ width: '100%', borderRadius: 8 }} disabled={isActiveTemplate} />
                  </Form.Item>

                  <Form.Item
                    name={['parts', partName, 'QuestionGroups', groupName, 'Mark']}
                    label={<Text strong style={{ fontSize: 14 }}>Điểm</Text>}
                    rules={[{ required: true }]}
                    style={{ marginBottom: 12 }}
                  >
                    <InputNumber min={0} step={1} size="middle" style={{ width: '100%', borderRadius: 8 }} disabled={isActiveTemplate} />
                  </Form.Item>

                  <Form.Item
                    name={['parts', partName, 'QuestionGroups', groupName, 'PartTitle']}
                    label={<Text strong style={{ fontSize: 14 }}>Tiêu đề hiển thị</Text>}
                    rules={[{ required: true }]}
                    style={{ gridColumn: '1 / -1', marginBottom: 12 }}
                  >
                    <Input size="middle" style={{ borderRadius: 8 }} disabled={isActiveTemplate} placeholder="Tiêu đề chính của nhóm câu..." />
                  </Form.Item>

                  <Form.Item
                    name={['parts', partName, 'QuestionGroups', groupName, 'Instruction']}
                    label={<Text strong style={{ fontSize: 14 }}>Hướng dẫn thí sinh</Text>}
                    rules={[{ required: true }]}
                    style={{ gridColumn: '1 / -1', marginBottom: 12 }}
                  >
                    <TextArea rows={3} style={{ borderRadius: 8 }} disabled={isActiveTemplate} placeholder="Ví dụ: Đọc đoạn văn sau và chọn đáp án..." />
                  </Form.Item>

                  <Form.Item
                    name={['parts', partName, 'QuestionGroups', groupName, 'ExampleUrl']}
                    label={<Text strong style={{ fontSize: 14 }}>Ảnh ví dụ</Text>}
                    style={{ gridColumn: '1 / -1', marginBottom: 0 }}
                    valuePropName="fileList"
                    getValueFromEvent={e => Array.isArray(e) ? e : e?.fileList}
                  >
                    <ImageUploadField disabled={isActiveTemplate} />
                  </Form.Item>
                </div>
              </div>
            )
          })()}
        </Modal>
      </Form>
    </>
  )
}

