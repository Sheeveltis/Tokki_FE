import { useEffect, useState } from 'react'
import { Card, Descriptions, Space, Spin, Typography, message, Input, Select, Row, Col, Avatar, DatePicker, Upload, Modal, Button, Tabs, Tag, Statistic, Divider, Badge } from 'antd'
import {
  EditOutlined,
  UploadOutlined,
  InfoCircleOutlined,
  CrownOutlined,
  SaveOutlined,
  CloseOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  TrophyOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
  HistoryOutlined,
  SafetyCertificateOutlined,
  LoginOutlined,
  CalendarOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  FireOutlined
} from '@ant-design/icons'
import ImgCrop from 'antd-img-crop'
import dayjs from 'dayjs'
import { fetchUserDetail, updateUserProfile, uploadAvatarToCloudinary } from '../../../api/user-detail'
import DeleteUserConfirm from '../user-detail/DeleteUserConfirm'
import UserEditModal from './user-edit-modal'

const { Title, Text } = Typography

const ROLE_OPTIONS = [
  { value: 0, label: 'Người dùng' },
  { value: 1, label: 'Quản trị viên' },
  { value: 2, label: 'Nhân viên' },
  { value: 3, label: 'Thành viên VIP' }
]

const getRoleLabel = (val) => {
  const r = Number(val)
  return ROLE_OPTIONS.find(opt => opt.value === r)?.label || String(val ?? '')
}

