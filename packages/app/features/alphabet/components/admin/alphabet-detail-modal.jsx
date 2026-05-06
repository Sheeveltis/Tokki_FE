'use client'

import React, { useState, useEffect, useRef, useImperativeHandle } from 'react'
import { Modal, Tabs, Form, Input, InputNumber, Select, Switch, Button, Space, message, Typography, Card, Divider, Tag } from 'antd'
import { PlayCircleOutlined, EditOutlined, SaveOutlined, UndoOutlined, DeleteOutlined, CheckCircleOutlined, InfoCircleOutlined, SettingOutlined } from '@ant-design/icons'
import { ReactSketchCanvas } from 'react-sketch-canvas'
import { GuideStrokes } from '../alphabet-drawing/GuideStrokes.web'

const { TabPane } = Tabs
const { Title, Text, Paragraph } = Typography

// --- CUSTOM ADMIN CANVAS COMPONENT (Supports real-time Shift-snapping) ---
const AdminSketchCanvas = React.forwardRef(({ strokeWidth, strokeColor, isShiftPressed, onStroke }, ref) => {
  const canvasRef = useRef(null)
  const [paths, setPaths] = useState([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentPoints, setCurrentPoints] = useState([])

  const getPos = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    
    // Handle touch or mouse
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    }
  }

  const redraw = (allPaths, tempPoints = []) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    const drawLine = (pts, width, color) => {
      if (pts.length < 1) return
      ctx.beginPath()
      ctx.lineWidth = width
      ctx.strokeStyle = color
      ctx.moveTo(pts[0].x, pts[0].y)
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i].x, pts[i].y)
      }
      ctx.stroke()
    }

    allPaths.forEach(p => drawLine(p.paths, p.strokeWidth, p.strokeColor))
    if (tempPoints.length > 0) drawLine(tempPoints, strokeWidth, strokeColor)
  }

  useImperativeHandle(ref, () => ({
    exportPaths: () => paths,
    clearCanvas: () => {
      setPaths([])
      redraw([])
    },
    undo: () => {
      const newPaths = paths.slice(0, -1)
      setPaths(newPaths)
      redraw(newPaths)
    },
    loadPaths: (p) => {
      setPaths(p)
      redraw(p)
    }
  }))

  const startDrawing = (e) => {
    setIsDrawing(true)
    const pos = getPos(e)
    setCurrentPoints([pos])
    redraw(paths, [pos])
  }

  const drawing = (e) => {
    if (!isDrawing) return
    const pos = getPos(e)
    let newPoints = [...currentPoints]
    
    if (isShiftPressed && newPoints.length > 0) {
      const start = newPoints[0]
      const dx = Math.abs(pos.x - start.x)
      const dy = Math.abs(pos.y - start.y)
      if (dx > dy * 1.5) pos.y = start.y // Snap to horizontal
      else if (dy > dx * 1.5) pos.x = start.x // Snap to vertical
      newPoints = [start, pos]
    } else {
      newPoints.push(pos)
    }
    
    setCurrentPoints(newPoints)
    redraw(paths, newPoints)
  }

  const stopDrawing = () => {
    if (!isDrawing) return
    setIsDrawing(false)
    if (currentPoints.length > 1) {
      const newPath = { paths: currentPoints, strokeWidth, strokeColor }
      const newPaths = [...paths, newPath]
      setPaths(newPaths)
      redraw(newPaths)
      if (onStroke) onStroke(newPath)
    }
    setCurrentPoints([])
  }

  return (
    <canvas
      ref={canvasRef}
      width={1000}
      height={1000}
      style={{ width: '100%', height: '100%', touchAction: 'none', background: 'transparent' }}
      onMouseDown={startDrawing}
      onMouseMove={drawing}
      onMouseUp={stopDrawing}
      onMouseOut={stopDrawing}
      onTouchStart={startDrawing}
      onTouchMove={drawing}
      onTouchEnd={stopDrawing}
    />
  )
})

