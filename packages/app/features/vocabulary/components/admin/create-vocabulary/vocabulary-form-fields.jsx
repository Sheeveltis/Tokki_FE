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
          fontSize: 18, // Tăng lên 14px cho dễ đọc
          // borderRadius: 8,
          colorTextHeading: '#262626',
        },
        components: {
          Form: {
            labelFontSize: 14,
            itemMarginBottom: 20,
          },
          Input: {
            controlHeight: 40, // Độ cao vừa phải, không quá to như ban đầu
          }
        }
      }}
    >
      <Card variant="borderless" style={{ borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
        <Row gutter={[40, 0]}>
          {/* CỘT TRÁI: THÔNG TIN CƠ BẢN */}
          <Col xs={24} md={15}>
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
              <Input placeholder="VD: 은행" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item 
                  label={<Text strong>Phiên âm</Text>} 
                  name="pronunciation" 
                  layout="vertical"
                  rules={[{ required: true, message: 'Nhập phiên âm' }]}
                >
                  <Input
                    placeholder="eunhaeng"
                    onChange={() => setPronunciationTouched(true)}
                    onBlur={(event) => {
                      const value = event?.target?.value || ''
                      if (value.trim().length === 0) {
                        setPronunciationTouched(false)
                        const romanized = romanizeHangul(textValue || '').trim()
                        form?.setFieldsValue({ pronunciation: romanized })
                      }
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item 
                  label={<Text strong>Định nghĩa</Text>} 
                  name="definition" 
                  layout="vertical"
                  rules={[{ required: true, message: 'Nhập ý nghĩa' }]}
                >
                  <Input placeholder="Ngân hàng" />
                </Form.Item>
              </Col>
            </Row>
          </Col>

          {/* CỘT PHẢI: HÌNH ẢNH */}
          <Col xs={24} md={9}>
            <Title level={5} style={{ marginBottom: 20, fontSize: '16px' }}>Hình ảnh minh họa</Title>
            <Form.Item>
              {!previewUrl ? (
                <Upload.Dragger
                  multiple={false}
                  showUploadList={false}
                  beforeUpload={handleBeforeUpload}
                  accept="image/*"
                  style={{ borderRadius: 10, height: 168 }}
                >
                  <PictureOutlined style={{ color: '#bfbfbf', fontSize: 28 }} />
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary">Tải ảnh lên (Max 5MB)</Text>
                  </div>
                </Upload.Dragger>
              ) : (
                <div style={{ position: 'relative', height: 168 }}>
                  <Image
                    src={previewUrl}
                    alt="preview"
                    style={{ borderRadius: 10, height: 168, width: '100%', objectFit: 'cover' }}
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
            <Form.Item name="imageFile" hidden>
              <Input type="hidden" />
            </Form.Item>
            <Form.Item name="imgURL" hidden>
              <Input type="hidden" />
            </Form.Item>
          </Col>
        </Row>

        {/* KHU VỰC VÍ DỤ */}
        <div style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
            <Text strong style={{ marginRight: 12, fontSize: 14 }}>Ví dụ sử dụng</Text>
            <div style={{ flex: 1, height: 1, background: '#f0f0f0' }} />
          </div>
          
          <Form.List name="examples">
            {(fields, { add, remove }) => (
              <div style={{ display: 'flex', flexDirection: 'column'}}>
                <div style={{ maxHeight: 340, overflowY: 'auto', paddingRight: 8 }}>
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
                            rules={[{ required: true, message: 'Nhập câu ví dụ' }]}
                            style={{ marginBottom: 0 }}
                          >
                            <Input.TextArea placeholder="Câu tiếng Hàn..." autoSize={{ minRows:1 }} />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            {...field}
                            name={[field.name, 'translation']}
                            style={{ marginBottom: 0 }}
                          >
                            <Input.TextArea placeholder="Bản dịch tiếng Việt..." autoSize={{ minRows: 1 }} />
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
      </Card>
    </ConfigProvider>
  )
}

export default VocabularyFormFields