export default function AccountDetails({ userId, onAfterChange, onBack, initialEdit = false }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [user, setUser] = useState(null)
  const [editModalOpen, setEditModalOpen] = useState(initialEdit)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [avatarPreviewOpen, setAvatarPreviewOpen] = useState(false)
  const [previewAvatarUrl, setPreviewAvatarUrl] = useState(null)
  const [updatingAvatar, setUpdatingAvatar] = useState(false)

  const fmt = (val) => (val === null || val === undefined || val === '') ? 'N/A' : String(val)

  const fmtDate = (val) => {
    if (!val) return 'N/A'
    const d = new Date(val)
    return isNaN(d.getTime()) ? String(val) : d.toLocaleString('vi-VN')
  }

  const fmtOnlyDate = (val) => {
    if (!val) return 'N/A'
    const d = new Date(val)
    return isNaN(d.getTime()) ? String(val) : d.toLocaleDateString('vi-VN')
  }

  const fmtDuration = (seconds) => {
    if (!seconds) return '0 phút'
    if (seconds < 60) return `${seconds} giây`
    const mins = Math.floor(seconds / 60)
    return `${mins} phút`
  }

  const reloadUserDetail = async (mounted) => {
    try {
      setLoading(true)
      const detail = await fetchUserDetail(userId)
      if (mounted) {
        setUser(detail)
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

  const getApiErrorMessage = (err, fallback) => {
    const apiMessage = err?.response?.data?.message
    const apiErrors = err?.response?.data?.errors
    const firstError = Array.isArray(apiErrors) && apiErrors.length ? apiErrors[0]?.description : null
    return apiMessage || firstError || err?.message || fallback
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

  if (loading) return <div style={{ minHeight: '40vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}><Spin /><Text type="secondary">Đang tải...</Text></div>
  if (error) return <div style={{ padding: 24 }}><Text type="danger">{error}</Text></div>
  if (!user) return <div style={{ padding: 24 }}><Text type="warning">Không tìm thấy tài khoản.</Text></div>

  const tabItems = [
    {
      key: 'info',
      label: <Space><InfoCircleOutlined /><span style={{ fontWeight: 500 }}>Thông tin chung</span></Space>,
      children: (
        <div style={{ padding: '24px 0' }}>
          <Row gutter={[24, 24]} style={{ margin: 0, width: '100%' }}>
            <Col xs={24} lg={10}>
              <Card style={{ borderRadius: 12, height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 12 }}>
                  <div style={{ position: 'relative', marginBottom: 20 }}>
                    <div title={Number(user.status) === 1 ? 'Hoạt động' : Number(user.status) === 2 ? 'Đã bị khóa' : 'Vô hiệu hóa'}
                      style={{ position: 'absolute', bottom: 8, left: 4, zIndex: 2, width: 36, height: 36, borderRadius: '50%', backgroundColor: Number(user.status) === 1 ? '#52c41a' : Number(user.status) === 2 ? '#ff4d4f' : '#d9d9d9', border: '3px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                    <Avatar size={160} src={user.avatarUrl || undefined} style={{ border: '4px solid #f0f2f5', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', opacity: uploadingAvatar ? 0.5 : 1 }}>{!user.avatarUrl && (user.fullName?.[0]?.toUpperCase() || 'U')}</Avatar>
                    <ImgCrop rotation aspect={1} cropShape="round" okText="Xác nhận" cancelText="Hủy" modalTitle="Chỉnh sửa ảnh đại diện">
                      <Upload
                        beforeUpload={handleAvatarUpload}
                        showUploadList={false}
                        accept="image/*"
                        disabled={uploadingAvatar}
                      >
                        <div style={{ position: 'absolute', bottom: 8, right: 8, background: uploadingAvatar ? '#ccc' : '#1890ff', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: uploadingAvatar ? 'not-allowed' : 'pointer', border: '3px solid white', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}>
                          <UploadOutlined style={{ color: 'white', fontSize: 18 }} />
                        </div>
                      </Upload>
                    </ImgCrop>
                  </div>
                  <Title level={3} style={{ margin: '0 0 4px 0', textAlign: 'center' }}>{fmt(user.fullName)}</Title>
                  <Tag color={user.role === 1 ? 'red' : user.role === 2 ? 'orange' : user.role === 3 ? 'gold' : 'blue'} style={{ borderRadius: 12, padding: '0 12px', marginBottom: 24 }}>
                    {getRoleLabel(user.role).toUpperCase()}
                  </Tag>

                  <Divider style={{ margin: '12px 0' }} />

                  <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#e6f7ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MailOutlined style={{ color: '#1890ff' }} /></div>
                      <div>
                        <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Email</Text>
                        <Text strong>{fmt(user.email)}</Text>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#f6ffed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><PhoneOutlined style={{ color: '#52c41a' }} /></div>
                      <div>
                        <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Số điện thoại</Text>
                        <Text strong>{fmt(user.phoneNumber)}</Text>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#fff7e6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><UserOutlined style={{ color: '#fa8c16' }} /></div>
                      <div>
                        <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Mã định danh (ID)</Text>
                        <Text code>{user.userId || user.id}</Text>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>

            <Col xs={24} lg={14}>
              <Card
                title={<Space><EditOutlined style={{ color: '#1890ff' }} /><span>Chi tiết cá nhân</span></Space>}
                style={{ borderRadius: 12, height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                extra={<Button type="text" icon={<EditOutlined />} onClick={() => setEditModalOpen(true)}>Sửa</Button>}
              >
                <Descriptions column={1} bordered size="middle" labelStyle={{ width: '30%', fontWeight: 500, backgroundColor: '#fafafa' }}>
                  <Descriptions.Item label="Họ và tên">
                    <Text strong>{fmt(user.fullName)}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày sinh">
                    {fmtOnlyDate(user.dateOfBirth)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Email">{fmt(user.email)}</Descriptions.Item>
                  <Descriptions.Item label="Số điện thoại">
                    {fmt(user.phoneNumber)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Địa chỉ IP đăng nhập">{user.ipAddress || 'Không rõ'}</Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>
          </Row>
        </div>
      )
    },
    {
      key: 'study',
      label: <Space><TrophyOutlined /><span style={{ fontWeight: 500 }}>Tiến độ học tập</span></Space>,
      children: (
        <div style={{ padding: '24px 0' }}>
          <Row gutter={[24, 24]} style={{ margin: 0, width: '100%' }}>
            <Col xs={24} sm={12} md={6}>
              <Card style={{ borderRadius: 12, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <Statistic title="Tổng XP" value={user.totalXP || 0} prefix={<TrophyOutlined style={{ color: '#faad14' }} />} />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card style={{ borderRadius: 12, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <Statistic title="Ngày học liên tiếp" value={user.achievedGoalStreak || 0} prefix={<ThunderboltOutlined style={{ color: '#fadb14' }} />} suffix="ngày" />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card style={{ borderRadius: 12, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <Statistic title="Streak cao nhất" value={user.maxStreak || 0} prefix={<FireOutlined style={{ color: '#ff4d4f' }} />} suffix="ngày" />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card style={{ borderRadius: 12, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <Statistic title="Mục tiêu hàng ngày" value={Math.floor((user.dailyStudySeconds || 0) / 60)} prefix={<ClockCircleOutlined style={{ color: '#1890ff' }} />} suffix="phút" />
              </Card>
            </Col>

            <Col span={24}>
              <Card title={<Space><SafetyCertificateOutlined style={{ color: '#52c41a' }} /><span>Thành tựu & Chỉ số</span></Space>} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
                  <Descriptions.Item label="Danh hiệu hiện tại">{user.currentTitleName || user.currentTitleId || 'Chưa có danh hiệu'}</Descriptions.Item>
                  <Descriptions.Item label="Ngày Streak cuối">{fmtOnlyDate(user.lastStreakDate)}</Descriptions.Item>
                  <Descriptions.Item label="Thời gian học hôm nay">{fmtDuration(user.dailyStudySeconds)}</Descriptions.Item>
                  <Descriptions.Item label="Level học tập">Level {Math.floor((user.totalXP || 0) / 1000) + 1}</Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>
          </Row>
        </div>
      )
    },
    {
      key: 'account',
      label: <Space><HistoryOutlined /><span style={{ fontWeight: 500 }}>Tài khoản & Hệ thống</span></Space>,
      children: (
        <div style={{ padding: '24px 0' }}>
          <Row gutter={[24, 24]} style={{ margin: 0, width: '100%' }}>
            <Col xs={24} md={12}>
              <Card title={<Space><CrownOutlined style={{ color: '#faad14' }} /><span>Thông tin VIP</span></Space>} style={{ borderRadius: 12, height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <Descriptions column={1} bordered size="small">
                  <Descriptions.Item label="Trạng thái VIP">
                    {user.vipExpirationDate ? <Tag color="gold">ĐANG TRẢ PHÍ</Tag> : <Tag>THÀNH VIÊN THƯỜNG</Tag>}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày hết hạn VIP">{fmtDate(user.vipExpirationDate)}</Descriptions.Item>
                  <Descriptions.Item label="Gói dịch vụ">Gói cơ bản</Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>

            <Col xs={24} md={12}>
              <Card title={<Space><LoginOutlined style={{ color: '#1890ff' }} /><span>Trạng thái tài khoản</span></Space>} style={{ borderRadius: 12, height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <Descriptions column={1} bordered size="small">
                  <Descriptions.Item label="Vai trò">
                    <Tag color="blue">{getRoleLabel(user.role)}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Trạng thái">
                    <Badge status={user.status === 1 ? 'success' : user.status === 2 ? 'error' : 'default'} text={user.status === 1 ? 'Đang hoạt động' : user.status === 2 ? 'Bị khóa' : 'Vô hiệu hóa'} />
                  </Descriptions.Item>
                  <Descriptions.Item label="Lần đăng nhập cuối">{fmtDate(user.lastLoginAt)}</Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>

            <Col span={24}>
              <Card title={<Space><CalendarOutlined style={{ color: '#8c8c8c' }} /><span>Lịch sử hệ thống</span></Space>} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <Descriptions column={2} bordered size="small">
                  <Descriptions.Item label="Ngày tạo">{fmtDate(user.createdAt)}</Descriptions.Item>
                  <Descriptions.Item label="Cập nhật lần cuối">{fmtDate(user.updatedAt)}</Descriptions.Item>
                  <Descriptions.Item label="Số lần đăng nhập sai">{user.failedLoginCount || 0}</Descriptions.Item>
                  <Descriptions.Item label="Khóa đến ngày">{fmtDate(user.lockedUntil)}</Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>
          </Row>
        </div>
      )
    }
  ]

  return (
    <div style={{ width: '100%', overflowX: 'hidden', boxSizing: 'border-box' }}>
      <div style={{
        padding: '0 0 24px 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12
      }}>
        <div>
          <Title level={3} style={{ marginBottom: 4, marginTop: 0 }}>
            Chi tiết người dùng
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>ID: {user.userId || user.id}</Text>
        </div>

        <Space size="small" wrap>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={onBack}
            style={{
              borderRadius: 20,
              height: 40,
              padding: '0 20px',
              fontWeight: 600,
            }}
          >
            Quay lại
          </Button>

          <Divider type="vertical" style={{ height: 24, margin: '0 12px', borderLeft: '2px solid #e8e8e8ff' }} />

          <Button
            type="primary"
            onClick={() => setEditModalOpen(true)}
            icon={<EditOutlined />}
            style={{
              borderRadius: 20,
              height: 40,
              padding: '0 20px',
              fontWeight: 600,
            }}
          >
            Chỉnh sửa thông tin cá nhân
          </Button>

          {Number(user.status) !== 0 && (
            <Button
              danger
              onClick={() => setDeleteOpen(true)}
              icon={<DeleteOutlined />}
              style={{
                borderRadius: 20,
                height: 40,
                padding: '0 20px',
                fontWeight: 600,
              }}
            >
              Xóa
            </Button>
          )}
        </Space>
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0', overflow: 'hidden' }}>
        <Tabs
          items={tabItems}
          tabBarStyle={{ padding: '16px 24px 0', borderBottom: '1px solid #f0f0f0', background: '#ffffff', margin: 0 }}
          style={{ padding: '0 24px' }}
        />
      </div>

      <Modal 
        open={avatarPreviewOpen} 
        title="Xác nhận cập nhật avatar" 
        onOk={handleConfirmAvatarUpdate} 
        onCancel={() => setAvatarPreviewOpen(false)} 
        okText="Xác nhận" 
        cancelText="Hủy" 
        confirmLoading={updatingAvatar} 
        width={400}
        centered
        okButtonProps={{ style: { borderRadius: '2rem', height: 40, padding: '0 24px', fontWeight: 600 } }}
        cancelButtonProps={{ style: { borderRadius: '2rem', height: 40, padding: '0 24px', fontWeight: 600 } }}
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Avatar size={200} src={previewAvatarUrl || undefined} style={{ border: '3px solid #e8e8e8', marginBottom: 16 }}>{!previewAvatarUrl && 'U'}</Avatar>
          <Text type="secondary" style={{ display: 'block' }}>Bạn có muốn cập nhật avatar này không?</Text>
        </div>
      </Modal>

      <UserEditModal
        open={editModalOpen}
        userId={userId}
        onOk={() => {
          setEditModalOpen(false)
          reloadUserDetail(true)
          onAfterChange?.()
        }}
        onCancel={() => setEditModalOpen(false)}
      />

      <DeleteUserConfirm open={deleteOpen} user={user} onConfirm={async () => { setDeleteOpen(false); onBack(); }} onCancel={() => setDeleteOpen(false)} />
    </div>
  )
}