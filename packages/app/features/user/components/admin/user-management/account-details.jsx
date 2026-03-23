import { useEffect, useState } from 'react'
import { Card, Descriptions, Space, Spin, Typography, message, Input, Select, Row, Col, Avatar, DatePicker, Upload, Modal, Button } from 'antd'
import { EditOutlined, UploadOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { fetchUserDetail, updateUserProfile, uploadAvatarToCloudinary } from '../../../api/user-detail'
import PopupConfirm from './popup-confirm'
import DeleteUserConfirm from '../user-detail/DeleteUserConfirm'

const { Title, Text } = Typography

const getRoleLabel = (val) => {
  const r = Number(val)
  switch (r) {
    case 0: return 'Người dùng'
    case 1: return 'Quản trị viên'
    case 2: return 'Nhân viên'
    case 3: return 'Thành viên VIP'
    default: return String(val ?? '')
  }
}

export default function AccountDetails({ userId, onAfterChange, onBack, initialEdit = false }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [user, setUser] = useState(null)
  const [editing, setEditing] = useState(initialEdit)
  const [form, setForm] = useState({
    fullName: '',
    phoneNumber: '',
    dateOfBirth: '',
    role: 0,
    status: 0,
  })
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [avatarPreviewOpen, setAvatarPreviewOpen] = useState(false)
  const [previewAvatarUrl, setPreviewAvatarUrl] = useState(null)
  const [updatingAvatar, setUpdatingAvatar] = useState(false)

  const fmt = (val) => (val === null || val === undefined || val === '') ? 'N/A' : String(val)

  const fmtDate = (val) => {
    if (!val) return 'N/A'
    const d = new Date(val)
    return isNaN(d.getTime()) ? String(val) : d.toLocaleDateString('vi-VN')
  }

  const reloadUserDetail = async (mounted) => {
    try {
      setLoading(true)
      const detail = await fetchUserDetail(userId)
      if (mounted) {
        setUser(detail)
        setForm({
          fullName: detail.fullName || '',
          phoneNumber: detail.phoneNumber || '',
          dateOfBirth: detail.dateOfBirth ? String(detail.dateOfBirth).slice(0, 10) : '',
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

  useEffect(() => {
    let mounted = true
    if (userId) reloadUserDetail(mounted)
    return () => { mounted = false }
  }, [userId])

  const handleUpdateClick = () => setConfirmOpen(true)

  const getApiErrorMessage = (err, fallback) => {
    const apiMessage = err?.response?.data?.message
    const apiErrors = err?.response?.data?.errors
    const firstError = Array.isArray(apiErrors) && apiErrors.length ? apiErrors[0]?.description : null
    return apiMessage || firstError || err?.message || fallback
  }

  const handleConfirmUpdate = async () => {
    try {
      setSaving(true)
      const response = await updateUserProfile({
        targetUserId: user.userId || user.id,
        fullName: form.fullName,
        phoneNumber: form.phoneNumber,
        dateOfBirth: form.dateOfBirth,
        avatarUrl: user.avatarUrl || '',
        role: form.role,
        status: form.status,
      })
      message.success(response?.data || response?.message || 'Đã cập nhật tài khoản thành công')
      setEditing(false)
      setConfirmOpen(false)
      setUser((prev) => (prev ? { ...prev, ...form } : prev))
      onAfterChange?.()
      await reloadUserDetail(true)
    } catch (err) {
      message.error(getApiErrorMessage(err, 'Cập nhật tài khoản thất bại'))
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpload = async (file) => {
    try {
      setUploadingAvatar(true)
      const cloudinaryUrl = await uploadAvatarToCloudinary(file)
      setPreviewAvatarUrl(cloudinaryUrl)
      setAvatarPreviewOpen(true)
    } catch (err) {
      message.error(err?.message || 'Không thể upload ảnh')
    } finally {
      setUploadingAvatar(false)
    }
    return false
  }

  const handleConfirmAvatarUpdate = async () => {
    if (!previewAvatarUrl || !user) return
    try {
      setUpdatingAvatar(true)
      await updateUserProfile({
        targetUserId: user.userId || user.id,
        fullName: user.fullName || '',
        phoneNumber: user.phoneNumber || '',
        dateOfBirth: user.dateOfBirth ? String(user.dateOfBirth).slice(0, 10) : '',
        avatarUrl: previewAvatarUrl,
        role: Number(user.role ?? 0),
        status: Number(user.status ?? 0),
      })
      const updatedDetail = await fetchUserDetail(userId)
      setUser(updatedDetail)
      message.success('Đã cập nhật avatar thành công')
      setAvatarPreviewOpen(false)
      setPreviewAvatarUrl(null)
      onAfterChange?.()
    } catch (err) {
      message.error(getApiErrorMessage(err, 'Không thể cập nhật avatar'))
    } finally {
      setUpdatingAvatar(false)
    }
  }

  const handleCancelEditing = () => {
    if (user) {
      setForm({
        fullName: user.fullName || '',
        phoneNumber: user.phoneNumber || '',
        dateOfBirth: user.dateOfBirth ? String(user.dateOfBirth).slice(0, 10) : '',
        role: Number(user.role ?? 0),
        status: Number(user.status ?? 0),
      })
    }
    setEditing(false)
    setConfirmOpen(false)
  }

  if (loading) return <div style={{ minHeight: '40vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}><Spin /><Text type="secondary">Đang tải...</Text></div>
  if (error) return <div style={{ padding: 24 }}><Text type="danger">{error}</Text></div>
  if (!user) return <div style={{ padding: 24 }}><Text type="warning">Không tìm thấy tài khoản.</Text></div>

  return (
    <div style={{ padding: '24px', width: '100%', overflowX: 'hidden', boxSizing: 'border-box' }}>
      <Space direction="vertical" size="large" style={{ width: '100%', display: 'flex' }}>
        <div style={{ marginBottom: 8 }}>
          <Button onClick={onBack} style={{ minWidth: 120, paddingTop: 10, paddingBottom: 10 }}> Quay lại </Button>
        </div>

        <Row gutter={[16, 0]} style={{ margin: 0, width: '100%' }}>
          <Col xs={24} md={12}>
            <Card style={{ borderRadius: 8, height: '100%' }}>
              <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                  <div style={{ position: 'relative' }}>
                    <div title={Number(user.status) === 1 ? 'Hoạt động' : Number(user.status) === 2 ? 'Đã bị khóa' : 'Vô hiệu hóa'}
                      style={{ position: 'absolute', bottom: 0, left: 0, zIndex: 2, width: 30, height: 30, borderRadius: '50%', backgroundColor: Number(user.status) === 1 ? '#52c41a' : Number(user.status) === 2 ? '#ff4d4f' : '#d9d9d9', border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
                    <Avatar size={120} src={user.avatarUrl || undefined} style={{ border: '3px solid #e8e8e8', opacity: uploadingAvatar ? 0.5 : 1 }}>{!user.avatarUrl && (user.fullName?.[0]?.toUpperCase() || 'U')}</Avatar>
                    <Upload beforeUpload={handleAvatarUpload} showUploadList={false} accept="image/*" disabled={uploadingAvatar}>
                      <div style={{ position: 'absolute', bottom: 0, right: 0, background: uploadingAvatar ? '#ccc' : '#1890ff', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: uploadingAvatar ? 'not-allowed' : 'pointer', border: '2px solid white' }}>
                        <UploadOutlined style={{ color: 'white', fontSize: 16 }} />
                      </div>
                    </Upload>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <Title level={4} style={{ margin: '0 0 4px 0' }}>{fmt(user.fullName)}</Title>
                    <Text type="secondary" style={{ fontSize: 14 }}>{getRoleLabel(user.role)}</Text><br />
                    <Text type="secondary" style={{ fontSize: 12 }}><strong>UID: </strong>{user.userId || user.id}</Text>
                  </div>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <Row gutter={[24, 16]}>
                    <Col span={12}>
                      <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Email:</Text><Text strong>{fmt(user.email)}</Text>
                      <div style={{ marginTop: 16 }}><Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Số điện thoại:</Text><Text strong>{fmt(user.phoneNumber)}</Text></div>
                    </Col>
                    <Col span={12}>
                      <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Ngày tạo:</Text><Text strong>{fmtDate(user.createdAt)}</Text>
                      <div style={{ marginTop: 16 }}><Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Ngày cập nhật:</Text><Text strong>{fmtDate(user.updatedAt)}</Text></div>
                    </Col>
                  </Row>
                  <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                    {Number(user.status) !== 0 && <Button danger onClick={() => setDeleteOpen(true)} style={{ minWidth: 140 }}>Vô hiệu hóa</Button>}
                    {editing && <Button onClick={handleCancelEditing} style={{ minWidth: 140 }}>Hủy</Button>}
                    <Button type="primary" onClick={handleUpdateClick} style={{ minWidth: 140 }}>{editing ? 'Lưu' : 'Cập nhật'}</Button>
                  </div>
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card title={<div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Thông tin cá nhân</span>{editing && <EditOutlined style={{ color: '#1890ff' }} />}</div>} style={{ borderRadius: 8, height: '100%' }}>
              <Descriptions column={1} size="small" bordered>
                <Descriptions.Item label="Họ tên">{editing ? <Input value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} size="small" /> : fmt(user.fullName)}</Descriptions.Item>
                <Descriptions.Item label="Ngày sinh">{editing ? <DatePicker value={form.dateOfBirth ? dayjs(form.dateOfBirth) : null} onChange={(date) => setForm((f) => ({ ...f, dateOfBirth: date ? date.format('YYYY-MM-DD') : '' }))} format="DD/MM/YYYY" style={{ width: '100%' }} size="small" /> : fmtDate(user.dateOfBirth)}</Descriptions.Item>
                <Descriptions.Item label="Vai trò">{editing ? <Select value={form.role} onChange={(v) => setForm((f) => ({ ...f, role: v }))} style={{ width: '100%' }} size="small" options={[{ value: 0, label: 'Người dùng' }, { value: 1, label: 'Quản trị viên' }, { value: 2, label: 'Nhân viên' }, { value: 3, label: 'Thành viên VIP' }]} /> : getRoleLabel(user.role)}</Descriptions.Item>
                <Descriptions.Item label="Số điện thoại">{editing ? <Input value={form.phoneNumber} onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))} size="small" /> : fmt(user.phoneNumber)}</Descriptions.Item>
                {editing && <Descriptions.Item label="Trạng thái"><Select value={form.status} onChange={(v) => setForm((f) => ({ ...f, status: v }))} style={{ width: '100%' }} size="small" options={[{ value: 0, label: 'Vô hiệu hóa' }, { value: 1, label: 'Hoạt động' }, { value: 2, label: 'Đã bị khóa' }]} /></Descriptions.Item>}
              </Descriptions>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ margin: 0, width: '100%' }}>
          <Col span={24}>
            <Card title="Thông tin thành viên" style={{ borderRadius: 8, height: '100%' }}>
              <Descriptions column={1} size="small" bordered labelStyle={{ width: '50%', minWidth: '100px' }}>
                <Descriptions.Item label="VIP hết hạn">{fmtDate(user.vipExpirationDate)}</Descriptions.Item>
                <Descriptions.Item label="Current streak">{fmt(user.currentStreak)}</Descriptions.Item>
                <Descriptions.Item label="Loại thành viên">{Number(user.role) === 3 ? <Text style={{ color: '#d4b106', fontWeight: 'bold' }}>VIP</Text> : <Text>Thường</Text>}</Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        </Row>

        {/* Cụm nút phía cuối trang đã được giữ nguyên */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <Button onClick={onBack} style={{ minWidth: 120, paddingTop: 10, paddingBottom: 10 }}> Quay lại </Button>
          {editing && <Button onClick={handleCancelEditing} style={{ minWidth: 120, paddingTop: 10, paddingBottom: 10 }}> Hủy </Button>}
          <Button type="primary" onClick={handleUpdateClick} style={{ minWidth: 120, paddingTop: 10, paddingBottom: 10 }}> {editing ? 'Lưu' : 'Cập nhật'} </Button>
        </div>
      </Space>

      <Modal open={avatarPreviewOpen} title="Xác nhận cập nhật avatar" onOk={handleConfirmAvatarUpdate} onCancel={() => setAvatarPreviewOpen(false)} okText="Xác nhận" cancelText="Hủy" confirmLoading={updatingAvatar} width={400}>
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Avatar size={200} src={previewAvatarUrl || undefined} style={{ border: '3px solid #e8e8e8', marginBottom: 16 }}>{!previewAvatarUrl && 'U'}</Avatar>
          <Text type="secondary" style={{ display: 'block' }}>Bạn có muốn cập nhật avatar này không?</Text>
        </div>
      </Modal>

      <PopupConfirm
        open={confirmOpen}
        title={editing ? 'Xác nhận cập nhật' : 'Bật chế độ cập nhật'}
        content={editing ? 'Bạn có chắc chắn muốn lưu các thay đổi này không?' : 'Bạn có muốn bắt đầu chỉnh sửa thông tin tài khoản này không?'}
        okText={editing ? 'Lưu' : 'Bắt đầu'}
        cancelText="Quay lại"
        onOk={editing ? handleConfirmUpdate : () => { setEditing(true); setConfirmOpen(false); }}
        onCancel={() => setConfirmOpen(false)}
        confirmLoading={editing ? saving : false}
      />

      <DeleteUserConfirm open={deleteOpen} user={user} onConfirm={async () => { setDeleteOpen(false); onBack(); }} onCancel={() => setDeleteOpen(false)} />
    </div>
  )
}