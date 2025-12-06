'use client'
import React from 'react'
import { Form, Select, Switch, Row, Col } from 'antd'

export function BlogMetaInfo() {
  return (
    <Row gutter={16} style={{ marginTop: 20 }}>
      <Col span={16}>
        <Form.Item label="Tags (Thẻ)" name="tags">
          <Select
            mode="tags"
            size="large"
            style={{ width: '100%' }}
            placeholder="Nhập tag rồi ấn Enter (Ví dụ: korean, travel)"
            tokenSeparators={[',']}
          />
        </Form.Item>
      </Col>
      <Col span={8}>
        <Form.Item
          label="Trạng thái"
          name="isPublished"
          valuePropName="checked"
          initialValue={false}
        >
          <Switch checkedChildren="Công khai" unCheckedChildren="Nháp" />
        </Form.Item>
      </Col>
    </Row>
  )
}