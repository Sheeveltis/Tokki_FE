import React from 'react'
import { Drawer, Descriptions, Space, Button } from 'antd'

/**
 * Drawer hiển thị / chỉnh sửa chi tiết bản ghi.
 * Nhận props: open, onClose, title, data (object), footerActions (ReactNode)
 */
export function DetailDrawer({ open, onClose, title, data = {}, footerActions }) {
  return (
    <Drawer
      title={title}
      size="large"
      onClose={onClose}
      open={open}
      destroyOnClose
      extra={
        <Button type="text" onClick={onClose}>
          Đóng
        </Button>
      }
      footer={
        footerActions ? (
          <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
            {footerActions}
          </Space>
        ) : null
      }
    >
      <Descriptions column={1} bordered size="small">
        {Object.entries(data).map(([key, value]) => (
          <Descriptions.Item key={key} label={key}>
            {String(value ?? '')}
          </Descriptions.Item>
        ))}
      </Descriptions>
    </Drawer>
  )
}

export default DetailDrawer

