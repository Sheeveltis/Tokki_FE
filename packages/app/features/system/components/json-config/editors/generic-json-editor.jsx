import React from 'react'
import { Form, Input, Typography, Alert } from 'antd'

const { Text } = Typography

export const GenericJsonEditor = () => {
  return (
    <div>
      <Alert
        message="Chế độ chỉnh sửa JSON thô"
        description="Tham số này chưa có form nhập liệu riêng. Bạn có thể chỉnh sửa trực tiếp chuỗi JSON bên dưới. Hãy đảm bảo định dạng JSON hợp lệ."
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />
      <Form.Item
        name="jsonValue"
        label={<Text strong>Nội dung JSON</Text>}
        rules={[
          { required: true, message: 'Vui lòng nhập JSON' },
          {
            validator: (_, value) => {
              if (!value) return Promise.resolve()
              try {
                JSON.parse(value)
                return Promise.resolve()
              } catch (e) {
                return Promise.reject(new Error('Định dạng JSON không hợp lệ'))
              }
            }
          }
        ]}
      >
        <Input.TextArea 
          placeholder='{"key": "value"}' 
          autoSize={{ minRows: 10, maxRows: 25 }} 
          style={{ fontFamily: 'monospace', fontSize: 13 }}
        />
      </Form.Item>
    </div>
  )
}
