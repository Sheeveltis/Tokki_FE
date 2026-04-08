'use client'

import React, { createContext, useContext, useMemo, useState, useEffect, useTransition } from 'react'
import { useLocation } from 'react-router-dom'
import { useRouter } from 'solito/navigation'
import { Layout, Menu, ConfigProvider, Badge, Popover, List, Modal, theme as antdTheme, Button, Avatar, App } from 'antd'
import { BellOutlined, MenuFoldOutlined, MenuUnfoldOutlined, PoweroffOutlined, UserOutlined } from '@ant-design/icons'
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
  const location = useLocation()
  const router = useRouter()
  const [selectedKey, setSelectedKey] = useState(defaultKey)
  const [openKeys, setOpenKeys] = useState([])
  const [collapsed, setCollapsed] = useState(false)
  const [themeMode] = useState('light')
  const [, startTransition] = useTransition()

  // Helper: Tìm key và parents dựa trên search params hoặc path
  const getActiveKeys = () => {
    const searchParams = new URLSearchParams(location.search)
    const tab = searchParams.get('tab')
    const pathname = location.pathname
    
    let key = tab || defaultKey
    
    // Nếu pathname là detail (VD: /admin/users/123), ánh xạ về tab tương ứng
    if (pathname.includes('/admin/users/')) key = 'users-all'
    if (pathname.includes('/admin/question-type/')) key = 'question-bank'
    if (pathname.includes('/admin/vocab/')) key = 'vocabulary-words'
    if (pathname.includes('/admin/exam-templates/')) key = 'exam-template'
    if (pathname.includes('/admin/exams/')) key = 'exam-management'
    if (pathname.includes('/admin/passage')) key = 'passage-management'
    if (pathname.includes('/admin/blog/category')) key = 'blog-category'
    else if (pathname.includes('/admin/blog/')) key = 'blog'
    if (pathname.includes('/admin/lessons/')) key = 'lessons'
    if (pathname.includes('/admin/vocab-topic/')) key = 'vocabulary-topics'
    if (pathname.includes('/admin/system-config/')) key = 'system-config'
    if (pathname.includes('/admin/pronunciation/')) key = 'pronunciation-management'

    // Tìm parent
    for (const item of adminMenuItems) {
       if (item.children && item.children.some(child => child.key === key)) {
         return { key, parents: [item.key] }
       }
    }
    return { key, parents: [] }
  }

  // Sync state với URL khi location thay đổi
  useEffect(() => {
    const { key, parents } = getActiveKeys()
    setSelectedKey(key)
    if (!collapsed && parents.length > 0) {
      setOpenKeys(prev => [...new Set([...prev, ...parents])])
    }
  }, [location, defaultKey, collapsed])

  const algorithm = useMemo(
    () => [antdTheme.defaultAlgorithm],
    [],
  )

  const menuItems = useMemo(
    () => adminMenuItems.filter((item) => item.key !== 'logout' && item.type !== 'divider'),
    [],
  )

  // Token theme cho premium look
  const themeTokens = useMemo(
    () => ({
      colorPrimary: '#1677ff',
      borderRadius: 12,
      fontSize: 15,
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      colorBgContainer: '#ffffff',
      colorBgLayout: '#f7f9fc',
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
        okButtonProps: { danger: true, shape: 'round' },
        cancelButtonProps: { shape: 'round' },
        onOk: onLogout,
      })
      return
    }
    startTransition(() => {
      setSelectedKey(key)
      if (onNavigate) {
        onNavigate(key)
      } else {
        // Mặc định navigate về /admin?tab=key dùng router để tránh load lại trang
        router.push(`/admin?tab=${key}`)
      }
    })
  }

  const handleOpenChange = (keys) => {
    setOpenKeys(keys)
  }

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

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        toggleTheme: () => {},
      }}
    >
      <ConfigProvider 
        theme={{ 
          algorithm, 
          token: themeTokens,
          components: {
            Layout: {
              siderBg: '#ffffff',
              headerBg: '#ffffff',
              headerPadding: '0 24px',
            },
            Menu: {
              itemBorderRadius: 8,
              itemMarginInline: 8,
              itemSelectedBg: '#e6f4ff',
              itemSelectedColor: '#1677ff',
            }
          }
        }}
      >
        <App>
          <Layout style={{ height: '100vh', overflow: 'hidden' }}>
            <Layout.Sider
              collapsible
              collapsed={collapsed}
              trigger={null}
              onCollapse={(val) => setCollapsed(val)}
              width={260}
              theme="light"
              style={{
                borderRight: '1px solid #f0f0f0',
                zIndex: 10,
                height: '100vh'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div
                  style={{
                    height: 64,
                    padding: '0 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: collapsed ? 'center' : 'space-between',
                    borderBottom: '1px solid #f0f0f0',
                    transition: 'all 0.2s'
                  }}
                >
                  {!collapsed && (
                    <span style={{ 
                      fontSize: 20, 
                      fontWeight: 800, 
                      color: '#1677ff',
                      letterSpacing: '-0.5px'
                    }}>
                      TOKKI <span style={{ color: '#52c41a' }}>ADMIN</span>
                    </span>
                  )}
                  <Button
                    type="text"
                    icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                    onClick={() => setCollapsed(!collapsed)}
                    style={{ fontSize: '16px', width: 40, height: 40 }}
                  />
                </div>
                
                <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
                  <Menu
                    mode="inline"
                    selectedKeys={[selectedKey]}
                    openKeys={openKeys}
                    onOpenChange={handleOpenChange}
                    onClick={handleMenuClick}
                    items={menuItems}
                    style={{ borderRight: 'none' }}
                  />
                </div>

                <div
                  style={{
                    padding: '16px',
                    borderTop: '1px solid #f0f0f0',
                    background: '#ffffff',
                  }}
                >
                  <Button
                    danger
                    type="ghost"
                    icon={<PoweroffOutlined />}
                    onClick={() => handleMenuClick({ key: 'logout' })}
                    style={{
                      width: '100%',
                      borderRadius: 10,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      fontWeight: 600,
                      height: 44
                    }}
                  >
                    {!collapsed && <span>Đăng xuất</span>}
                  </Button>
                </div>
              </div>
            </Layout.Sider>
            
            <Layout style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <Layout.Header
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 1px 4px rgba(0,21,41,0.08)',
                  zIndex: 9,
                  height: 64
                }}
              >
                <div style={{ fontSize: 18, fontWeight: 700, color: '#262626' }}>
                  {adminMenuItems
                    .flatMap((item) => [item, ...(item.children || [])])
                    .find((item) => item.key === selectedKey)?.label || 'Dashboard'}
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <Popover
                    placement="bottomRight"
                    title="Thông báo"
                    trigger="click"
                    content={
                      <List
                        size="small"
                        dataSource={notifications}
                        style={{ width: 300 }}
                        renderItem={(item) => (
                          <List.Item style={{ cursor: 'pointer' }}>
                            <List.Item.Meta
                              title={<span style={{ fontWeight: 600 }}>{item.title}</span>}
                              description={<span style={{ fontSize: 12 }}>{item.time}</span>}
                            />
                          </List.Item>
                        )}
                      />
                    }
                  >
                    <Badge count={3} size="small" offset={[-2, 2]}>
                      <Button type="text" shape="circle" icon={<BellOutlined style={{ fontSize: 18 }} />} />
                    </Badge>
                  </Popover>

                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 12, 
                    padding: '4px 8px', 
                    borderRadius: 32,
                    cursor: 'pointer',
                    border: '1px solid #f0f0f0'
                  }}>
                    <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: '#1677ff' }} />
                    <span style={{ fontWeight: 600, fontSize: 13 }}>Admin</span>
                  </div>
                </div>
              </Layout.Header>
              
              <Layout.Content 
                style={{ 
                  padding: '24px', 
                  height: 'calc(100vh - 64px)', 
                  backgroundColor: '#f7f9fc',
                  overflow: 'hidden' // Vô hiệu hóa scroll tổng của trang
                }}
              >
                <div
                  style={{
                    background: '#ffffff',
                    padding: '24px',
                    borderRadius: 16,
                    height: '100%', // Chiếm hết chiều cao Content
                    boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                    border: '1px solid #f0f0f0',
                    display: 'flex',
                    flexDirection: 'column',
                    overflowY: 'auto' // Cho phép scroll riêng phần content này
                  }}
                >
                  {currentScreen}
                </div>
              </Layout.Content>
            </Layout>
          </Layout>
        </App>
      </ConfigProvider>
    </ThemeContext.Provider>
  )
}

export default AdminLayout

