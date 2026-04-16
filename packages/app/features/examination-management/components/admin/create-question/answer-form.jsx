'use client'

import React, { useEffect, useState } from 'react'
import { Form, Input, Button, Typography, Checkbox, Upload, message, Tooltip, Image } from 'antd'
import { PlusOutlined, DeleteOutlined, CameraOutlined, CheckCircleFilled } from '@ant-design/icons'
import { createObjectUrl, revokeObjectUrl } from '../../../api/upload-utils'

const { Text } = Typography
const { Dragger } = Upload
const { TextArea } = Input

/**
 * AnswerForm Component
 * Quản lý danh sách đáp án cho câu hỏi
 */
export function AnswerForm({ form }) {
  // Move Form.useWatch to top level of component (Rules of Hooks)
  const currentAnswers = Form.useWatch('options', form) || []

  // cache object URLs by index for stable preview
  const [previewUrls, setPreviewUrls] = useState({})

  // Tự động cập nhật keyOption khi thêm/xóa đáp án
  useEffect(() => {
    const options = form.getFieldValue('options') || []
    options.forEach((option, index) => {
      if (option.keyOption !== index + 1) {
        form.setFieldValue(['options', index, 'keyOption'], index + 1)
      }
    })
  }, [currentAnswers, form])

  // Chỉ chọn file + preview tại local. Upload Cloudinary sẽ chạy khi bấm "Tạo mới".
  const imageUploadProps = (index) => ({
    name: 'file',
    multiple: false,
    accept: 'image/*',
    showUploadList: false,
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/')
      if (!isImage) {
        message.error('Chỉ chấp nhận file hình ảnh!')
        return Upload.LIST_IGNORE
      }

      // lưu File vào form, và reset url cũ
      form.setFieldValue(['options', index, 'imageFile'], file)
      form.setFieldValue(['options', index, 'imageUrl'], null)

      const nextUrl = createObjectUrl(file)
      setPreviewUrls((prev) => {
        const prevUrl = prev[index]
        if (prevUrl) revokeObjectUrl(prevUrl)
        return { ...prev, [index]: nextUrl }
      })

      return false // chặn antd tự upload
    },
  })

  return (
    <div style={{ padding: '4px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Text strong style={{ fontSize: 14, color: '#262626' }}>Danh sách đáp án lựa chọn</Text>
      </div>

      <Form.List
        name="options"
        rules={[
          {
            validator: async (_, options) => {
              if (!options || options.length < 2) {
                return Promise.reject(new Error('Cần ít nhất 2 đáp án'))
              }
              const correctOptions = options.filter((a) => a?.isCorrect)
              if (correctOptions.length === 0) {
                return Promise.reject(new Error('Cần ít nhất 1 đáp án đúng'))
              }
            },
          },
        ]}
      >
        {(fields, { add, remove }) => {
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {fields.map(({ key, name, ...restField }, index) => {
                const isCorrect = currentAnswers[index]?.isCorrect || false
                return (
                  <div
                    key={key}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '50px 1fr 200px 44px',
                      gap: 12,
                      alignItems: 'center',
                      padding: '8px 12px',
                      borderRadius: 12,
                      border: isCorrect ? '2px solid #52c41a' : '1px solid #f0f0f0',
                      backgroundColor: isCorrect ? '#f6ffed' : '#ffffff',
                      transition: 'all 0.3s ease',
                      boxShadow: isCorrect ? '0 4px 12px rgba(82, 196, 26, 0.08)' : 'none'
                    }}
                  >
                    <Form.Item
                      {...restField}
                      name={[name, 'keyOption']}
                      hidden
                      initialValue={index + 1}
                    >
                      <Input type="hidden" />
                    </Form.Item>

                    {/* Left Icon/Letter */}
                    <div 
                      onClick={() => {
                        const options = form.getFieldValue('options') || []
                        const updated = options.map((opt, idx) => ({ ...opt, isCorrect: idx === index }))
                        form.setFieldValue('options', updated)
                      }}
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        backgroundColor: isCorrect ? '#52c41a' : '#fafafa',
                        color: isCorrect ? '#fff' : '#d9d9d9',
                        border: isCorrect ? 'none' : '2px dashed #d9d9d9',
                        fontSize: 16,
                        fontWeight: 700,
                        transition: 'all 0.2s'
                      }}
                    >
                      {isCorrect ? <CheckCircleFilled /> : String.fromCharCode(65 + index)}
                    </div>

                    {/* Content Input */}
                    <Form.Item
                      {...restField}
                      name={[name, 'content']}
                      rules={[{ required: true, message: 'Nhập nội dung' }]}
                      style={{ marginBottom: 0 }}
                    >
                      <Input
                        variant="borderless"
                        placeholder={`Nhập nội dung lựa chọn ${String.fromCharCode(65 + index)}...`}
                        style={{ 
                          fontSize: 14, 
                          fontWeight: isCorrect ? 600 : 400,
                          backgroundColor: isCorrect ? 'transparent' : '#fafafa',
                          borderRadius: 8,
                          padding: '8px 12px'
                        }}
                      />
                    </Form.Item>

                    {/* Media Upload (Column 3) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Upload {...imageUploadProps(index)}>
                        <Button 
                          size="small" 
                          icon={<CameraOutlined />} 
                          style={{ borderRadius: 6, fontSize: 12 }}
                        >
                          {currentAnswers[index]?.imageFile || currentAnswers[index]?.imageUrl ? 'Đổi ảnh' : 'Thêm ảnh'}
                        </Button>
                      </Upload>

                      {(currentAnswers[index]?.imageFile || currentAnswers[index]?.imageUrl) && (
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                          <Image
                            src={previewUrls[index] || currentAnswers[index]?.imageUrl}
                            width={32}
                            height={32}
                            style={{ borderRadius: 4, objectFit: 'cover', border: '1px solid #d9d9d9' }}
                          />
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined style={{ fontSize: 10 }} />}
                            size="small"
                            onClick={() => {
                              form.setFieldValue(['options', index, 'imageUrl'], null)
                              form.setFieldValue(['options', index, 'imageFile'], null)
                            }}
                            style={{ 
                              position: 'absolute', 
                              top: -8, 
                              right: -8, 
                              width: 16, 
                              height: 16, 
                              padding: 0,
                              backgroundColor: '#fff',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                              borderRadius: '50%'
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Actions (Column 4) */}
                    <Button
                      type="text"
                      danger
                      shape="circle"
                      icon={<DeleteOutlined />}
                      onClick={() => remove(name)}
                      disabled={fields.length <= 2}
                      style={{ marginLeft: 'auto' }}
                    />
                    
                    <Form.Item
                      {...restField}
                      name={[name, 'isCorrect']}
                      valuePropName="checked"
                      hidden
                    >
                      <Checkbox />
                    </Form.Item>
                  </div>
                )
              })}

              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={() => {
                  const currentOptions = form.getFieldValue('options') || []
                  add({
                    keyOption: currentOptions.length + 1,
                    content: '',
                    imageUrl: '',
                    isCorrect: false,
                  })
                }}
                block
                style={{ 
                  marginTop: 4, 
                  height: 40, 
                  borderRadius: 10, 
                  fontSize: 14, 
                  fontWeight: 500,
                  borderWidth: 2
                }}
              >
                Thêm lựa chọn mới (A, B, C, ...)
              </Button>
            </div>
          )
        }}
      </Form.List>
    </div>
  )
}

