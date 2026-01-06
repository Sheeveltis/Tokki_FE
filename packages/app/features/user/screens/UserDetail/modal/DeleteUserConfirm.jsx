'use client'

import React, { useState } from 'react'
import { Modal } from 'antd'
import { ButtonV2 } from '../../../../../../components/buttonV2.jsx'
import { deleteUserById } from '../api/api'
import { showAdminSuccess, showAdminError } from 'components/HelperAdmin'

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
      showAdminSuccess('Đã vô hiệu hóa/xóa tài khoản thành công')
      onConfirm?.()
    } catch (err) {
      console.error(err)
      showAdminError?.(err?.message || 'Vô hiệu hóa tài khoản thất bại')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      title="Vô hiệu hóa tài khoản"
      destroyOnHidden
    >
      <p>
        Bạn có chắc muốn vô hiệu hóa người dùng{' '}
        <strong>{user?.fullName || user?.name || user?.email || 'này'}</strong>?
      </p>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
        <ButtonV2
          title="Hủy"
          color="mint"
          onPress={onCancel}
          style={{ minWidth: 80, paddingVertical: 10 }}
          textStyle={{ fontSize: 14 }}
        />
        <ButtonV2
          title={submitting ? 'Đang thực hiện...' : 'Vô hiệu hóa'}
          color="charcoal"
          onPress={handleConfirm}
          style={{ minWidth: 120, paddingVertical: 10 }}
          textStyle={{ fontSize: 14 }}
        />
      </div>
    </Modal>
  )
}

export default DeleteUserConfirm

