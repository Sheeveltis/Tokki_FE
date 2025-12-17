import React from 'react'
import { Modal } from 'antd'

/**
 * Popup xác nhận đơn giản
 * @param {{
 *  open: boolean
 *  title?: string
 *  content?: React.ReactNode
 *  okText?: string
 *  cancelText?: string
 *  confirmLoading?: boolean
 *  onOk?: () => void
 *  onCancel?: () => void
 * }} props
 */
export default function PopupConfirm({
  open,
  title = 'Xác nhận',
  content,
  okText = 'Đồng ý',
  cancelText = 'Hủy',
  confirmLoading = false,
  onOk,
  onCancel,
}) {
  return (
    <Modal
      open={open}
      title={title}
      centered
      onOk={onOk}
      onCancel={onCancel}
      okText={okText}
      cancelText={cancelText}
      confirmLoading={confirmLoading}
    >
      {content}
    </Modal>
  )
}

