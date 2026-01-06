'use client'

import React, { createContext, useContext, useMemo, useState, useEffect, useTransition } from 'react'
import { Layout, Menu, ConfigProvider, Badge, Popover, List, theme as antdTheme } from 'antd'
import { BellOutlined } from '@ant-design/icons'
import { moderatorMenuItems } from './moderator-menu-items.jsx'

const ThemeContext = createContext({
  themeMode: 'light',
  toggleTheme: () => {},
})

export const useTheme = () => useContext(ThemeContext)

/**
 * ModeratorLayout (web): wrapper cho Sider + Content, quản lý menu và theme cho moderator.
 * @param {{
 *  screens: Record<string, React.ReactNode>;
 *  defaultKey?: string;
 *  onLogout?: () => void;
 *  onNavigate?: (key: string) => void;
 * }} props
 */
export function ModeratorLayout({ screens = {}, defaultKey = 'approve-blog', onLogout = () => {}, onNavigate, children }) {
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

  // Size chữ toàn moderator mặc định
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

  const notifications = useMemo(
    () => [
      { title: '1 bài blog chờ duyệt', time: '15 phút trước' },
      { title: 'Có báo cáo nội dung vi phạm', time: 'Hôm nay' },
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
              {collapsed ? 'MOD' : 'Moderator Panel'}
            </div>
            <Menu
              theme="dark"
              mode="inline"
              selectedKeys={[selectedKey]}
              onClick={handleMenuClick}
              items={moderatorMenuItems}
            />
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
                {moderatorMenuItems.find((item) => item.key === selectedKey)?.label || 'Moderator Dashboard'}
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

export default ModeratorLayout



