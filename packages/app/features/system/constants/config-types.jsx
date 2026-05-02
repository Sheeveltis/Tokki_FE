import React from 'react'
import { 
  GlobalOutlined, 
  RobotOutlined, 
  NotificationOutlined, 
  ReadOutlined, 
  TrophyOutlined, 
  LockOutlined, 
  FileSearchOutlined, 
  CreditCardOutlined
} from '@ant-design/icons'

export const SYSTEM_CONFIG_TYPES = [
  { value: 0, label: "Chung", fullLabel: "Hệ thống & Giao diện (Chung, UI, Nội bộ)", icon: <GlobalOutlined />, color: '#1890ff' },
  { value: 1, label: "AI", fullLabel: "Trí tuệ nhân tạo (AI & Prompts)", icon: <RobotOutlined />, color: '#722ed1' },
  { value: 2, label: "Liên lạc", fullLabel: "Thông báo & Liên lạc (Push, Email, Chat)", icon: <NotificationOutlined />, color: '#faad14' },
  { value: 3, label: "Học tập", fullLabel: "Nội dung học tập (Vocabulary, Roadmap, Blog, Audio)", icon: <ReadOutlined />, color: '#52c41a' },
  { value: 4, label: "Game", fullLabel: "Game & XP (Gamification)", icon: <TrophyOutlined />, color: '#eb2f96' },
  { value: 5, label: "Bảo mật", fullLabel: "Bảo mật & Xác thực", icon: <LockOutlined />, color: '#f5222d' },
  { value: 6, label: "Đánh giá", fullLabel: "Đề thi & Đánh giá (Assessment)", icon: <FileSearchOutlined />, color: '#2f54eb' },
  { value: 7, label: "Thanh toán", fullLabel: "Thanh toán & Gói cước (Billing/VIP)", icon: <CreditCardOutlined />, color: '#13c2c2' }
];
