'use client'

import React, { useState } from 'react'
import { Modal } from 'antd'
import { ButtonV2 } from '../../../../../../components/buttonV2.jsx'

/**
 * DeleteUserConfirm: modal xác nhận xoá user (mock).
 * Props:
 *  - open: boolean
 *  - user: user object
 *  - onConfirm: () => void
 *  - onCancel: () => void
 */
export function DeleteUserConfirm({ open, user, onConfirm, onCancel }) {
  const [submitting, setSubmitting] = useState(false)

  const handleConfirm = async () => {
    try {
      setSubmitting(true)
      // mock delete
      onConfirm?.()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      title="Xóa người dùng"
      destroyOnHidden
    >
      <p>
        Bạn có chắc muốn xóa người dùng{' '}
        <strong>{user?.name || user?.email || 'này'}</strong>? (Mock - chưa gọi API)
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
          title={submitting ? 'Đang xóa...' : 'Xóa'}
          color="charcoal"
          onPress={handleConfirm}
          style={{ minWidth: 100, paddingVertical: 10 }}
          textStyle={{ fontSize: 14 }}
        />
      </div>
    </Modal>
  )
}

export default DeleteUserConfirm

