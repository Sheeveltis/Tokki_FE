import React, { useEffect, useState } from 'react'
import { Card, Descriptions, Space, Spin, Typography, Tag, message, Input, Select, Row, Col, Avatar, DatePicker, Upload, Modal } from 'antd'
import { EditOutlined, UploadOutlined } from '@ant-design/icons'
import { useRouter } from 'solito/navigation'
import dayjs from 'dayjs'
import { fetchUserDetail, updateUserProfile, uploadAvatarToCloudinary } from '../../UserDetail/api/api'
import PopupConfirm from './popup-confirm'
import DeleteUserConfirm from '../../UserDetail/modal/DeleteUserConfirm'
import { showAdminSuccess, showAdminError } from 'components/HelperAdmin'
import { ButtonV2 } from 'components/buttonV2.jsx'

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
    case 4:
      return 'Kiểm duyệt viên'
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
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [user, setUser] = useState(null)
  const [editing, setEditing] = useState(false)
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
        avatarUrl: user.avatarUrl || '',
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

  const handleAvatarUpload = async (file) => {
    try {
      setUploadingAvatar(true)
      // Upload ảnh lên Cloudinary
      const cloudinaryUrl = await uploadAvatarToCloudinary(file)
      
      // Hiển thị preview và xác nhận
      setPreviewAvatarUrl(cloudinaryUrl)
      setAvatarPreviewOpen(true)
    } catch (err) {
      console.error('Error uploading avatar to Cloudinary:', err)
      showAdminError?.(err?.message || 'Không thể upload ảnh')
      message.error(err?.message || 'Không thể upload ảnh')
    } finally {
      setUploadingAvatar(false)
    }
    return false // Prevent default upload
  }

  const handleConfirmAvatarUpdate = async () => {
    if (!previewAvatarUrl || !user) return
    
    try {
      setUpdatingAvatar(true)
      // Gọi cùng API updateUserProfile nhưng chỉ thay đổi avatarUrl, các thông tin khác giữ nguyên
      await updateUserProfile({
        targetUserId: user.userId || user.id,
        fullName: user.fullName || '',
        phoneNumber: user.phoneNumber || '',
        dateOfBirth: user.dateOfBirth ? String(user.dateOfBirth).slice(0, 10) : '',
        avatarUrl: previewAvatarUrl,
        role: Number(user.role ?? 0),
        status: Number(user.status ?? 0),
      })
      
      // Cập nhật lại user data
      const updatedDetail = await fetchUserDetail(userId)
      setUser(updatedDetail)
      showAdminSuccess('Đã cập nhật avatar thành công')
      setAvatarPreviewOpen(false)
      setPreviewAvatarUrl(null)
      onAfterChange?.()
    } catch (err) {
      console.error('Error updating avatar:', err)
      showAdminError?.(err?.message || 'Không thể cập nhật avatar')
      message.error(err?.message || 'Không thể cập nhật avatar')
    } finally {
      setUpdatingAvatar(false)
    }
  }

  const handleCancelAvatarUpdate = () => {
    setAvatarPreviewOpen(false)
    setPreviewAvatarUrl(null)
  }

  const handleCancelUpdate = () => {
    // Reset form về giá trị ban đầu từ user
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

  const userIdDisplay = user.userId || user.id
  const roleLabel = getRoleLabel(user.role)
  const roleDisplay = roleLabel !== 'Người dùng' ? roleLabel : `Người dùng | ${userIdDisplay}`

  return (
    <div style={{ padding: 24, background: '#f5f5f5', minHeight: '100vh' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Back Button */}
        <div style={{ marginBottom: 8 }}>
          <ButtonV2
            title="Quay lại"
            color="charcoal"
            onPress={() => router.back()}
            style={{ minWidth: 120, paddingVertical: 10 }}
            textStyle={{ fontSize: 14 }}
          />
        </div>

        {/* Header Section */}
        <Card style={{ borderRadius: 8 }}>
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
            {/* Avatar Section */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div style={{ position: 'relative' }}>
                {uploadingAvatar && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      zIndex: 10,
                      background: 'rgba(255, 255, 255, 0.8)',
                      borderRadius: '50%',
                      width: 120,
                      height: 120,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Spin />
                  </div>
                )}
                <Avatar
                  size={120}
                  src={user.avatarUrl || undefined}
                  style={{ border: '3px solid #e8e8e8', opacity: uploadingAvatar ? 0.5 : 1 }}
                >
                  {!user.avatarUrl && (user.fullName?.[0]?.toUpperCase() || 'U')}
                </Avatar>
                <Upload
                  beforeUpload={handleAvatarUpload}
                  showUploadList={false}
                  accept="image/*"
                  disabled={uploadingAvatar}
                >
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      background: uploadingAvatar ? '#ccc' : '#1890ff',
                      borderRadius: '50%',
                      width: 32,
                      height: 32,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: uploadingAvatar ? 'not-allowed' : 'pointer',
                      border: '2px solid white',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    }}
                  >
                    <UploadOutlined style={{ color: 'white', fontSize: 16 }} />
                  </div>
                </Upload>
              </div>
              <div style={{ textAlign: 'center' }}>
                <Title level={4} style={{ margin: 0, marginBottom: 4 }}>
                  {fmt(user.fullName)}
                </Title>
                <Text type="secondary" style={{ fontSize: 14 }}>
                  {roleDisplay}
                </Text>
              </div>
            </div>

            {/* Info Section */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Row gutter={[24, 16]}>
                <Col span={12}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                        Email:
                      </Text>
                      <Text strong style={{ fontSize: 14 }}>
                        {fmt(user.email)}
                      </Text>
                    </div>
                    <div>
                      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                        Số điện thoại:
                      </Text>
                      <Text strong style={{ fontSize: 14 }}>
                        {fmt(user.phoneNumber)}
                      </Text>
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                        Ngày tạo:
                      </Text>
                      <Text strong style={{ fontSize: 14 }}>
                        {fmtDate(user.createdAt)}
                      </Text>
                    </div>
                    <div>
                      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                        Ngày cập nhật:
                      </Text>
                      <Text strong style={{ fontSize: 14 }}>
                        {fmtDate(user.updatedAt)}
                      </Text>
                    </div>
                  </div>
                </Col>
              </Row>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                {Number(user.status) !== 0 && (
                  <ButtonV2
                    title="Vô hiệu hóa"
                    color="charcoal"
                    onPress={handleDisable}
                    style={{ minWidth: 140, paddingVertical: 10 }}
                    textStyle={{ fontSize: 14 }}
                  />
                )}
                <ButtonV2
                  title={editing ? 'Xác nhận cập nhật' : 'Cập nhật'}
                  color="poppy"
                  onPress={handleUpdateClick}
                  style={{ minWidth: 140, paddingVertical: 10 }}
                  textStyle={{ fontSize: 14 }}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* 2 Cards Section */}
        <Row gutter={[16, 16]}>
          {/* Card 1: Thông tin cá nhân */}
          <Col xs={24} sm={24} md={12}>
            <Card
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Thông tin cá nhân</span>
                  {editing && <EditOutlined style={{ color: '#1890ff' }} />}
                </div>
              }
              style={{ borderRadius: 8, height: '100%' }}
            >
              <Descriptions column={1} size="small" bordered>
                <Descriptions.Item label="Họ tên">
                  {editing ? (
                    <Input
                      value={form.fullName}
                      onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                      size="small"
                    />
                  ) : (
                    fmt(user.fullName)
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày sinh">
                  {editing ? (
                    <DatePicker
                      value={form.dateOfBirth ? dayjs(form.dateOfBirth) : null}
                      onChange={(date) => {
                        setForm((f) => ({
                          ...f,
                          dateOfBirth: date ? date.format('YYYY-MM-DD') : '',
                        }))
                      }}
                      format="DD/MM/YYYY"
                      style={{ width: '100%' }}
                      size="small"
                      placeholder="Chọn ngày sinh"
                    />
                  ) : (
                    fmtDate(user.dateOfBirth)
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Vai trò">
                  {editing ? (
                    <Select
                      value={form.role}
                      onChange={(value) => setForm((f) => ({ ...f, role: value }))}
                      style={{ width: '100%' }}
                      size="small"
                      options={[
                        { value: 0, label: 'Người dùng' },
                        { value: 1, label: 'Quản trị viên' },
                        { value: 2, label: 'Nhân viên' },
                        { value: 3, label: 'Thành viên VIP' },
                        { value: 4, label: 'Người giám sát' },
                      ]}
                    />
                  ) : (
                    getRoleLabel(user.role)
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="User ID">{userIdDisplay}</Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  {editing ? (
                    <Select
                      value={form.status}
                      onChange={(value) => setForm((f) => ({ ...f, status: value }))}
                      style={{ width: '100%' }}
                      size="small"
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
              </Descriptions>
            </Card>
          </Col>

          {/* Card 2: Thông tin thành viên */}
          <Col xs={24} sm={24} md={12}>
            <Card
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Thông tin thành viên</span>
                  {editing && <EditOutlined style={{ color: '#1890ff' }} />}
                </div>
              }
              style={{ borderRadius: 8, height: '100%' }}
            >
              <Descriptions column={1} size="small" bordered>
                <Descriptions.Item label="VIP hết hạn">{fmtDate(user.vipExpirationDate)}</Descriptions.Item>
                <Descriptions.Item label="Current streak">{fmt(user.currentStreak)}</Descriptions.Item>
                <Descriptions.Item label="Loại thành viên">
                  {Number(user.role) === 3 ? (
                    <Tag color="gold">VIP</Tag>
                  ) : (
                    <Tag>Thường</Tag>
                  )}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        </Row>
      </Space>
      {/* Avatar Preview Modal */}
      <Modal
        open={avatarPreviewOpen}
        title="Xác nhận cập nhật avatar"
        onOk={handleConfirmAvatarUpdate}
        onCancel={handleCancelAvatarUpdate}
        okText="Xác nhận"
        cancelText="Hủy"
        confirmLoading={updatingAvatar}
        width={400}
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
            Xem trước avatar mới:
          </Text>
          <Avatar
            size={200}
            src={previewAvatarUrl || undefined}
            style={{ border: '3px solid #e8e8e8', marginBottom: 16 }}
          >
            {!previewAvatarUrl && (user?.fullName?.[0]?.toUpperCase() || 'U')}
          </Avatar>
          <div style={{ marginTop: 16 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Bạn có muốn cập nhật avatar này không?
            </Text>
          </div>
        </div>
      </Modal>

      <PopupConfirm
        open={confirmOpen}
        title="Xác nhận cập nhật tài khoản"
        content="Bạn có chắc chắn muốn cập nhật thông tin tài khoản này không?"
        okText="Cập nhật"
        cancelText="Hủy"
        confirmLoading={saving}
        onOk={handleConfirmUpdate}
        onCancel={handleCancelUpdate}
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


