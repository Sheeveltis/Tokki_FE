'use client'

import React from 'react'
import { Modal, Typography, Space } from 'antd'
import { ExclamationCircleFilled } from '@ant-design/icons'

const { Text } = Typography
const { confirm } = Modal

export const showDeleteTitleConfirm = ({ titleName, onConfirm }) => {
  confirm({
    title: 'Xác nhận xóa danh hiệu',
    icon: <ExclamationCircleFilled style={{ color: '#ff4d4f' }} />,
    content: (
      <Space direction="vertical" size={4}>
        <Text>
          Bạn có chắc chắn muốn xóa danh hiệu <Text strong color="red">"{titleName}"</Text>?
        </Text>
        <Text type="secondary" style={{ fontSize: 13 }}>
          Hành động này không thể hoàn tác và sẽ ảnh hưởng đến các người dùng đang sở hữu danh hiệu này.
        </Text>
      </Space>
    ),
    okText: 'Xóa',
    okType: 'danger',
    cancelText: 'Hủy',
    centered: true,
    maskClosable: true,
    okButtonProps: {
      style: { borderRadius: 8, height: 36, fontWeight: 600 }
    },
    cancelButtonProps: {
      style: { borderRadius: 8, height: 36 }
    },
    onOk() {
      return onConfirm?.()
    },
    onCancel() {
      // Do nothing
    },
  })
}
