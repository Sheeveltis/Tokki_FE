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
} from 'antd'
import { PlusOutlined, DeleteOutlined, UpOutlined, DownOutlined, EyeOutlined, EyeInvisibleOutlined, EditOutlined, CloseOutlined, UploadOutlined, InboxOutlined } from '@ant-design/icons'
import { ButtonV2 } from '../../../../../../components/buttonV2.jsx'
// TODO: Thay thế bằng API thực tế khi có
// import { updateExamTemplateParts } from '../../api'
// import { useQuestionTypesQuery } from '../../api/useAdminQueries'

const { Title } = Typography
const { TextArea } = Input

const MAX_PARTS = 3

// Mock data cho QuestionTypes - sẽ thay bằng API query
const mockQuestionTypes = [
  {
    QuestionTypeId: 1,
    Code: 'MCQ',
    Name: 'Multiple Choice',
    Description: 'Câu hỏi trắc nghiệm',
    Skill: 'Reading',
    DifficultyLevel: 'medium',
    IsActive: true,
  },
  {
    QuestionTypeId: 2,
    Code: 'FIB',
    Name: 'Fill in the Blank',
    Description: 'Điền vào chỗ trống',
    Skill: 'Reading',
    DifficultyLevel: 'easy',
    IsActive: true,
  },
  {
    QuestionTypeId: 3,
    Code: 'LISTEN',
    Name: 'Listening Comprehension',
    Description: 'Nghe hiểu',
    Skill: 'Listening',
    DifficultyLevel: 'medium',
    IsActive: true,
  },
]

const skillOptions = [
  { value: 'Reading', label: 'Reading' },
  { value: 'Listening', label: 'Listening' },
  { value: 'Writing', label: 'Writing' },
]

