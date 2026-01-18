'use client'

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
} from 'antd'
import { PlusOutlined, DeleteOutlined, UpOutlined, DownOutlined, EyeOutlined, EyeInvisibleOutlined, EditOutlined, CloseOutlined, UploadOutlined, InboxOutlined } from '@ant-design/icons'
import { ButtonV2 } from '../../../../../../components/buttonV2.jsx'
import { fetchQuestionTypes, updateExamTemplateParts, uploadTemplatePartImageToCloudinary, updateTemplatePart } from '../../../../admin/api/index.js'

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
        <p className="ant-upload-text" style={{ fontSize: 13 }}>
          Click hoặc kéo thả ảnh vào đây để upload
        </p>
        <p className="ant-upload-hint" style={{ fontSize: 12, color: '#999' }}>
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
      <Divider titlePlacement="left">
        <Title level={4} style={{ margin: 0 }}>
          Quản lý các phần của đề thi
        </Title>
      </Divider>

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

            const handleRemovePart = (index) => {
              remove(index)
              // Nếu xóa phần đang active, chuyển sang phần trước đó
              if (activePartIndex >= partsCount - 1) {
                setActivePartIndex(Math.max(0, activePartIndex - 1))
              }
              // Reset về 0 nếu không còn phần nào
              if (partsCount - 1 === 0) {
                setActivePartIndex(0)
              }
            }

            const handlePartTabClick = (index) => {
              setActivePartIndex(index)
            }

            // Đảm bảo activePartIndex hợp lệ
            const validActiveIndex = Math.min(activePartIndex, partsCount - 1)

            return (
              <>
                {/* Tab buttons để chuyển đổi giữa các phần */}
                <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {fields.map(({ key, name }, index) => {
                    const partData = form.getFieldValue(['parts', name])
                    const skillName = partData?.Skill || ''
                    const skillLabel = skillOptions.find(opt => opt.value === skillName)?.label || ''
                    
                    return (
                      <Button
                        key={key}
                        type={index === validActiveIndex ? 'primary' : 'default'}
                        onClick={() => handlePartTabClick(index)}
                        style={{
                          minWidth: 120,
                          height: 40,
                        }}
                      >
                        Phần {index + 1} {skillLabel ? `(${skillLabel})` : ''}
                      </Button>
                    )
                  })}
                  
                  {canAddMore && !isActiveTemplate && (
                    <Button
                      type="dashed"
                      icon={<PlusOutlined />}
                      onClick={handleAddPart}
                      style={{
                        minWidth: 120,
                        height: 40,
                      }}
                    >
                      Thêm phần
                    </Button>
                  )}
                </div>

                {/* Hiển thị empty state nếu chưa có phần nào */}
                {fields.length === 0 && !isActiveTemplate && (
                  <Card
                    style={{
                      border: '2px dashed #d9d9d9',
                      textAlign: 'center',
                      padding: '48px 24px',
                      backgroundColor: '#fafafa',
                    }}
                  >
                    <div style={{ marginBottom: 16 }}>
                      <Text type="secondary" style={{ fontSize: 16 }}>
                        Chưa có phần nào. Hãy thêm phần để bắt đầu.
                      </Text>
                    </div>
                    {canAddMore && (
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAddPart}
                        size="middle"
                        style={{ padding: 12 }}
                      >
                        Thêm phần
                      </Button>
                    )}
                  </Card>
                )}

                {/* Hiển thị form của phần đang active */}
                {fields.length > 0 && fields[validActiveIndex] && (() => {
                  const { key, name, ...restField } = fields[validActiveIndex]
                  
                  return (
                    <Card
                      key={key}
                      size="small"
                      title={`Phần ${validActiveIndex + 1}`}
                      extra={
                        !isActiveTemplate && (
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleRemovePart(name)}
                          >
                            Xóa phần
                          </Button>
                        )
                      }
                      style={{ marginBottom: 16 }}
                    >
                      <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
                        {/* Skill field ẩn - đã chọn khi tạo phần mới */}
                        <Form.Item
                          {...restField}
                          name={[name, 'Skill']}
                          hidden
                          rules={[{ required: true, message: 'Vui lòng chọn kỹ năng' }]}
                        >
                          <Input type="hidden" />
                        </Form.Item>

                        {/* Form.List để quản lý các TemplateParts (bộ câu nhỏ) trong phần này */}
                        <Form.List name={[name, 'QuestionGroups']}>
                            {(questionGroupFields, { add: addQuestionGroup, remove: removeQuestionGroup, move: moveQuestionGroup }) => {
                              const skill = form.getFieldValue(['parts', name, 'Skill'])
                              const questionTypesForSkill = getQuestionTypesBySkill(skill)
                              
                              // Khi thêm bộ câu mới, tự động thêm Skill từ Part cha và bật chế độ edit
                              const handleAddQuestionGroup = () => {
                                if (isActiveTemplate) return
                                addQuestionGroup({ Skill: skill })
                                // Sau khi thêm, bật chế độ edit cho bộ câu mới (sẽ được xử lý trong map)
                              }

                              // Di chuyển bộ câu lên với animation
                              const handleMoveUp = (currentIndex) => {
                                if (currentIndex > 0) {
                                  Modal.confirm({
                                    title: 'Xác nhận di chuyển',
                                    content: 'Bạn có chắc muốn di chuyển bộ câu này lên trên?',
                                    okText: 'Xác nhận',
                                    cancelText: 'Hủy',
                                    onOk: () => {
                                      moveQuestionGroup(currentIndex, currentIndex - 1)
                                    },
                                  })
                                }
                              }

                              // Di chuyển bộ câu xuống với animation
                              const handleMoveDown = (currentIndex) => {
                                if (currentIndex < questionGroupFields.length - 1) {
                                  Modal.confirm({
                                    title: 'Xác nhận di chuyển',
                                    content: 'Bạn có chắc muốn di chuyển bộ câu này xuống dưới?',
                                    okText: 'Xác nhận',
                                    cancelText: 'Hủy',
                                    onOk: () => {
                                      moveQuestionGroup(currentIndex, currentIndex + 1)
                                    },
                                  })
                                }
                              }

                              // Hàm kiểm tra trùng lặp phạm vi câu hỏi
                              // - Không cho trùng trong cùng phần
                              // - Không cho trùng giữa các phần khác nhau (ví dụ Nghe 1-20 thì Đọc không được dùng lại 1-20)
                              const validateQuestionRange = (currentGroupIndex, fromValue, toValue) => {
                                if (!fromValue || !toValue) {
                                  return Promise.resolve() // Chưa chọn đủ thì không validate
                                }
                                
                                if (fromValue > toValue) {
                                  return Promise.reject(new Error('Từ câu phải nhỏ hơn hoặc bằng Đến câu'))
                                }

                                // Lấy tất cả các phần và bộ câu trong form
                                const allParts = form.getFieldValue('parts') || []

                                for (let partIndex = 0; partIndex < allParts.length; partIndex++) {
                                  const part = allParts[partIndex]
                                  const partSkill = part?.Skill
                                  const allGroups = part?.QuestionGroups || []

                                  for (let i = 0; i < allGroups.length; i++) {
                                    // Bỏ qua chính bộ câu hiện tại (cùng phần + cùng index)
                                    if (partIndex === name && i === currentGroupIndex) continue

                                    const otherFrom = allGroups[i]?.QuestionFrom
                                    const otherTo = allGroups[i]?.QuestionTo

                                    if (!otherFrom || !otherTo) continue // Bỏ qua nếu chưa có đủ thông tin

                                    // Kiểm tra trùng lặp: có overlap giữa [fromValue, toValue] và [otherFrom, otherTo]
                                    const isOverlap =
                                      (fromValue >= otherFrom && fromValue <= otherTo) ||
                                      (toValue >= otherFrom && toValue <= otherTo) ||
                                      (fromValue <= otherFrom && toValue >= otherTo)

                                    if (isOverlap) {
                                      const skillLabel = getSkillLabel(partSkill)
                                      return Promise.reject(
                                        new Error(
                                          `Phạm vi câu ${fromValue}-${toValue} đã được sử dụng ở phần ${skillLabel} (câu ${otherFrom}-${otherTo})`
                                        )
                                      )
                                    }
                                  }
                                }

                                return Promise.resolve()
                              }

                              return (
                                <div>
                                  {questionGroupFields.length === 0 ? (
                                    <div style={{ 
                                      padding: '24px', 
                                      textAlign: 'center', 
                                      border: '1px dashed #d9d9d9', 
                                      borderRadius: 4,
                                      backgroundColor: '#fafafa'
                                    }}>
                                      <div style={{ marginBottom: 12, color: '#666' }}>
                                        Phần này chưa có bộ câu nào. Hãy thêm bộ câu để bắt đầu.
                                      </div>
                                      <Button
                                        type="primary"
                                        icon={<PlusOutlined />}
                                        onClick={handleAddQuestionGroup}
                                        size="middle"
                                        style={{ fontSize: 13 }}
                                      >
                                        Thêm bộ câu
                                      </Button>
                                    </div>
                                  ) : (
                                    <>
                                      {questionGroupFields.map(({ key: groupKey, name: groupName, ...groupRestField }, groupIndex) => {
                                        // Tạo unique key cho group để track collapse state và edit state
                                        const groupUniqueKey = `${name}-${groupName}`
                                        const isCollapsed = collapsedGroups.has(groupUniqueKey)
                                        const isEditing = editingGroups.has(groupUniqueKey)
                                        
                                        const toggleCollapse = () => {
                                          setCollapsedGroups((prev) => {
                                            const newSet = new Set(prev)
                                            if (newSet.has(groupUniqueKey)) {
                                              newSet.delete(groupUniqueKey)
                                            } else {
                                              newSet.add(groupUniqueKey)
                                            }
                                            return newSet
                                          })
                                        }

                                        const handleEdit = () => {
                                          if (isActiveTemplate) return
                                          Modal.confirm({
                                            title: 'Xác nhận chỉnh sửa',
                                            content: 'Bạn có muốn chỉnh sửa bộ câu này?',
                                            okText: 'Chỉnh sửa',
                                            cancelText: 'Hủy',
                                            onOk: () => {
                                              // Lấy giá trị hiện tại của group
                                              const currentGroupValues = form.getFieldValue(['parts', name, 'QuestionGroups', groupName]) || {}
                                              
                                              // Normalize ExampleUrl nếu là string URL (từ database)
                                              if (currentGroupValues.ExampleUrl && typeof currentGroupValues.ExampleUrl === 'string') {
                                                // Chuyển string URL thành fileList format
                                                const normalizedExampleUrl = [{
                                                  uid: '-1',
                                                  name: 'image.png',
                                                  status: 'done',
                                                  url: currentGroupValues.ExampleUrl
                                                }]
                                                
                                                // Cập nhật lại giá trị trong form
                                                form.setFieldsValue({
                                                  [`parts.${name}.QuestionGroups.${groupName}.ExampleUrl`]: normalizedExampleUrl
                                                })
                                              }
                                              
                                              setEditingGroups((prev) => {
                                                const newSet = new Set(prev)
                                                newSet.add(groupUniqueKey)
                                                return newSet
                                              })
                                            },
                                          })
                                        }

                                        const handleCancelEdit = () => {
                                          if (isActiveTemplate) return
                                          Modal.confirm({
                                            title: 'Hủy chỉnh sửa',
                                            content: 'Bạn có chắc muốn hủy chỉnh sửa? Tất cả thay đổi chưa lưu sẽ bị mất.',
                                            okText: 'Hủy chỉnh sửa',
                                            cancelText: 'Tiếp tục chỉnh sửa',
                                            onOk: () => {
                                              // Reset form values về giá trị ban đầu
                                              const currentValues = form.getFieldValue(['parts', name, 'QuestionGroups', groupName])
                                              form.setFieldsValue({
                                                [`parts.${name}.QuestionGroups.${groupName}`]: currentValues
                                              })
                                              setEditingGroups((prev) => {
                                                const newSet = new Set(prev)
                                                newSet.delete(groupUniqueKey)
                                                return newSet
                                              })
                                            },
                                          })
                                        }

                                        // Hàm xử lý khi bấm "Hoàn tất" để lưu và gọi API
                                        const handleFinishEdit = async () => {
                                          try {
                                            if (isActiveTemplate) return
                                            // Validate form fields trước khi submit
                                            const groupFieldPath = ['parts', name, 'QuestionGroups', groupName]
                                            
                                            // Validate các fields con của group này
                                            const fieldsToValidate = [
                                              [...groupFieldPath, 'QuestionTypeId'],
                                              [...groupFieldPath, 'QuestionFrom'],
                                              [...groupFieldPath, 'QuestionTo'],
                                              [...groupFieldPath, 'Mark'],
                                              [...groupFieldPath, 'PartTitle'],
                                              [...groupFieldPath, 'Instruction'],
                                            ]
                                            
                                            try {
                                              await form.validateFields(fieldsToValidate)
                                            } catch (error) {
                                              // Nếu có lỗi validation, Ant Design sẽ tự động hiển thị message
                                              return
                                            }

                                            // Lấy giá trị sau khi validate
                                            const groupValues = form.getFieldValue(groupFieldPath) || {}
                                            
                                            // Kiểm tra TemplatePartId - phải có để update
                                            if (!groupValues.TemplatePartId) {
                                              message.error('Không tìm thấy ID của bộ câu. Vui lòng thử lại.')
                                              return
                                            }

                                            // Kiểm tra trạng thái - chỉ cho phép update khi status = 0 (Nháp)
                                            const currentStatus = examTemplate?.status ?? 0
                                            if (currentStatus !== 0) {
                                              message.error('Chỉ có thể cập nhật parts khi mẫu đề ở trạng thái Nháp')
                                              return
                                            }

                                            setLoading(true)

                                            // Lấy ExampleUrl từ form field trực tiếp
                                            const exampleUrlFieldPath = ['parts', name, 'QuestionGroups', groupName, 'ExampleUrl']
                                            const exampleUrlValue = form.getFieldValue(exampleUrlFieldPath) || groupValues?.ExampleUrl
                                            
                                            let exampleUrl = null
                                            
                                            // Xử lý upload ảnh nếu có
                                            if (exampleUrlValue) {
                                              // Nếu là array (fileList từ Upload component)
                                              if (Array.isArray(exampleUrlValue) && exampleUrlValue.length > 0) {
                                                const fileItem = exampleUrlValue[0]
                                                
                                                // Kiểm tra xem có originFileObj không (file chưa upload)
                                                if (fileItem?.originFileObj) {
                                                  try {
                                                    // Upload file lên Cloudinary
                                                    const imageUrl = await uploadTemplatePartImageToCloudinary(fileItem.originFileObj)
                                                    if (imageUrl) {
                                                      exampleUrl = imageUrl
                                                    }
                                                  } catch (error) {
                                                    console.error('Error uploading image:', error)
                                                    message.error(`Lỗi upload ảnh: ${error.message || 'Upload thất bại'}`)
                                                    setLoading(false)
                                                    return
                                                  }
                                                } 
                                                // Nếu đã có URL từ Cloudinary (http/https)
                                                else if (fileItem?.url && (fileItem.url.startsWith('http://') || fileItem.url.startsWith('https://'))) {
                                                  exampleUrl = fileItem.url
                                                }
                                                // Nếu là base64 preview nhưng không có originFileObj
                                                else if (fileItem?.url && fileItem.url.startsWith('data:')) {
                                                  message.warning('Ảnh đã được chọn nhưng không thể upload. Vui lòng chọn lại ảnh.')
                                                  setLoading(false)
                                                  return
                                                }
                                              } 
                                              // Nếu đã là string URL (từ database hoặc đã upload trước đó)
                                              else if (typeof exampleUrlValue === 'string') {
                                                exampleUrl = exampleUrlValue
                                              }
                                            }

                                            // Format payload để gửi lên API
                                            // Lấy Skill từ Part cha hoặc từ group
                                            const partSkill = form.getFieldValue(['parts', name, 'Skill'])
                                            const updatePayload = {
                                              examTemplateId: examTemplateId,
                                              PartTitle: groupValues.PartTitle,
                                              Skill: groupValues.Skill || partSkill,
                                              QuestionFrom: groupValues.QuestionFrom,
                                              QuestionTo: groupValues.QuestionTo,
                                              Instruction: groupValues.Instruction,
                                              Mark: groupValues.Mark,
                                              QuestionTypeId: groupValues.QuestionTypeId,
                                              ExampleUrl: exampleUrl || null,
                                            }

                                            // Gọi API để cập nhật
                                            await updateTemplatePart(groupValues.TemplatePartId, updatePayload)
                                            
                                            // Cập nhật lại ExampleUrl trong form nếu đã upload
                                            if (exampleUrl) {
                                              form.setFieldsValue({
                                                [`parts.${name}.QuestionGroups.${groupName}.ExampleUrl`]: [{
                                                  uid: '-1',
                                                  name: 'image.png',
                                                  status: 'done',
                                                  url: exampleUrl
                                                }]
                                              })
                                            }

                                            // Tắt chế độ chỉnh sửa
                                            setEditingGroups((prev) => {
                                              const newSet = new Set(prev)
                                              newSet.delete(groupUniqueKey)
                                              return newSet
                                            })

                                            message.success('Đã cập nhật bộ câu thành công')
                                            
                                            // Gọi callback để component cha reload lại dữ liệu
                                            if (onPartsAdded) {
                                              onPartsAdded()
                                            }
                                          } catch (error) {
                                            console.error('Error updating template part:', error)
                                            message.error(error.message || 'Cập nhật bộ câu thất bại')
                                          } finally {
                                            setLoading(false)
                                          }
                                        }
                                        
                                        return (
                                        <Form.Item 
                                          key={`question-range-${groupKey}`}
                                          noStyle 
                                          shouldUpdate={(prev, curr) => {
                                            const prevFrom = prev?.parts?.[name]?.QuestionGroups?.[groupName]?.QuestionFrom
                                            const prevTo = prev?.parts?.[name]?.QuestionGroups?.[groupName]?.QuestionTo
                                            const currFrom = curr?.parts?.[name]?.QuestionGroups?.[groupName]?.QuestionFrom
                                            const currTo = curr?.parts?.[name]?.QuestionGroups?.[groupName]?.QuestionTo
                                            return prevFrom !== currFrom || prevTo !== currTo
                                          }}
                                        >
                                          {({ getFieldValue }) => {
                                            const questionFrom = getFieldValue(['parts', name, 'QuestionGroups', groupName, 'QuestionFrom'])
                                            const questionTo = getFieldValue(['parts', name, 'QuestionGroups', groupName, 'QuestionTo'])
                                            const cardTitle = questionFrom && questionTo 
                                              ? `Bộ câu từ ${questionFrom} - ${questionTo}`
                                              : `Bộ câu ${groupIndex + 1}`
                                            
                                            return (
                                            <Card
                                              key={groupKey}
                                              data-group-key={`${name}-${groupName}`}
                                              size="small"
                                              title={<span style={{ fontSize: 14 }}>{cardTitle}</span>}
                                              style={{
                                                marginBottom: 12,
                                                transition: 'all 0.3s ease-in-out',
                                                transform: 'translateY(0)',
                                              }}
                                          extra={
                                            <Space size="small">
                                              {/* Nút ẩn/hiển thị luôn cho phép để tiện xem nội dung */}
                                              <Button
                                                type="text"
                                                icon={isCollapsed ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                                                onClick={toggleCollapse}
                                                size="small"
                                                style={{ fontSize: 13 }}
                                                title={isCollapsed ? 'Hiển thị' : 'Ẩn'}
                                              />
                                              {!isActiveTemplate && (
                                                <>
                                                  {!isEditing ? (
                                                    <>
                                                      {/* Nút chỉnh sửa */}
                                                      <Button
                                                        type="text"
                                                        icon={<EditOutlined />}
                                                        onClick={handleEdit}
                                                        size="small"
                                                        style={{ fontSize: 13 }}
                                                        title="Chỉnh sửa"
                                                      />
                                                      {/* Nút di chuyển lên */}
                                                      <Button
                                                        type="text"
                                                        icon={<UpOutlined />}
                                                        onClick={() => handleMoveUp(groupIndex)}
                                                        disabled={groupIndex === 0}
                                                        size="small"
                                                        style={{ fontSize: 13 }}
                                                        title="Di chuyển lên"
                                                      />
                                                      {/* Nút di chuyển xuống */}
                                                      <Button
                                                        type="text"
                                                        icon={<DownOutlined />}
                                                        onClick={() => handleMoveDown(groupIndex)}
                                                        disabled={groupIndex === questionGroupFields.length - 1}
                                                        size="small"
                                                        style={{ fontSize: 13 }}
                                                        title="Di chuyển xuống"
                                                      />
                                                      {/* Nút xóa */}
                                                      {questionGroupFields.length > 1 && (
                                                        <Button
                                                          type="text"
                                                          danger
                                                          icon={<DeleteOutlined />}
                                                          onClick={() => {
                                                            Modal.confirm({
                                                              title: 'Xác nhận xóa',
                                                              content: 'Bạn có chắc muốn xóa bộ câu này? Hành động này không thể hoàn tác.',
                                                              okText: 'Xóa',
                                                              cancelText: 'Hủy',
                                                              okType: 'danger',
                                                              onOk: () => {
                                                                removeQuestionGroup(groupName)
                                                              },
                                                            })
                                                          }}
                                                          size="small"
                                                          style={{ fontSize: 13 }}
                                                          title="Xóa"
                                                        />
                                                      )}
                                                    </>
                                                  ) : (
                                                    <>
                                                      {/* Nút hoàn tất */}
                                                      <Button
                                                        type="primary"
                                                        onClick={handleFinishEdit}
                                                        size="small"
                                                        style={{ fontSize: 13 }}
                                                        title="Hoàn tất"
                                                        loading={loading}
                                                      >
                                                        Hoàn tất
                                                      </Button>
                                                      {/* Nút hủy chỉnh sửa */}
                                                      <Button
                                                        type="text"
                                                        icon={<CloseOutlined />}
                                                        onClick={handleCancelEdit}
                                                        size="small"
                                                        style={{ fontSize: 13 }}
                                                        title="Hủy chỉnh sửa"
                                                        disabled={loading}
                                                      />
                                                    </>
                                                  )}
                                                </>
                                              )}
                                            </Space>
                                          }
                                          styles={{ 
                                            body: {
                                              padding: isCollapsed ? 0 : 16,
                                              transition: 'padding 0.3s ease-in-out, max-height 0.3s ease-in-out',
                                              overflow: 'hidden',
                                              maxHeight: isCollapsed ? 0 : 'none',
                                            }
                                          }}
                                        >
                                          {!isCollapsed && (
                                            <>
                                              {!isEditing ? (
                                                // Hiển thị thông tin dạng text khi không chỉnh sửa
                                                <Form.Item 
                                                  key={`descriptions-${groupKey}`}
                                                  noStyle 
                                                  shouldUpdate={(prev, curr) => {
                                                    const prevValues = prev?.parts?.[name]?.QuestionGroups?.[groupName]
                                                    const currValues = curr?.parts?.[name]?.QuestionGroups?.[groupName]
                                                    return JSON.stringify(prevValues) !== JSON.stringify(currValues)
                                                  }}
                                                >
                                                  {() => {
                                                    const groupValues = form.getFieldValue(['parts', name, 'QuestionGroups', groupName]) || {}
                                                    const questionTypeLabel = questionTypesForSkill.find(qt => qt.value === groupValues.QuestionTypeId)?.label || '-'
                                                    
                                                    return (
                                                      <Descriptions
                                                        column={1}
                                                        size="small"
                                                        styles={{ 
                                                          label: { fontSize: 13, fontWeight: 500, width: '140px' },
                                                          content: { fontSize: 13 }
                                                        }}
                                                      >
                                                        <Descriptions.Item label="Dạng câu hỏi">
                                                          {questionTypeLabel}
                                                        </Descriptions.Item>
                                                        <Descriptions.Item label="Từ câu">
                                                          {groupValues.QuestionFrom || '-'}
                                                        </Descriptions.Item>
                                                        <Descriptions.Item label="Đến câu">
                                                          {groupValues.QuestionTo || '-'}
                                                        </Descriptions.Item>
                                                        <Descriptions.Item label="Điểm mỗi câu">
                                                          {groupValues.Mark || '-'}
                                                        </Descriptions.Item>
                                                        <Descriptions.Item label="Tiêu đề (Tiếng Việt)">
                                                          {groupValues.PartTitle || '-'}
                                                        </Descriptions.Item>
                                                        <Descriptions.Item label="Hướng dẫn (Tiếng Hàn)">
                                                          {groupValues.Instruction || '-'}
                                                        </Descriptions.Item>
                                                        {groupValues.ExampleUrl && (
                                                          <Descriptions.Item label="Ảnh ví dụ">
                                                            <img 
                                                              src={groupValues.ExampleUrl} 
                                                              alt="Ví dụ" 
                                                              style={{ 
                                                                maxWidth: '200px', 
                                                                maxHeight: '150px', 
                                                                objectFit: 'contain',
                                                                borderRadius: 4,
                                                                border: '1px solid #d9d9d9'
                                                              }} 
                                                            />
                                                          </Descriptions.Item>
                                                        )}
                                                      </Descriptions>
                                                    )
                                                  }}
                                                </Form.Item>
                                              ) : (
                                                // Hiển thị form fields khi đang chỉnh sửa
                                                <div 
                                                  style={{ 
                                                    display: 'grid',
                                                    gridTemplateColumns: '1fr 1fr',
                                                    gap: '12px',
                                                  }}
                                                >
                                                  {/* Skill field ẩn - tự động lấy từ Part cha */}
                                                  <Form.Item
                                                    {...groupRestField}
                                                    name={[groupName, 'Skill']}
                                                    hidden
                                                  >
                                                    <Input type="hidden" />
                                                  </Form.Item>
                                                  
                                                  {/* QuestionTypeId: Foreign key trỏ đến bảng QuestionTypes để lấy thông tin dạng câu hỏi */}
                                                  <Form.Item
                                                    {...groupRestField}
                                                    name={[groupName, 'QuestionTypeId']}
                                                    label={<span style={{ fontSize: 13 }}>Dạng câu hỏi</span>}
                                                    rules={[{ required: true, message: 'Vui lòng chọn dạng câu hỏi' }]}
                                                    style={{ gridColumn: '1 / -1', marginBottom: 0 }}
                                                  >
                                                    <Select
                                                      placeholder={
                                                        loadingQuestionTypes[skill] 
                                                          ? "Đang tải dạng câu hỏi..." 
                                                          : skill 
                                                            ? "Chọn dạng câu hỏi" 
                                                            : "Vui lòng chọn skill trước"
                                                      }
                                                      size="middle"
                                                      options={questionTypesForSkill} // Lọc theo Skill của Part
                                                      disabled={!skill || loadingQuestionTypes[skill]}
                                                      loading={loadingQuestionTypes[skill]}
                                                      style={{ fontSize: 13 }}
                                                      showSearch
                                                      filterOption={(input, option) =>
                                                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                                      }
                                                    />
                                                  </Form.Item>

                                                  {/* Từ câu, Đến câu, Điểm mỗi câu nằm cùng 1 hàng khi chỉnh sửa */}
                                                  <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                                                    <Form.Item
                                                      {...groupRestField}
                                                      name={[groupName, 'QuestionFrom']}
                                                      label={<span style={{ fontSize: 13 }}>Từ câu</span>}
                                                      rules={[
                                                        { required: true, message: 'Vui lòng chọn từ câu' },
                                                        {
                                                          validator: (_, value) => {
                                                            const questionTo = form.getFieldValue(['parts', name, 'QuestionGroups', groupName, 'QuestionTo'])
                                                            return validateQuestionRange(groupName, value, questionTo)
                                                          },
                                                        },
                                                      ]}
                                                      dependencies={[[name, 'QuestionGroups']]}
                                                      style={{ marginBottom: 0 }}
                                                    >
                                                      <Select
                                                        placeholder="Chọn từ câu"
                                                        size="middle"
                                                        style={{ fontSize: 13 }}
                                                        options={Array.from({ length: 120 }, (_, i) => ({
                                                          value: i + 1,
                                                          label: i + 1,
                                                        }))}
                                                      />
                                                    </Form.Item>

                                                    <Form.Item
                                                      {...groupRestField}
                                                      name={[groupName, 'QuestionTo']}
                                                      label={<span style={{ fontSize: 13 }}>Đến câu</span>}
                                                      rules={[
                                                        { required: true, message: 'Vui lòng chọn đến câu' },
                                                        {
                                                          validator: (_, value) => {
                                                            const questionFrom = form.getFieldValue(['parts', name, 'QuestionGroups', groupName, 'QuestionFrom'])
                                                            return validateQuestionRange(groupName, questionFrom, value)
                                                          },
                                                        },
                                                      ]}
                                                      dependencies={[[name, 'QuestionGroups']]}
                                                      style={{ marginBottom: 0 }}
                                                    >
                                                      <Select
                                                        placeholder="Chọn đến câu"
                                                        size="middle"
                                                        style={{ fontSize: 13 }}
                                                        options={Array.from({ length: 50 }, (_, i) => ({
                                                          value: i + 1,
                                                          label: i + 1,
                                                        }))}
                                                      />
                                                    </Form.Item>

                                                    <Form.Item
                                                      {...groupRestField}
                                                      name={[groupName, 'Mark']}
                                                      label={<span style={{ fontSize: 13 }}>Điểm mỗi câu</span>}
                                                      rules={[
                                                      { required: true, message: 'Vui lòng nhập số điểm' },
                                                      {
                                                        validator: (_, value) => {
                                                          if (value === undefined || value === null) {
                                                            return Promise.reject(new Error('Vui lòng nhập số điểm'))
                                                          }
                                                          if (!Number.isInteger(value)) {
                                                            return Promise.reject(new Error('Điểm phải là số nguyên'))
                                                          }
                                                          if (value < 0) {
                                                            return Promise.reject(new Error('Điểm phải >= 0'))
                                                          }
                                                          return Promise.resolve()
                                                        },
                                                      },
                                                      ]}
                                                      style={{ marginBottom: 0 }}
                                                    >
                                                      <InputNumber
                                                      placeholder="VD: 1"
                                                      min={0}
                                                      step={1}
                                                      precision={0}
                                                        style={{ width: '100%', fontSize: 13 }}
                                                        size="middle"
                                                      />
                                                    </Form.Item>
                                                  </div>

                                                  <Form.Item
                                                    {...groupRestField}
                                                    name={[groupName, 'PartTitle']}
                                                    label={<span style={{ fontSize: 13 }}>Tiêu đề (Tiếng Việt)</span>}
                                                    rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
                                                    style={{ gridColumn: '1 / -1', marginBottom: 0 }}
                                                  >
                                                    <Input
                                                      placeholder="VD: Đọc hiểu đoạn văn ngắn"
                                                      size="middle"
                                                      style={{ fontSize: 13 }}
                                                    />
                                                  </Form.Item>

                                                  <Form.Item
                                                    {...groupRestField}
                                                    name={[groupName, 'Instruction']}
                                                    label={<span style={{ fontSize: 13 }}>Hướng dẫn (Tiếng Hàn)</span>}
                                                    rules={[{ required: true, message: 'Vui lòng nhập hướng dẫn' }]}
                                                    style={{ gridColumn: '1 / -1', marginBottom: 0 }}
                                                  >
                                                    <TextArea
                                                      rows={2}
                                                      placeholder="VD: 다음을 읽고 맞는 답을 고르세요"
                                                      size="middle"
                                                      style={{ fontSize: 13 }}
                                                    />
                                                  </Form.Item>

                                                  <Form.Item
                                                    {...groupRestField}
                                                    name={[groupName, 'ExampleUrl']}
                                                    label={<span style={{ fontSize: 13 }}>Ảnh ví dụ</span>}
                                                    style={{ gridColumn: '1 / -1', marginBottom: 0 }}
                                                    valuePropName="fileList"
                                                    getValueFromEvent={(e) => {
                                                      if (Array.isArray(e)) {
                                                        return e
                                                      }
                                                      return e?.fileList || []
                                                    }}
                                                    normalize={(value) => {
                                                      // Nếu không có giá trị, trả về mảng rỗng
                                                      if (!value) return []
                                                      
                                                      // Nếu đã là array (fileList), giữ nguyên để không làm mất originFileObj
                                                      if (Array.isArray(value)) {
                                                        return value
                                                      }
                                                      
                                                      // Nếu là string URL (từ database), chuyển thành fileList format
                                                      if (typeof value === 'string') {
                                                        return [{
                                                          uid: '-1',
                                                          name: 'image.png',
                                                          status: 'done',
                                                          url: value
                                                        }]
                                                      }
                                                      
                                                      // Trường hợp khác, trả về mảng rỗng
                                                      return []
                                                    }}
                                                  >
                                                    <ImageUploadField />
                                                  </Form.Item>
                                                </div>
                                              )}
                                            </>
                                          )}
                                          {/* Template chỉ là mẫu, chưa có chọn câu hỏi từ ngân hàng đề */}
                                          {/* Nút chọn câu hỏi sẽ được thêm khi tạo đề thi thực tế từ template này */}
                                        </Card>
                                            )
                                          }}
                                        </Form.Item>
                                        )
                                      })}

                                      {!isActiveTemplate && (
                                        <Button
                                          type="dashed"
                                          icon={<PlusOutlined />}
                                          onClick={handleAddQuestionGroup}
                                          block
                                          size="middle"
                                          style={{ marginTop: 8, fontSize: 13 }}
                                        >
                                          Thêm bộ câu
                                        </Button>
                                      )}
                                    </>
                                  )}
                                </div>
                              )
                            }}
                          </Form.List>
                      </Space>
                    </Card>
                  )
                })()}

                {!isActiveTemplate && (
                  <>
                    <Divider />
                    <Form.Item>
                      <ButtonV2
                        title={loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                        color="poppy"
                        onPress={() => form.submit()}
                        style={{ minWidth: 120, paddingVertical: 10 }}
                        textStyle={{ fontSize: 14 }}
                      />
                    </Form.Item>
                  </>
                )}
              </>
            )
          }}
        </Form.List>
      </Form>

      {/* Modal chọn skill khi thêm phần mới */}
      <Modal
        title="Chọn kỹ năng cho phần mới"
        open={addPartModalOpen}
        onOk={() => {
          if (!selectedSkillForNewPart) {
            message.warning('Vui lòng chọn kỹ năng')
            return
          }

          // Không cho phép tạo trùng skill (Listening/Reading/Writing)
          if (existingSkills.has(selectedSkillForNewPart)) {
            const existedSkillLabel = getSkillLabel(selectedSkillForNewPart)
            message.error(`Đã tồn tại phần "${existedSkillLabel}". Mỗi kỹ năng chỉ được tạo một phần.`)
            return
          }
          
          // Thêm phần mới với skill đã chọn và mảng questionGroups rỗng
          if (addPartRef.current) {
            addPartRef.current({ 
              Skill: selectedSkillForNewPart,
              QuestionGroups: [] // Phần mới sẽ trống, chưa có bộ câu nào
            })
            setActivePartIndex(partsCountRef.current) // Chuyển sang phần mới vừa thêm
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
            style={{ width: '100%', fontSize: 13 }}
          />
          <div style={{ marginTop: 12, fontSize: 13, color: '#666' }}>
            Sau khi chọn kỹ năng, các dạng câu hỏi sẽ tự động được lọc theo kỹ năng này.
          </div>
        </div>
      </Modal>
    </>
  )
}

