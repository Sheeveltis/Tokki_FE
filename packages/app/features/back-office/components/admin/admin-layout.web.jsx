'use client'

import React, { createContext, useContext, useMemo, useState, useEffect, useTransition } from 'react'
import { Layout, Menu, ConfigProvider, Badge, Popover, List, Modal, theme as antdTheme } from 'antd'
import { BellOutlined, MenuFoldOutlined, MenuUnfoldOutlined, PoweroffOutlined } from '@ant-design/icons'
import { adminMenuItems } from './menu-items.jsx'

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
  const [themeMode] = useState('light')
  const [, startTransition] = useTransition()

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

  const menuItems = useMemo(
    () => adminMenuItems.filter((item) => item.key !== 'logout' && item.type !== 'divider'),
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
      Modal.confirm({
        title: 'Xác nhận đăng xuất',
        content: 'Bạn có chắc chắn muốn đăng xuất không?',
        okText: 'Đăng xuất',
        cancelText: 'Hủy',
        okButtonProps: { danger: true },
        onOk: onLogout,
      })
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

  const notifications = useMemo(
    () => [
      { title: '3 yêu cầu phê duyệt user mới', time: '5 phút trước' },
      { title: '2 feedback chưa xử lý', time: '30 phút trước' },
      { title: 'Báo cáo hệ thống sẵn sàng', time: 'Hôm nay' },
    ],
    [],
  )

  const scrollHideStyles = `
    .sider-scroll-hidden::-webkit-scrollbar {
      display: none;
    }
  `

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
            trigger={null}
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
                justifyContent: 'space-between',
                color: '#fff',
                fontWeight: 700,
                fontFamily: 'Epilogue, sans-serif',
                letterSpacing: 0.5,
              }}
            >
              <span>{collapsed ? '' : 'Admin'}</span>
              <button
                type="button"
                onClick={() => setCollapsed((prev) => !prev)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              </button>
            </div>
            <Menu
              theme="dark"
              mode="inline"
              selectedKeys={[selectedKey]}
              defaultOpenKeys={[]}
              onClick={handleMenuClick}
              items={menuItems}
            />
            <div
              style={{
                padding: collapsed ? '12px' : '16px',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                background: '#001529',
                position: 'sticky',
                bottom: 0,
              }}
            >
              <button
                type="button"
                onClick={() =>
                  Modal.confirm({
                    title: 'Xác nhận đăng xuất',
                    content: 'Bạn có chắc chắn muốn đăng xuất không?',
                    okText: 'Đăng xuất',
                    cancelText: 'Hủy',
                    okButtonProps: { danger: true },
                    onOk: onLogout,
                  })
                }
                style={{
                  width: '100%',
                  border: '1px solid rgba(255,255,255,0.35)',
                  background: 'transparent',
                  color: '#ff7875',
                  fontWeight: 600,
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  gap: collapsed ? 0 : 10,
                  padding: collapsed ? '10px 0' : '10px 12px',
                  cursor: 'pointer',
                }}
              >
                <PoweroffOutlined />
                {!collapsed && <span>Đăng xuất</span>}
              </button>
            </div>
          </Layout.Sider>
          <Layout>
            <Layout.Header
              style={{
                background: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingInline: 24,
                fontFamily: 'Epilogue, sans-serif',
              }}
            >
              <div style={{ fontSize: 21, fontWeight: 700 }}>
                {adminMenuItems
                  .flatMap((item) => [item, ...(item.children || [])])
                  .find((item) => item.key === selectedKey)?.label || 'Dashboard'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <Popover
                  placement="bottomRight"
                  trigger="click"
                  content={
                    <List
                      size="small"
                      dataSource={notifications}
                      renderItem={(item) => (
                        <List.Item style={{ padding: '6px 0' }}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 600 }}>{item.title}</span>
                            <span style={{ fontSize: 12, color: '#888' }}>{item.time}</span>
                          </div>
                        </List.Item>
                      )}
                    />
                  }
                >
                  <Badge dot>
                    <BellOutlined style={{ fontSize: 20, cursor: 'pointer' }} />
                  </Badge>
                </Popover>
              </div>
            </Layout.Header>
            <Layout.Content style={{ margin: 16, height: 'calc(100vh - 96px)', overflow: 'auto' }}>
              <div
                style={{
                  background: '#fff',
                  padding: 16,
                  minHeight: '100%',
                  overflow: 'visible',
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

