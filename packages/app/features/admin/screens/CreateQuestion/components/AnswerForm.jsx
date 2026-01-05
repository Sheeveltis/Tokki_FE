'use client'

import React from 'react'
import { Form, Input, Button, Space, Typography, Card, Checkbox } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'

const { Title } = Typography
const { TextArea } = Input

/**
 * AnswerForm Component
 * Quản lý danh sách đáp án cho câu hỏi
 */
export function AnswerForm({ form }) {
  // Move Form.useWatch to top level of component (Rules of Hooks)
  const currentAnswers = Form.useWatch('answers', form) || []

  return (
    <Space orientation="vertical" size="large" style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={4} style={{ margin: 0 }}>
          Đáp án
        </Title>
      </div>

      <Form.List
        name="answers"
        rules={[
          {
            validator: async (_, answers) => {
              if (!answers || answers.length < 2) {
                return Promise.reject(new Error('Cần ít nhất 2 đáp án'))
              }
              const correctAnswers = answers.filter((a) => a?.isCorrect)
              if (correctAnswers.length === 0) {
                return Promise.reject(new Error('Cần ít nhất 1 đáp án đúng'))
              }
            },
          },
        ]}
      >
        {(fields, { add, remove }) => {

          return (
            <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
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
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1, marginRight: 16 }}>
                          <Form.Item
                            {...restField}
                            name={[name, 'content']}
                            rules={[
                              { required: true, message: 'Vui lòng nhập nội dung đáp án' },
                            ]}
                            style={{ marginBottom: 0 }}
                          >
                            <TextArea
                              rows={2}
                              placeholder={`Nhập đáp án ${index + 1}...`}
                              size="large"
                            />
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
                          {fields.length > 2 && (
                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => remove(name)}
                            >
                              Xóa
                            </Button>
                          )}
                        </Space>
                      </div>
                    </Space>
                  </Card>
                )
              })}

              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={() => add()}
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

