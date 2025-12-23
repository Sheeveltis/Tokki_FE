import React, { useEffect, useState } from 'react'
import { Card, Descriptions, Space, Spin, Typography, Tag, message, Button, Input, Select } from 'antd'
import { fetchUserDetail, updateUserProfile } from '../../UserDetail/api/api'
import PopupConfirm from './popup-confirm'
import DeleteUserConfirm from '../../UserDetail/modal/DeleteUserConfirm'
import { showAdminSuccess, showAdminError } from 'components/HelperAdmin'

const { Title, Text } = Typography

const getRoleLabel = (val) => {
  const r = Number(val)
  switch (r) {
    case 0:
      return 'Người dùng'
    case 1:
      return 'Quản trị viên'
    case 2:
      return 'Nhân viên'
    case 3:
      return 'Thành viên VIP'
    default:
      return String(val ?? '')
  }
}

const getStatusLabel = (val) => {
  const s = Number(val)
  switch (s) {
    case 0:
      return 'Vô hiệu hóa'
    case 1:
      return 'Hoạt động'
    case 2:
      return 'Đã bị khóa'
    default:
      return String(val ?? '')
  }
}

export default function AccountDetails({ userId, onAfterChange }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [user, setUser] = useState(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    fullName: '',
    phoneNumber: '',
    dateOfBirth: '',
    avatarUrl: '',
    role: 0,
    status: 0,
  })
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const fmt = (val) => {
    if (val === null || val === undefined || val === '') return 'N/A'
    return String(val)
  }

  const fmtDate = (val) => {
    if (val === null || val === undefined || val === '') return 'N/A'
    const d = new Date(val)
    if (isNaN(d.getTime())) return String(val)
    // dd/MM/yyyy
    return d.toLocaleDateString('vi-VN')
  }

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        setLoading(true)
        const detail = await fetchUserDetail(userId)
        if (mounted) {
          setUser(detail)
          setForm({
            fullName: detail.fullName || '',
            phoneNumber: detail.phoneNumber || '',
            dateOfBirth: detail.dateOfBirth ? String(detail.dateOfBirth).slice(0, 10) : '',
            avatarUrl: detail.avatarUrl || '',
            role: Number(detail.role ?? 0),
            status: Number(detail.status ?? 0),
          })
        }
      } catch (err) {
        if (mounted) setError(err?.message || 'Không thể tải thông tin tài khoản.')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    if (userId) load()
    return () => {
      mounted = false
    }
  }, [userId])

  const handleDisable = () => {
    setDeleteOpen(true)
  }

  const handleUpdateClick = () => {
    if (!editing) {
      setEditing(true)
      return
    }
    // Đang ở chế độ edit, bấm lần nữa để xác nhận
    setConfirmOpen(true)
  }

  const handleConfirmUpdate = async () => {
    try {
      setSaving(true)
      await updateUserProfile({
        targetUserId: user.userId || user.id,
        fullName: form.fullName,
        phoneNumber: form.phoneNumber,
        dateOfBirth: form.dateOfBirth,
        avatarUrl: form.avatarUrl,
        role: form.role,
        status: form.status,
      })
      showAdminSuccess('Đã cập nhật tài khoản thành công')
      setEditing(false)
      setConfirmOpen(false)
      // cập nhật lại local user
      setUser((prev) => (prev ? { ...prev, ...form } : prev))
      onAfterChange?.()
    } catch (err) {
      console.error(err)
      showAdminError?.(err?.message || 'Cập nhật tài khoản thất bại')
      message.error(err?.message || 'Cập nhật tài khoản thất bại')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '40vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <Spin />
        <Text type="secondary">Đang tải thông tin tài khoản...</Text>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <Text type="danger">{error}</Text>
      </div>
    )
  }

  if (!user) {
    return (
      <div style={{ padding: 24 }}>
        <Text type="warning">Không tìm thấy tài khoản.</Text>
      </div>
    )
  }

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Space style={{ justifyContent: 'space-between', width: '100%' }}>
          <div>
            <Title level={3} style={{ marginBottom: 4 }}>
              Chi tiết tài khoản
            </Title>
            <Text type="secondary">ID: {user.userId || user.id}</Text>
          </div>
          <Space>
            {Number(user.status) !== 0 && (
              <Button danger onClick={handleDisable}>
                Vô hiệu hóa
              </Button>
            )}
            <Button type="primary" onClick={handleUpdateClick}>
              {editing ? 'Xác nhận cập nhật' : 'Cập nhật'}
            </Button>
          </Space>
        </Space>

        <Card>
          <Descriptions column={1} bordered size="middle">
            <Descriptions.Item label="Họ tên">
              {editing ? (
                <Input
                  value={form.fullName}
                  onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                />
              ) : (
                fmt(user.fullName)
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Email">{fmt(user.email)}</Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              {editing ? (
                <Input
                  value={form.phoneNumber}
                  onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))}
                />
              ) : (
                fmt(user.phoneNumber)
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày sinh">
              {editing ? (
                <Input
                  value={form.dateOfBirth}
                  placeholder="YYYY-MM-DD"
                  onChange={(e) => setForm((f) => ({ ...f, dateOfBirth: e.target.value }))}
                />
              ) : (
                fmtDate(user.dateOfBirth)
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Avatar URL">
              {editing ? (
                <Input
                  value={form.avatarUrl}
                  onChange={(e) => setForm((f) => ({ ...f, avatarUrl: e.target.value }))}
                />
              ) : (
                fmt(user.avatarUrl)
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Role">
              {editing ? (
                <Select
                  value={form.role}
                  onChange={(value) => setForm((f) => ({ ...f, role: value }))}
                  style={{ width: '100%' }}
                  options={[
                    { value: 0, label: 'Người dùng' },
                    { value: 1, label: 'Quản trị viên' },
                    { value: 2, label: 'Nhân viên' },
                    { value: 3, label: 'Thành viên VIP' },
                  ]}
                />
              ) : (
                getRoleLabel(user.role)
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              {editing ? (
                <Select
                  value={form.status}
                  onChange={(value) => setForm((f) => ({ ...f, status: value }))}
                  style={{ width: '100%' }}
                  options={[
                    { value: 0, label: 'Vô hiệu hóa' },
                    { value: 1, label: 'Hoạt động' },
                    { value: 2, label: 'Đã bị khóa' },
                  ]}
                />
              ) : (
                <Tag color={Number(user.status) === 1 ? 'green' : Number(user.status) === 2 ? 'red' : 'default'}>
                  {getStatusLabel(user.status)}
                </Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="VIP hết hạn">{fmtDate(user.vipExpirationDate)}</Descriptions.Item>
            <Descriptions.Item label="Current streak">{fmt(user.currentStreak)}</Descriptions.Item>
            <Descriptions.Item label="Tạo lúc">{fmtDate(user.createdAt)}</Descriptions.Item>
            <Descriptions.Item label="Cập nhật lúc">{fmtDate(user.updatedAt)}</Descriptions.Item>
          </Descriptions>
        </Card>
      </Space>
      <PopupConfirm
        open={confirmOpen}
        title="Xác nhận cập nhật tài khoản"
        content="Bạn có chắc chắn muốn cập nhật thông tin tài khoản này không?"
        okText="Cập nhật"
        cancelText="Hủy"
        confirmLoading={saving}
        onOk={handleConfirmUpdate}
        onCancel={() => setConfirmOpen(false)}
      />
      <DeleteUserConfirm
        open={deleteOpen}
        user={user}
        onConfirm={() => {
          setDeleteOpen(false)
          onAfterChange?.()
        }}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  )
}


