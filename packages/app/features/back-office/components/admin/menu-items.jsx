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
  TrophyOutlined,
} from '@ant-design/icons'

export const adminMenuItems = [
  {
    key: 'users',
    icon: <UserOutlined />,
    label: 'Quản lý Người dùng',
    children: [
      { key: 'users-all', icon: <UserOutlined />, label: 'Người dùng' },
      { key: 'title-management', icon: <TrophyOutlined />, label: 'Danh hiệu' },
    ],
  },
  {
    key: 'vocabulary',
    icon: <DatabaseOutlined />,
    label: 'Quản lý Từ vựng',
    children: [
      { key: 'vocabulary-words', icon: <DatabaseOutlined />, label: 'Từ vựng' },
      { key: 'vocabulary-topics', icon: <BookOutlined />, label: 'Chủ đề' },
    ],
  },
  {
    key: 'pronunciation-parent',
    icon: <CustomerServiceOutlined />,
    label: 'Quản lý Phát âm',
    children: [
      { key: 'pronunciation-management', icon: <MessageOutlined />, label: 'Quy tắc phát âm' },
    ],
  },
  {
    key: 'exam',
    icon: <FileDoneOutlined />,
    label: 'Quản lý Đề',
    children: [
      { key: 'question-bank', icon: <QuestionCircleOutlined />, label: 'Bộ câu hỏi' },
      { key: 'exam-template', icon: <FormOutlined />, label: 'Cấu trúc đề' },
      // { key: 'passage-management', icon: <FileTextOutlined />, label: 'Passage' },
      { key: 'exam-management', icon: <FileDoneOutlined />, label: 'Đề' },
    ],
  },
  {
    key: 'blog-parent',
    icon: <FileTextOutlined />,
    label: 'Quản lý Bài viết',
    children: [
      { key: 'blog', icon: <FileTextOutlined />, label: 'Bài viết' },
      { key: 'blog-category', icon: <BookOutlined />, label: 'Danh mục' },
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
      { key: 'membership-package', icon: <ShopOutlined />, label: 'Gói thành viên' },
      { key: 'payment-management', icon: <DollarOutlined />, label: 'Thanh toán' },
      { key: 'revenue-report', icon: <PieChartOutlined />, label: 'Báo cáo doanh thu' },
    ],
  },
  // { key: 'ai-statistics', icon: <ThunderboltOutlined />, label: 'Báo cáo thống kê A.I' },
  // { key: 'system-log', icon: <DatabaseOutlined />, label: 'System Log' },
  // { key: 'settings', icon: <SettingOutlined />, label: 'Cài đặt' },
  { key: 'system-config', icon: <DatabaseOutlined />, label: 'Cấu hình hệ thống' },
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

