'use client'

import React, { useEffect, useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { useRouter } from 'solito/navigation'
import { Spin } from 'antd'
import { AdminLoginForm } from '../components/admin-login-form'
import { getAuthToken, getCurrentUserRole } from '../../../provider/api/client'

/**
 * AdminLoginScreen: Wrapper để kiểm tra authentication và role
 * Nếu đã đăng nhập và có role phù hợp -> redirect đến admin panel
 * Nếu chưa đăng nhập hoặc không có quyền -> hiển thị login form
 */
export function AdminLoginScreen() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [showLogin, setShowLogin] = useState(false)

  // Danh sách role được phép truy cập admin panel
  const allowedRoles = ['Admin', 'Staff', 'Moderator']

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = getAuthToken()
        
        if (!token) {
          // Chưa đăng nhập -> hiển thị login form
          setShowLogin(true)
          setChecking(false)
          return
        }

        // Kiểm tra role
        const role = getCurrentUserRole()
        
        if (!role || !allowedRoles.includes(role)) {
          // Không có quyền -> hiển thị login form
          setShowLogin(true)
          setChecking(false)
          return
        }

        // Đã đăng nhập và có quyền -> redirect đến dashboard tương ứng với role
        let redirectPath = '/admin?tab=users-all' // Default
        if (role === 'Staff') {
          redirectPath = '/staff?tab=users'
        } else if (role === 'Moderator') {
          redirectPath = '/moderator?tab=approve-blog'
        } else if (role === 'Admin') {
          redirectPath = '/admin?tab=users-all'
        }
        router.push(redirectPath)
      } catch (error) {
        console.error('Error checking auth:', error)
        // Nếu có lỗi, hiển thị login form
        setShowLogin(true)
        setChecking(false)
      }
    }

    checkAuth()
  }, [router])

  if (checking) {
    return (
      <View style={styles.loadingContainer}>
        <Spin size="large" />
      </View>
    )
  }

  if (showLogin) {
    return <AdminLoginForm />
  }

  return null
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    minHeight: '100vh',
  },
})

export default AdminLoginScreen
