'use client'

import React, { useEffect, useState } from 'react'
import { Form, Input, Button, Space, Typography, Card, Checkbox, Upload, message } from 'antd'
import { PlusOutlined, DeleteOutlined, InboxOutlined } from '@ant-design/icons'
import { createObjectUrl, revokeObjectUrl } from '../../../api/upload-utils'

const { Title } = Typography
const { TextArea } = Input
const { Dragger } = Upload

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
    <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={4} style={{ margin: 0 }}>
          Đáp án
        </Title>
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
            <Space orientation="vertical" size="small" style={{ width: '100%' }}>
              {fields.map(({ key, name, ...restField }, index) => {
                const isCorrect = currentAnswers[index]?.isCorrect || false
                return (
                  <Card
                    key={key}
                    style={{
                      border: isCorrect ? '2px solid #52c41a' : '1px solid #d9d9d9',
                      backgroundColor: isCorrect ? '#f6ffed' : '#fff',
                    }}
                  >
                    <Space orientation="vertical" size="small" style={{ width: '100%' }}>
                      <Form.Item
                        {...restField}
                        name={[name, 'keyOption']}
                        hidden
                        initialValue={index + 1}
                      >
                        <Input type="hidden" />
                      </Form.Item>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1, marginRight: 16 }}>
                          <Form.Item
                            {...restField}
                            name={[name, 'content']}
                            rules={[
                              { required: true, message: 'Vui lòng nhập nội dung đáp án' },
                            ]}
                            style={{ marginBottom: 8 }}
                          >
                            <TextArea
                              rows={2}
                              placeholder={`Nhập đáp án ${index + 1}...`}
                              size="large"
                            />
                          </Form.Item>

                          <Form.Item
                            {...restField}
                            name={[name, 'imageUrl']}
                            style={{ marginBottom: 0 }}
                          >
                            <div>
                              <Dragger {...imageUploadProps(index)} style={{ padding: '8px 0' }}>
                                <p className="ant-upload-drag-icon" style={{ margin: 0 }}>
                                  <InboxOutlined style={{ fontSize: 24 }} />
                                </p>
                                <p className="ant-upload-text" style={{ margin: 0, fontSize: 12 }}>
                                  Tải lên hình ảnh (tùy chọn)
                                </p>
                              </Dragger>

                              {(currentAnswers?.[index]?.imageFile || currentAnswers?.[index]?.imageUrl) ? (
                                <div style={{ marginTop: 8 }}>
                                  <img
                                    src={previewUrls[index] || currentAnswers?.[index]?.imageUrl}
                                    alt="Preview"
                                    style={{ maxWidth: '100%', maxHeight: 140, borderRadius: 6, border: '1px solid #d9d9d9' }}
                                  />
                                  {currentAnswers?.[index]?.imageFile ? (
                                    <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                                      File đã chọn: {currentAnswers[index].imageFile.name}
                                    </div>
                                  ) : null}
                                </div>
                              ) : null}
                            </div>
                          </Form.Item>
                        </div>
                        <Space orientation="vertical" size="small">
                          <Form.Item
                            {...restField}
                            name={[name, 'isCorrect']}
                            valuePropName="checked"
                            style={{ marginBottom: 0 }}
                          >
                            <Checkbox>Đáp án đúng</Checkbox>
                          </Form.Item>
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => remove(name)}
                            disabled={fields.length <= 2}
                            title={fields.length <= 2 ? 'Cần ít nhất 2 đáp án' : 'Xóa đáp án này'}
                          >
                            Xóa
                          </Button>
                        </Space>
                      </div>
                    </Space>
                  </Card>
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
                size="large"
              >
                Thêm đáp án
              </Button>

              {fields.length === 0 && (
                <div style={{ textAlign: 'center', padding: 24, color: '#999' }}>
                  Chưa có đáp án nào. Nhấn "Thêm đáp án" để bắt đầu.
                </div>
              )}
            </Space>
          )
        }}
      </Form.List>
    </Space>
  )
}

