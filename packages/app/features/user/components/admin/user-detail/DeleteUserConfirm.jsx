'use client'

import React, { useState } from 'react'
import { Modal, Button, message } from 'antd'
import { deleteUserById } from '../../../api/user-detail.js'

/**
 * DeleteUserConfirm: modal xác nhận vô hiệu hóa/Xóa user.
 * Props:
 *  - open: boolean
 *  - user: user object
 *  - onConfirm?: () => void  // callback sau khi xoá thành công
 *  - onCancel: () => void
 */
export function DeleteUserConfirm({ open, user, onConfirm, onCancel }) {
  const [submitting, setSubmitting] = useState(false)

  const handleConfirm = async () => {
    try {
      setSubmitting(true)
      const userId = user?.userId || user?.id
      await deleteUserById(userId)
      message.success('Đã vô hiệu hóa/xóa tài khoản thành công')
      onConfirm?.()
    } catch (err) {
      console.error(err)
      message.error(err?.message || 'Vô hiệu hóa tài khoản thất bại')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      centered
      onCancel={onCancel}
      onOk={handleConfirm}
      confirmLoading={submitting}
      title="Vô hiệu hóa tài khoản"
      okText="Vô hiệu hóa"
      cancelText="Hủy"
      okButtonProps={{ 
        danger: true,
        style: { borderRadius: '2rem', height: 40, padding: '0 24px', fontWeight: 600 } 
      }}
      cancelButtonProps={{ 
        style: { borderRadius: '2rem', height: 40, padding: '0 24px', fontWeight: 600 } 
      }}
      destroyOnHidden
    >
      <p>
        Bạn có chắc muốn vô hiệu hóa người dùng{' '}
        <strong>{user?.fullName || user?.name || user?.email || 'này'}</strong>?
      </p>
    </Modal>
  )
}

export default DeleteUserConfirm