export default function ExamTemplatePartsForm({ examTemplateId, initialParts = [] }) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [activePartIndex, setActivePartIndex] = useState(0)
  const [addPartModalOpen, setAddPartModalOpen] = useState(false)
  const [selectedSkillForNewPart, setSelectedSkillForNewPart] = useState(null)
  const [collapsedGroups, setCollapsedGroups] = useState(new Set()) // Track các bộ câu đang được collapse
  const [editingGroups, setEditingGroups] = useState(new Set()) // Track các bộ câu đang ở chế độ chỉnh sửa
  const addPartRef = React.useRef(null) // Ref để lưu hàm add từ Form.List
  const partsCountRef = React.useRef(0) // Ref để lưu số lượng phần hiện tại
  // TODO: Thay bằng API query
  // const { data: questionTypes = [] } = useQuestionTypesQuery()
  const questionTypes = mockQuestionTypes

  // Set initial values
  useEffect(() => {
    if (initialParts.length > 0) {
      form.setFieldsValue({ parts: initialParts })
    } else {
      // Nếu chưa có phần nào, tạo 1 phần trống
      form.setFieldsValue({ parts: [{}] })
    }
  }, [initialParts, form])

  const handleSubmit = async (values) => {
    try {
      setLoading(true)
      
      // Format data để gửi lên API theo schema TemplateParts
      // Mỗi phần (Part) có Skill, và trong phần đó có nhiều TemplateParts (QuestionGroups)
      // Mỗi TemplatePart cần có: Skill (từ Part cha hoặc từ chính nó), QuestionFrom, QuestionTo, PartTitle, Instruction, Mark, ExampleUrl, QuestionTypeId
      const templateParts = []
      
      if (values.parts && Array.isArray(values.parts)) {
        values.parts.forEach((part) => {
          const partSkill = part.Skill // Skill từ Part cha
          const questionGroups = part.QuestionGroups || []
          
          questionGroups.forEach((group) => {
            templateParts.push({
              // TemplatePartId sẽ được tạo ở backend nếu là mới
              ExamTemplateId: examTemplateId,
              Skill: group.Skill || partSkill, // Ưu tiên Skill từ group, nếu không có thì lấy từ Part cha
              QuestionFrom: group.QuestionFrom,
              QuestionTo: group.QuestionTo,
              PartTitle: group.PartTitle,
              Instruction: group.Instruction,
              Mark: group.Mark,
              ExampleUrl: group.ExampleUrl || null, // Cho phép null
              QuestionTypeId: group.QuestionTypeId, // Foreign key trỏ đến QuestionTypes table
            })
          })
        })
      }

      const payload = {
        examTemplateId,
        templateParts: templateParts, // Gửi mảng các TemplateParts
      }

      // TODO: Thay bằng API call thực tế
      // await updateExamTemplateParts(examTemplateId, payload.templateParts)
      console.log('Payload:', payload)
      console.log('TemplateParts:', templateParts)
      
      // Sau khi lưu thành công, tắt chế độ chỉnh sửa cho tất cả các bộ câu
      setEditingGroups(new Set())
      
      message.success('Đã cập nhật các phần của đề thi thành công')
    } catch (error) {
      message.error(error.message || 'Cập nhật thất bại')
    } finally {
      setLoading(false)
    }
  }

  // Lọc question types theo skill
  // QuestionTypeId là foreign key trỏ đến bảng QuestionTypes để lấy thông tin dạng câu hỏi
  const getQuestionTypesBySkill = (skill) => {
    if (!skill) return []
    return questionTypes
      .filter((qt) => qt.Skill === skill && qt.IsActive)
      .map((qt) => ({
        value: qt.QuestionTypeId, // QuestionTypeId trỏ đến QuestionTypes table
        label: `${qt.Code} - ${qt.Name}`,
        description: qt.Description,
      }))
  }

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
          parts: initialParts.length > 0 ? initialParts : [{}], // Bắt đầu với 1 part trống nếu chưa có
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
              if (canAddMore) {
                setAddPartModalOpen(true)
              }
            }

            const handleRemovePart = (index) => {
              if (partsCount > 1) {
                remove(index)
                // Nếu xóa phần đang active, chuyển sang phần trước đó
                if (activePartIndex >= partsCount - 1) {
                  setActivePartIndex(Math.max(0, activePartIndex - 1))
                }
              } else {
                message.warning('Phải có ít nhất 1 phần')
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
                  
                  {canAddMore && (
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

                {/* Hiển thị form của phần đang active */}
                {fields.length > 0 && fields[validActiveIndex] && (() => {
                  const { key, name, ...restField } = fields[validActiveIndex]
                  
                  return (
                    <Card
                      key={key}
                      size="small"
                      title={`Phần ${validActiveIndex + 1}`}
                      extra={
                        partsCount > 1 ? (
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleRemovePart(name)}
                          >
                            Xóa phần
                          </Button>
                        ) : null
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
                              const validateQuestionRange = (currentGroupIndex, fromValue, toValue) => {
                                if (!fromValue || !toValue) {
                                  return Promise.resolve() // Chưa chọn đủ thì không validate
                                }
                                
                                if (fromValue > toValue) {
                                  return Promise.reject(new Error('Từ câu phải nhỏ hơn hoặc bằng Đến câu'))
                                }

                                // Lấy tất cả các bộ câu trong phần này
                                const allGroups = form.getFieldValue(['parts', name, 'QuestionGroups']) || []
                                
                                // Kiểm tra trùng với các bộ câu khác (trừ bộ câu hiện tại)
                                for (let i = 0; i < allGroups.length; i++) {
                                  if (i === currentGroupIndex) continue // Bỏ qua bộ câu hiện tại
                                  
                                  const otherFrom = allGroups[i]?.QuestionFrom
                                  const otherTo = allGroups[i]?.QuestionTo
                                  
                                  if (!otherFrom || !otherTo) continue // Bỏ qua nếu chưa có đủ thông tin
                                  
                                  // Kiểm tra trùng lặp: có overlap giữa [fromValue, toValue] và [otherFrom, otherTo]
                                  if (
                                    (fromValue >= otherFrom && fromValue <= otherTo) ||
                                    (toValue >= otherFrom && toValue <= otherTo) ||
                                    (fromValue <= otherFrom && toValue >= otherTo)
                                  ) {
                                    return Promise.reject(
                                      new Error(`Phạm vi câu ${fromValue}-${toValue} đã được sử dụng bởi bộ câu khác (${otherFrom}-${otherTo})`)
                                    )
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
                                          setEditingGroups((prev) => {
                                            const newSet = new Set(prev)
                                            newSet.add(groupUniqueKey)
                                            return newSet
                                          })
                                        }

                                        const handleCancelEdit = () => {
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
                                        
                                        return (
                                        <Form.Item noStyle shouldUpdate={(prev, curr) => {
                                          const prevFrom = prev?.parts?.[name]?.QuestionGroups?.[groupName]?.QuestionFrom
                                          const prevTo = prev?.parts?.[name]?.QuestionGroups?.[groupName]?.QuestionTo
                                          const currFrom = curr?.parts?.[name]?.QuestionGroups?.[groupName]?.QuestionFrom
                                          const currTo = curr?.parts?.[name]?.QuestionGroups?.[groupName]?.QuestionTo
                                          return prevFrom !== currFrom || prevTo !== currTo
                                        }}>
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
                                                  {/* Nút ẩn/hiển thị */}
                                                  <Button
                                                    type="text"
                                                    icon={isCollapsed ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                                                    onClick={toggleCollapse}
                                                    size="small"
                                                    style={{ fontSize: 13 }}
                                                    title={isCollapsed ? 'Hiển thị' : 'Ẩn'}
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
                                                  {/* Nút hủy chỉnh sửa */}
                                                  <Button
                                                    type="text"
                                                    icon={<CloseOutlined />}
                                                    onClick={handleCancelEdit}
                                                    size="small"
                                                    style={{ fontSize: 13 }}
                                                    title="Hủy chỉnh sửa"
                                                  />
                                                </>
                                              )}
                                            </Space>
                                          }
                                          bodyStyle={{ 
                                            padding: isCollapsed ? 0 : 16,
                                            transition: 'padding 0.3s ease-in-out, max-height 0.3s ease-in-out',
                                            overflow: 'hidden',
                                            maxHeight: isCollapsed ? 0 : 'none',
                                          }}
                                        >
                                          {!isCollapsed && (
                                            <>
                                              {!isEditing ? (
                                                // Hiển thị thông tin dạng text khi không chỉnh sửa
                                                <Form.Item noStyle shouldUpdate={(prev, curr) => {
                                                  const prevValues = prev?.parts?.[name]?.QuestionGroups?.[groupName]
                                                  const currValues = curr?.parts?.[name]?.QuestionGroups?.[groupName]
                                                  return JSON.stringify(prevValues) !== JSON.stringify(currValues)
                                                }}>
                                                  {() => {
                                                    const groupValues = form.getFieldValue(['parts', name, 'QuestionGroups', groupName]) || {}
                                                    const questionTypeLabel = questionTypesForSkill.find(qt => qt.value === groupValues.QuestionTypeId)?.label || '-'
                                                    
                                                    return (
                                                      <Descriptions
                                                        column={1}
                                                        size="small"
                                                        labelStyle={{ fontSize: 13, fontWeight: 500, width: '140px' }}
                                                        contentStyle={{ fontSize: 13 }}
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
                                                    initialValue={skill}
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
                                                      placeholder="Chọn dạng câu hỏi"
                                                      size="middle"
                                                      options={questionTypesForSkill} // Lọc theo Skill của Part
                                                      disabled={!skill}
                                                      style={{ fontSize: 13 }}
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
                                                        options={Array.from({ length: 50 }, (_, i) => ({
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
                                                        { type: 'number', min: 0.1, message: 'Phải lớn hơn 0' },
                                                      ]}
                                                      style={{ marginBottom: 0 }}
                                                    >
                                                      <InputNumber
                                                        placeholder="VD: 1.0"
                                                        min={0.1}
                                                        step={0.1}
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
                                                      if (!value) return []
                                                      if (typeof value === 'string') {
                                                        // Nếu là URL string, chuyển thành fileList format
                                                        return [{
                                                          uid: '-1',
                                                          name: 'image.png',
                                                          status: 'done',
                                                          url: value
                                                        }]
                                                      }
                                                      return value
                                                    }}
                                                  >
                                                    {({ value, onChange }) => {
                                                      const handleChange = (info) => {
                                                        let newFileList = [...info.fileList]
                                                        // Chỉ giữ lại file cuối cùng
                                                        newFileList = newFileList.slice(-1)
                                                        // Nếu file đã upload thành công, lưu URL
                                                        newFileList = newFileList.map(file => {
                                                      if (file.response) {
                                                        return {
                                                          ...file,
                                                          url: file.response.url
                                                        }
                                                      }
                                                      return file
                                                    })
                                                        onChange(newFileList)
                                                      }
                                                      
                                                      const beforeUpload = (file) => {
                                                        const reader = new FileReader()
                                                        reader.onload = (e) => {
                                                          const url = e.target?.result
                                                          // Tạo fileList với URL
                                                          const fileList = [{
                                                            uid: file.uid,
                                                            name: file.name,
                                                            status: 'done',
                                                            url: url
                                                          }]
                                                          onChange(fileList)
                                                          // Lưu URL vào form field
                                                          form.setFieldValue(['parts', name, 'QuestionGroups', groupName, 'ExampleUrl'], url)
                                                        }
                                                        reader.readAsDataURL(file)
                                                        return false // Prevent auto upload
                                                      }
                                                      
                                                      const onRemove = () => {
                                                        onChange([])
                                                        form.setFieldValue(['parts', name, 'QuestionGroups', groupName, 'ExampleUrl'], null)
                                                      }
                                                      
                                                      return (
                                                        <Upload.Dragger
                                                          name="file"
                                                          listType="picture"
                                                          maxCount={1}
                                                          accept="image/*"
                                                          fileList={value || []}
                                                          onChange={handleChange}
                                                          beforeUpload={beforeUpload}
                                                          onRemove={onRemove}
                                                          style={{ fontSize: 13 }}
                                                        >
                                                          <p className="ant-upload-drag-icon">
                                                            <InboxOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                                                          </p>
                                                          <p className="ant-upload-text" style={{ fontSize: 13 }}>
                                                            Click hoặc kéo thả ảnh vào đây để upload
                                                          </p>
                                                          <p className="ant-upload-hint" style={{ fontSize: 12, color: '#999' }}>
                                                            Hỗ trợ upload ảnh (JPG, PNG, GIF, etc.)
                                                          </p>
                                                        </Upload.Dragger>
                                                      )
                                                    }}
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
            options={skillOptions}
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