export default function AlphabetDetailModal({ open, loading, initialValues, onCancel, onSubmit }) {
  const [activeTab, setActiveTab] = useState('info')
  const [form] = Form.useForm()
  
  // Canvas states for Stroke Editor
  const canvasRef = useRef(null)
  const [displayStrokes, setDisplayStrokes] = useState([])
  const [validationStrokes, setValidationStrokes] = useState([])
  const [jsonMode, setJsonMode] = useState('display') // 'display' | 'validation'
  const [isEditing, setIsEditing] = useState(false)
  const [isShiftPressed, setIsShiftPressed] = useState(false)
  const [currentStrokePoints, setCurrentStrokePoints] = useState([])
  
  // Audio state
  const audioRef = useRef(null)

  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === 'Shift') setIsShiftPressed(true) }
    const handleKeyUp = (e) => { if (e.key === 'Shift') setIsShiftPressed(false) }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  useEffect(() => {
    if (open && initialValues) {
      form.setFieldsValue(initialValues)
      
      // Parse JSON data if exists
      const parseStrokes = (jsonField) => {
        if (!jsonField) return []
        try {
          const data = typeof jsonField === 'string' ? JSON.parse(jsonField) : jsonField
          return data.strokes || (Array.isArray(data) ? data : [])
        } catch (e) {
          console.error('Error parsing JSON data', e)
          return []
        }
      }

      setDisplayStrokes(parseStrokes(initialValues.displayDataJson))
      setValidationStrokes(parseStrokes(initialValues.validationDataJson))
    } else if (open) {
      form.resetFields()
      form.setFieldsValue({ isActive: true, sortOrder: 1, type: 'Vowel' })
      setDisplayStrokes([])
      setValidationStrokes([])
    }
  }, [open, initialValues, form])

  const playAudio = () => {
    const url = form.getFieldValue('audioUrl')
    if (url) {
      if (!audioRef.current) {
        audioRef.current = new Audio(url)
      } else {
        audioRef.current.src = url
      }
      audioRef.current.play().catch(e => message.error('Không thể phát âm thanh'))
    } else {
      message.warning('Chưa có đường dẫn âm thanh')
    }
  }

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      
      // Update JSON fields
      const payload = {
        ...initialValues,
        ...values,
        displayDataJson: JSON.stringify({ strokes: displayStrokes }),
        validationDataJson: JSON.stringify({ strokes: validationStrokes }),
      }
      
      onSubmit(payload)
    } catch (error) {
      message.error('Vui lòng kiểm tra lại thông tin')
    }
  }

  // --- STROKE EDITOR LOGIC ---
  const handleStroke = async (stroke) => {
    // In our new real-time canvas, we don't need additional post-processing here
  }

  const captureCanvasStrokes = async () => {
    if (!canvasRef.current) return
    
    const paths = await canvasRef.current.exportPaths()
    if (!paths || paths.length === 0) {
      message.warning('Vui lòng vẽ nét trước khi lưu')
      return
    }

    // Normalize paths to 0-1 range
    // Our custom AdminSketchCanvas uses a 1000x1000 internal coordinate system
    const width = 1000
    const height = 1000

    const normalizedStrokes = paths.map((path, index) => {
      const hangulPoints = path.paths.map(p => [
        parseFloat((p.x / width).toFixed(3)),
        parseFloat((p.y / height).toFixed(3))
      ])

      // Note: In our custom canvas, snapping is already done in real-time during mousemove
      // if Shift was held. So we don't need additional snapping here.

      return {
        order: index + 1,
        isMainStroke: true,
        [jsonMode === 'display' ? 'templatePoints' : 'validationPoints']: hangulPoints,
        guide: {
          arrowPath: hangulPoints.length > 2 ? [
            hangulPoints[0],
            hangulPoints[Math.floor(hangulPoints.length / 2)],
            hangulPoints[hangulPoints.length - 1]
          ] : hangulPoints,
          numberLabel: {
            value: index + 1,
            position: hangulPoints[0]
          }
        }
      }
    })

    if (jsonMode === 'display') {
      setDisplayStrokes(normalizedStrokes)
    } else {
      setValidationStrokes(normalizedStrokes)
    }
    message.success(`Đã ghi nhận ${normalizedStrokes.length} nét vẽ cho ${jsonMode === 'display' ? 'Hiển thị' : 'Kiểm tra'}`)
  }

  const clearCanvas = () => {
    canvasRef.current?.clearCanvas()
    if (jsonMode === 'display') setDisplayStrokes([])
    else setValidationStrokes([])
  }

  const undoLastStroke = () => {
    canvasRef.current?.undo()
  }

  const handleCopyFromDisplay = () => {
    setValidationStrokes([...displayStrokes])
    message.success('Đã sao chép dữ liệu từ Hiển thị sang Kiểm tra')
  }

  const startEditing = () => {
    setIsEditing(true)
    canvasRef.current?.clearCanvas()
  }

  const stopEditing = () => {
    setIsEditing(false)
    canvasRef.current?.clearCanvas()
  }

  return (
    <Modal
      title={null}
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>Đóng</Button>,
        <Button key="submit" type="primary" icon={<SaveOutlined />} loading={loading} onClick={handleSave}>
          Lưu tất cả
        </Button>
      ]}
      width={1000}
      style={{ top: 20 }}
      bodyStyle={{ padding: 0 }}
      centered
    >
      <div style={{ display: 'flex', height: '70vh', minHeight: '600px' }}>
        {/* Left Sidebar: Character Preview */}
        <div style={{ 
          width: '300px', 
          backgroundColor: '#f8f9fa', 
          padding: '24px', 
          borderRight: '1px solid #f0f0f0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
        <div style={{ 
          width: isEditing ? '100px' : '160px', 
          height: isEditing ? '100px' : '160px', 
          backgroundColor: '#fff', 
          borderRadius: '16px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          marginBottom: isEditing ? '12px' : '20px',
          fontSize: isEditing ? '50px' : '80px',
          fontWeight: '600',
          color: '#1890ff',
          transition: 'all 0.3s ease'
        }}>
          {form.getFieldValue('letter') || '?'}
        </div>
        
        <Title level={isEditing ? 5 : 4} style={{ marginBottom: 4, transition: 'all 0.3s ease' }}>
          {form.getFieldValue('meaning') || 'Chưa có ý nghĩa'}
        </Title>
        <Text type="secondary" style={{ marginBottom: isEditing ? 8 : 16 }}>
          [{form.getFieldValue('pronunciation') || '...'}]
        </Text>
        
        {!isEditing && (
          <Button 
            icon={<PlayCircleOutlined />} 
            onClick={playAudio}
            style={{ borderRadius: '20px' }}
          >
            Nghe phát âm
          </Button>
        )}

        <Divider style={{ margin: isEditing ? '12px 0' : '24px 0' }} />
        
        <div style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {!isEditing ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text strong>Loại:</Text>
                <Text>{form.getFieldValue('type') === 'Vowel' ? 'Nguyên âm' : 'Phụ âm'}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text strong>Số nét:</Text>
                <Text>{initialValues?.totalStrokes || (jsonMode === 'display' ? displayStrokes : validationStrokes).length} nét</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text strong>Trạng thái:</Text>
                <Switch size="small" checked={form.getFieldValue('isActive')} disabled />
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <Text strong style={{ marginBottom: 12, display: 'block', fontSize: '12px', color: '#8c8c8c', textTransform: 'uppercase' }}>
                Thứ tự nét vẽ ({jsonMode === 'display' ? 'Mẫu' : 'Quy tắc'}):
              </Text>
              <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
                {(jsonMode === 'display' ? displayStrokes : validationStrokes).map((s, i) => (
                  <div key={i} style={{ 
                    marginBottom: 6, 
                    padding: '8px 10px', 
                    backgroundColor: '#fff', 
                    borderRadius: '6px',
                    border: '1px solid #f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                  }}>
                    <div style={{ 
                      width: '20px', 
                      height: '20px', 
                      borderRadius: '50%', 
                      backgroundColor: jsonMode === 'display' ? '#1890ff' : '#52c41a', 
                      color: '#fff', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      flexShrink: 0
                    }}>
                      {s.order}
                    </div>
                    <Text style={{ fontSize: '13px' }}>Nét thứ {s.order}</Text>
                  </div>
                ))}
                {(jsonMode === 'display' ? displayStrokes : validationStrokes).length === 0 && (
                  <div style={{ textAlign: 'center', padding: '20px 0', backgroundColor: '#fff', borderRadius: '8px', border: '1px dashed #d9d9d9' }}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>Chưa có nét vẽ</Text>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        </div>

        {/* Right Content: Tabs */}
        <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
            <TabPane tab={<span><EditOutlined /> Thông tin cơ bản</span>} key="info">
              <Form
                form={form}
                layout="vertical"
                style={{ marginTop: 16 }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
                  <Form.Item name="letter" label="Chữ cái (Hangul)" rules={[{ required: true }]}>
                    <Input placeholder="VD: ㅏ" />
                  </Form.Item>
                  <Form.Item name="type" label="Loại" rules={[{ required: true }]}>
                    <Select>
                      <Select.Option value="Vowel">Nguyên âm</Select.Option>
                      <Select.Option value="Consonant">Phụ âm</Select.Option>
                    </Select>
                  </Form.Item>
                  <Form.Item name="meaning" label="Ý nghĩa" rules={[{ required: true }]}>
                    <Input placeholder="VD: a" />
                  </Form.Item>
                  <Form.Item name="pronunciation" label="Phát âm" rules={[{ required: true }]}>
                    <Input placeholder="VD: a" />
                  </Form.Item>
                  <Form.Item name="audioUrl" label="URL âm thanh (Cloudinary)">
                    <Input placeholder="https://..." />
                  </Form.Item>
                  <Form.Item name="sortOrder" label="Thứ tự sắp xếp">
                    <InputNumber min={0} style={{ width: '100%' }} />
                  </Form.Item>
                  <Form.Item name="totalStrokes" label="Tổng số nét (Hệ thống)">
                    <InputNumber disabled style={{ width: '100%' }} />
                  </Form.Item>
                </div>
                <Form.Item name="isActive" label="Hoạt động" valuePropName="checked">
                  <Switch />
                </Form.Item>
              </Form>
            </TabPane>

            <TabPane tab={<span><CheckCircleOutlined /> Thiết kế nét vẽ & Quy tắc</span>} key="drawing">
              <div style={{ marginBottom: 16, textAlign: 'center' }}>
                <Space>
                  <Text strong>Chế độ JSON:</Text>
                  <Select 
                    value={jsonMode} 
                    onChange={setJsonMode} 
                    style={{ width: 280 }}
                  >
                    <Select.Option value="display"><InfoCircleOutlined /> 1. Hình ảnh hiển thị mẫu (Guide)</Select.Option>
                    <Select.Option value="validation"><SettingOutlined /> 2. Quy tắc kiểm tra nét (Rules)</Select.Option>
                  </Select>
                  <Tag color="blue" style={{ borderRadius: '10px' }}>
                    {(jsonMode === 'display' ? displayStrokes : validationStrokes).length} nét
                  </Tag>
                  <Button 
                    type="text" 
                    icon={<SaveOutlined />} 
                    size="small"
                    onClick={() => {
                      const text = JSON.stringify({ strokes: (jsonMode === 'display' ? displayStrokes : validationStrokes) });
                      navigator.clipboard.writeText(text);
                      message.success('Đã copy mã JSON');
                    }}
                  >
                    Copy JSON
                  </Button>
                </Space>
              </div>

              <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center',
                minHeight: '450px'
              }}>
                <div style={{ width: '100%', maxWidth: '500px' }}>
                  <Paragraph style={{ textAlign: 'center' }}>
                    {jsonMode === 'display' 
                      ? 'Vẽ các nét để HIỂN THỊ hướng dẫn cho người dùng. Đây là những gì họ thấy khi học.' 
                      : 'Vẽ các nét để KIỂM TRA tính chính xác khi người dùng vẽ. Thường giống DisplayData nhưng có thể tinh chỉnh.'}
                  </Paragraph>
                  <div style={{ 
                    width: '100%', 
                    aspectRatio: '1', 
                    maxWidth: '400px',
                    border: '2px dashed #d9d9d9',
                    borderRadius: '8px',
                    position: 'relative',
                    margin: '0 auto',
                    backgroundColor: '#fff',
                    overflow: 'hidden',
                    cursor: isEditing ? 'crosshair' : 'default'
                  }}>
                    {/* SVG Guide Preview */}
                    <GuideStrokes 
                      show={true}
                      strokes={(jsonMode === 'display' ? displayStrokes : validationStrokes).map(s => s.templatePoints || s.validationPoints || s.hangulPoints || [])}
                      guides={(jsonMode === 'display' ? displayStrokes : validationStrokes).map(s => s.guide)}
                    />

                    {isEditing && (
                      <AdminSketchCanvas
                        ref={canvasRef}
                        strokeWidth={35}
                        strokeColor={jsonMode === 'display' ? "#1890ff" : "#52c41a"}
                        isShiftPressed={isShiftPressed}
                        onStroke={handleStroke}
                      />
                    )}
                  </div>
                  
                  <div style={{ marginTop: 16, textAlign: 'center' }}>
                    {!isEditing ? (
                      <Space>
                        <Button type="primary" icon={<EditOutlined />} onClick={startEditing}>
                          Thiết kế lại nét vẽ
                        </Button>
                        {jsonMode === 'validation' && displayStrokes.length > 0 && (
                          <Button icon={<SaveOutlined />} onClick={handleCopyFromDisplay}>
                            Sao chép từ Hiển thị
                          </Button>
                        )}
                      </Space>
                    ) : (
                      <Space>
                        <Button icon={<UndoOutlined />} onClick={undoLastStroke}>Hoàn tác</Button>
                        <Button icon={<DeleteOutlined />} danger onClick={clearCanvas}>Xóa hết</Button>
                        <Button 
                          type="primary" 
                          onClick={() => { captureCanvasStrokes(); setIsEditing(false); }}
                        >
                          Ghi nhận & Xong
                        </Button>
                        <Button onClick={stopEditing}>Hủy bỏ</Button>
                      </Space>
                    )}
                  </div>
                </div>
              </div>
            </TabPane>
          </Tabs>
        </div>
      </div>
    </Modal>
  )
}
