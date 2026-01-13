import {
  UserOutlined,
  TeamOutlined,
  BookOutlined,
  FileTextOutlined,
  SettingOutlined,
  DatabaseOutlined,
  PoweroffOutlined,
  CustomerServiceOutlined,
  MessageOutlined,
  MailOutlined,
  InboxOutlined,
  DollarOutlined,
  PieChartOutlined,
  ShopOutlined,
  ThunderboltOutlined,
  FormOutlined,
  QuestionCircleOutlined,
  FileDoneOutlined,
} from '@ant-design/icons'

export const adminMenuItems = [
  {
    key: 'users',
    icon: <UserOutlined />,
    label: 'Quản lý Người dùng',
    children: [
      { key: 'users-admin', icon: <TeamOutlined />, label: 'Admin & Staff' },
      { key: 'users-all', icon: <UserOutlined />, label: 'Tất cả Users' },
    ],
  },
  {
    key: 'content',
    icon: <BookOutlined />,
    label: 'Quản lý Nội dung',
    children: [
      { key: 'lessons', icon: <BookOutlined />, label: 'Bài học' },
      { key: 'blog', icon: <FileTextOutlined />, label: 'Bài viết' },
    ],
  },
  {
    key: 'vocabulary',
    icon: <DatabaseOutlined />,
    label: 'Quản lý Từ vựng',
    children: [
      { key: 'vocabulary-words', icon: <DatabaseOutlined />, label: 'Quản lý từ vựng' },
      { key: 'vocabulary-topics', icon: <BookOutlined />, label: 'Quản lý chủ đề' },
    ],
  },
  {
    key: 'exam',
    icon: <FileDoneOutlined />,
    label: 'Quản lý Đề',
    children: [
      { key: 'exam-template', icon: <FormOutlined />, label: 'Cấu trúc đề' },
      { key: 'question-bank', icon: <QuestionCircleOutlined />, label: 'Ngân hàng câu hỏi' },
      { key: 'passage-management', icon: <FileTextOutlined />, label: 'Quản lí Passage' },
      { key: 'exam-management', icon: <FileDoneOutlined />, label: 'Đề' },
    ],
  },
  {
    key: 'customer-service',
    icon: <CustomerServiceOutlined />,
    label: 'Chăm sóc khách hàng',
    children: [
      { key: 'chat-support', icon: <MessageOutlined />, label: 'Khung chat' },
      { key: 'auto-email', icon: <MailOutlined />, label: 'Gửi mail tự động' },
      { key: 'manual-email', icon: <MailOutlined />, label: 'Gửi mail thủ công' },
      { key: 'feedback-inbox', icon: <InboxOutlined />, label: 'Hòm thư feedback' },
    ],
  },
  {
    key: 'revenue',
    icon: <DollarOutlined />,
    label: 'Quản lý doanh thu',
    children: [
      { key: 'membership-package', icon: <ShopOutlined />, label: 'Quản lý gói thành viên' },
      { key: 'payment-management', icon: <DollarOutlined />, label: 'Quản lý thanh toán' },
      { key: 'revenue-report', icon: <PieChartOutlined />, label: 'Báo cáo doanh thu' },
    ],
  },
  { key: 'ai-statistics', icon: <ThunderboltOutlined />, label: 'Báo cáo thống kê A.I' },
  { key: 'system-log', icon: <DatabaseOutlined />, label: 'System Log' },
  { key: 'settings', icon: <SettingOutlined />, label: 'Cài đặt' },
  {
    type: 'divider',
  },
  {
    key: 'logout',
    icon: <PoweroffOutlined />,
    label: <span style={{ color: '#ff4d4f', fontWeight: 600 }}>Đăng xuất</span>,
    danger: true,
  },
]

