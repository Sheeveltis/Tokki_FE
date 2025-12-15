'use client'

import React, { createContext, useContext, useMemo, useState, useEffect, useTransition } from 'react'
import { Layout, Menu, ConfigProvider, theme as antdTheme } from 'antd'
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
} from '@ant-design/icons'

const ThemeContext = createContext({
  themeMode: 'light',
  toggleTheme: () => {},
})

export const useTheme = () => useContext(ThemeContext)

/**
 * AdminLayout (web): wrapper cho Sider + Content, quản lý menu và theme.
 * @param {{
 *  screens: Record<string, React.ReactNode>;
 *  defaultKey?: string;
 *  onLogout?: () => void;
 * }} props
 */
export function AdminLayout({
  screens = {},
  defaultKey = 'users-all',
  onLogout = () => {},
  onNavigate,
  children,
}) {
  const [selectedKey, setSelectedKey] = useState(defaultKey)
  const [collapsed, setCollapsed] = useState(false)
  const [themeMode, setThemeMode] = useState('light')
  const [isPending, startTransition] = useTransition()

  // Sync selectedKey với defaultKey khi defaultKey thay đổi
  useEffect(() => {
    if (defaultKey && defaultKey !== selectedKey) {
      setSelectedKey(defaultKey)
    }
  }, [defaultKey])

  const algorithm = useMemo(
    () => [antdTheme.defaultAlgorithm, antdTheme.compactAlgorithm],
    [],
  )

  // Size chữ toàn admin mặc định
  const themeTokens = useMemo(
    () => ({
      fontSize: 18,
      fontSizeSM: 16,
      fontSizeLG: 18,
      fontFamily: 'Epilogue, sans-serif',
    }),
    [],
  )

  const handleMenuClick = ({ key }) => {
    if (key === 'logout') {
      onLogout()
      return
    }
    // Sử dụng startTransition để ưu tiên UI update, navigation không block
    startTransition(() => {
      setSelectedKey(key)
      if (onNavigate) {
        onNavigate(key)
      }
    })
  }

  // Memoize currentScreen để tránh re-render không cần thiết
  const currentScreen = useMemo(() => {
    return children || screens[selectedKey] || screens[defaultKey] || null
  }, [children, screens, selectedKey, defaultKey])

  const scrollHideStyles = `
    .sider-scroll-hidden::-webkit-scrollbar {
      display: none;
    }
  `

  const menuItems = [
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
      key: 'customer-service',
      icon: <CustomerServiceOutlined />,
      label: 'Chăm sóc khách hàng',
      children: [
        { key: 'chat-support', icon: <MessageOutlined />, label: 'Khung chat' },
        { key: 'auto-email', icon: <MailOutlined />, label: 'Gửi mail tự động' },
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

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        toggleTheme: () => {},
      }}
    >
      <style>{scrollHideStyles}</style>
      <ConfigProvider theme={{ algorithm, token: themeTokens }}>
        <Layout style={{ minHeight: '100vh' }}>
          <Layout.Sider
            className="sider-scroll-hidden"
            collapsible
            collapsed={collapsed}
            onCollapse={(val) => setCollapsed(val)}
            width={240}
            style={{
              overflow: 'auto',
              height: '100vh',
              position: 'sticky',
              top: 0,
            }}
          >
            <div
              style={{
                height: 64,
                margin: 16,
                display: 'flex',
                alignItems: 'center',
                color: '#fff',
                fontWeight: 700,
                fontFamily: 'Epilogue, sans-serif',
                letterSpacing: 0.5,
              }}
            >
              {collapsed ? 'ADM' : 'Admin Panel'}
            </div>
            <Menu
              theme="dark"
              mode="inline"
              selectedKeys={[selectedKey]}
              defaultOpenKeys={['users', 'content', 'vocabulary', 'customer-service', 'revenue']}
              onClick={handleMenuClick}
              items={menuItems}
            />
          </Layout.Sider>
          <Layout>
            <Layout.Header
              style={{
                background: 'transparent',
                display: 'flex',
                alignItems: 'center',
                paddingInline: 24,
                fontFamily: 'Epilogue, sans-serif',
              }}
            >
              <div style={{ fontSize: 21, fontWeight: 700 }}>
                {menuItems
                  .flatMap((item) => [item, ...(item.children || [])])
                  .find((item) => item.key === selectedKey)?.label || 'Dashboard'}
              </div>
            </Layout.Header>
            <Layout.Content style={{ margin: 16 }}>
              <div
                style={{
                  background: '#fff',
                  padding: 16,
                  minHeight: 'calc(100vh - 120px)',
                  borderRadius: 8,
                }}
              >
                {currentScreen}
              </div>
            </Layout.Content>
          </Layout>
        </Layout>
      </ConfigProvider>
    </ThemeContext.Provider>
  )
}

export default AdminLayout

