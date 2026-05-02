import React from 'react'
import { 
  GlobalOutlined, 
  RobotOutlined, 
  NotificationOutlined, 
  ReadOutlined, 
  TrophyOutlined, 
  LockOutlined, 
  FileSearchOutlined, 
  BookOutlined, 
  LineChartOutlined, 
  CreditCardOutlined, 
  SettingOutlined, 
  LayoutOutlined, 
  MailOutlined, 
  AudioOutlined, 
  ThunderboltOutlined 
} from '@ant-design/icons'

export const SYSTEM_CONFIG_TYPES = [
  { value: 0, label: "Chung", fullLabel: "Cấu hình chung hệ thống", icon: <GlobalOutlined />, color: '#1890ff' },
  { value: 1, label: "AI", fullLabel: "Trí tuệ nhân tạo (AI/Gemini)", icon: <RobotOutlined />, color: '#722ed1' },
  { value: 2, label: "Thông báo", fullLabel: "Mẫu thông báo (Notification)", icon: <NotificationOutlined />, color: '#faad14' },
  { value: 3, label: "Blog", fullLabel: "Bài viết và Blog", icon: <ReadOutlined />, color: '#52c41a' },
  { value: 4, label: "Game", fullLabel: "Game và Hệ thống XP", icon: <TrophyOutlined />, color: '#eb2f96' },
  { value: 5, label: "Bảo mật", fullLabel: "Bảo mật và Xác thực", icon: <LockOutlined />, color: '#f5222d' },
  { value: 6, label: "Đề thi", fullLabel: "Đề thi và Thi thử", icon: <FileSearchOutlined />, color: '#2f54eb' },
  { value: 7, label: "Từ vựng", fullLabel: "Từ vựng", icon: <BookOutlined />, color: '#13c2c2' },
  { value: 8, label: "Lộ trình", fullLabel: "Lộ trình học tập", icon: <LineChartOutlined />, color: '#fa8c16' },
  { value: 9, label: "Thanh toán", fullLabel: "Thanh toán và Gói cước", icon: <CreditCardOutlined />, color: '#52c41a' },
  { value: 10, label: "Nội bộ", fullLabel: "Nội bộ hệ thống", icon: <SettingOutlined />, color: '#8c8c8c' },
  { value: 11, label: "Giao diện", fullLabel: "Giao diện người dùng", icon: <LayoutOutlined />, color: '#1890ff' },
  { value: 12, label: "Email", fullLabel: "Dịch vụ Email", icon: <MailOutlined />, color: '#fa541c' },
  { value: 13, label: "Giọng đọc", fullLabel: "Giọng đọc và Phát âm", icon: <AudioOutlined />, color: '#722ed1' },
  { value: 14, label: "AI Prompt", fullLabel: "Prompt cho AI", icon: <ThunderboltOutlined />, color: '#faad14' }
];
