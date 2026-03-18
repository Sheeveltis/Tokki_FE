'use client'

import { useState, useEffect } from 'react'
import { Form, Input, Upload, message, Button, Typography, Image, Card, Row, Col, ConfigProvider } from 'antd'
import { CloseOutlined, PlusOutlined, PictureOutlined, DeleteOutlined } from '@ant-design/icons'
import { romanizeHangul } from './romanize-hangul'

const { Text, Title } = Typography

export function VocabularyFormFields() {
  const form = Form.useFormInstance()
  const textValue = Form.useWatch('text', form)
  const [previewUrl, setPreviewUrl] = useState('')
  const [pronunciationTouched, setPronunciationTouched] = useState(false)

  useEffect(() => {
    const initialImg = form?.getFieldValue('imgURL')
    if (initialImg) setPreviewUrl(initialImg)
  }, [form])

  useEffect(() => {
    if (pronunciationTouched) return
    const romanized = romanizeHangul(textValue || '').trim()
    form?.setFieldsValue({ pronunciation: romanized })
  }, [form, textValue, pronunciationTouched])

  const handleBeforeUpload = (file) => {
    const isImage = file.type.startsWith('image/')
    if (!isImage) {
      message.error('Chỉ chấp nhận file ảnh!')
      return false
    }
    const isLt5M = file.size / 1024 / 1024 < 5
    if (!isLt5M) {
      message.error('Ảnh phải nhỏ hơn 5MB!')
      return false
    }
    form?.setFieldsValue({ imageFile: file, imgURL: undefined })
    const reader = new FileReader()
    reader.onload = (e) => setPreviewUrl(e.target?.result)
    reader.readAsDataURL(file)
    return false
  }

  const handleRemoveImage = () => {
    setPreviewUrl('')
    form?.setFieldsValue({ imgURL: '', imageFile: null })
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          fontSize: 18,
          colorTextHeading: '#262626',
        },
        components: {
          Form: {
            labelFontSize: 14,
            itemMarginBottom: 20,
          },
          Input: {
            controlHeight: 40,
          }
        }
      }}
    >
      <Card variant="borderless" style={{ borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
        <Row gutter={[40, 0]}>
          {/* CỘT TRÁI: CHIẾM CẢ THÔNG TIN VÀ VÍ DỤ */}
          <Col xs={24} md={15}>
            {/* 1. THÔNG TIN CƠ BẢN */}
            <Title level={5} style={{ marginBottom: 20, fontSize: '16px' }}>Thông tin cơ bản</Title>
            
            <Form.Item 
              label={<Text strong>Từ vựng (Tiếng Hàn)</Text>} 
              name="text" 
              layout="vertical"
              rules={[
                { required: true, message: 'Nhập từ vựng' },
                { max: 100, message: 'Text không được vượt quá 100 ký tự.' },
              ]}
            >
              <Input placeholder="VD: 은행" maxLength={100} />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item 
                  label={<Text strong>Phiên âm</Text>} 
                  name="pronunciation" 
                  layout="vertical"
                  rules={[
                    { required: true, message: 'Nhập phiên âm' },
                    { max: 100, message: 'Text không được vượt quá 100 ký tự.' },
                  ]}
                >
                  <Input
                    placeholder="eunhaeng"
                    maxLength={100}
                    onChange={() => setPronunciationTouched(true)}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item 
                  label={<Text strong>Định nghĩa</Text>} 
                  name="definition" 
                  layout="vertical"
                  rules={[
                    { required: true, message: 'Nhập ý nghĩa' },
                    { max: 100, message: 'Text không được vượt quá 100 ký tự.' },
                  ]}
                >
                  <Input placeholder="Ngân hàng" maxLength={100} />
                </Form.Item>
              </Col>
            </Row>

            {/* 2. KHU VỰC VÍ DỤ (Đã đưa vào trong cột trái) */}
            <div style={{ marginTop: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                <Text strong style={{ marginRight: 12, fontSize: 14 }}>Ví dụ sử dụng</Text>
                <div style={{ flex: 1, height: 1, background: '#f0f0f0' }} /> 
              </div>
              
              <Form.List name="examples">
                {(fields, { add, remove }) => (
                  <div style={{ display: 'flex', flexDirection: 'column'}}>
                    <div style={{ maxHeight: 160, overflowY: 'auto', paddingRight: 8 }}>
                      {fields.map((field, index) => (
                        <div 
                          key={field.key} 
                          style={{ 
                            padding: '16px 0', 
                            borderBottom: index === fields.length - 1 ? 'none' : '1px solid #f0f0f0',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Text type="secondary" style={{ fontSize: 13 }}>Câu ví dụ #{index + 1}</Text>
                            <Button type="link" danger size="small" onClick={() => remove(field.name)} icon={<CloseOutlined />}>
                              Gỡ bỏ
                            </Button>
                          </div>
                          <Row gutter={16}>
                            <Col span={12}>
                              <Form.Item
                                {...field}
                                name={[field.name, 'sentence']}
                                rules={[
                                  { required: true, message: 'Nhập câu ví dụ' },
                                  { max: 100, message: 'Text không được vượt quá 100 ký tự.' },
                                ]}
                                style={{ marginBottom: 0 }}
                              >
                                <Input.TextArea
                                  placeholder="Câu tiếng Hàn..."
                                  rows={1}
                                  maxLength={100}
                                  style={{ resize: 'none', overflowY: 'auto' }}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={12}>
                              <Form.Item
                                {...field}
                                name={[field.name, 'translation']}
                                rules={[{ max: 100, message: 'Text không được vượt quá 100 ký tự.' }]}
                                style={{ marginBottom: 0 }}
                              >
                                <Input.TextArea
                                  placeholder="Bản dịch tiếng Việt..."
                                  rows={1}
                                  maxLength={100}
                                  style={{ resize: 'none', overflowY: 'auto' }}
                                />
                              </Form.Item>
                            </Col>
                          </Row>
                        </div>
                      ))}
                    </div>
                    
                    <Button 
                      type="dashed" 
                      onClick={() => add()} 
                      block 
                      icon={<PlusOutlined />}
                      style={{ marginTop: 16, height: 42, borderRadius: 8 }}
                    >
                      Thêm câu ví dụ mới
                    </Button>
                  </div>
                )}
              </Form.List>
            </div>
          </Col>

          {/* CỘT PHẢI: HÌNH ẢNH (Bây giờ nó sẽ dài dọc theo cột trái) */}
          <Col xs={24} md={9}>
            <Title level={5} style={{ marginBottom: 20, fontSize: '16px' }}>Hình ảnh minh họa</Title>
            <Form.Item>
              {!previewUrl ? (
                <Upload.Dragger
                  multiple={false}
                  showUploadList={false}
                  beforeUpload={handleBeforeUpload}
                  accept="image/*"
                  // Tăng chiều cao lên để cân đối với cột bên trái
                  style={{ borderRadius: 10, minHeight: 400, display: 'flex', alignItems: 'center' }}
                >
                  <PictureOutlined style={{ color: '#bfbfbf', fontSize: 28 }} />
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary">Tải ảnh lên (Max 5MB)</Text>
                  </div>
                </Upload.Dragger>
              ) : (
                <div style={{ position: 'relative' }}>
                  <Image
                    src={previewUrl}
                    alt="preview"
                    style={{ borderRadius: 10, width: '100%', minHeight: 400, objectFit: 'cover' }}
                  />
                  <Button
                    type="primary" danger shape="circle" size="small"
                    icon={<DeleteOutlined />}
                    onClick={handleRemoveImage}
                    style={{ position: 'absolute', top: 8, right: 8 }}
                  />
                </div>
              )}
            </Form.Item>
            {/* Các field hidden giữ nguyên */}
            <Form.Item name="imageFile" hidden><Input type="hidden" /></Form.Item>
            <Form.Item name="imgURL" hidden><Input type="hidden" /></Form.Item>
          </Col>
        </Row>
      </Card>
    </ConfigProvider>
  )
}

export default VocabularyFormFields
