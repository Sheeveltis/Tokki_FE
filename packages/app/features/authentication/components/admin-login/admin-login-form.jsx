'use client'

import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native'
import { useRouter } from 'solito/navigation'
import { TextInput } from '../../../../../components/textInput'
import { Button } from '../../../../../components/button'
import { login } from '../../api'
import { setAuthToken, clearAuthToken } from '../../../../provider/api/client'
import { HelperAdmin } from '../../../../../components/HelperAdmin'
import LogoImage from '../../../../../assets/logo-text.png'

/**
 * AdminLoginForm: Form đăng nhập riêng cho Admin, Staff, và Moderator
 */
export function AdminLoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [apiResponse, setApiResponse] = useState(null)
  const [notifyResponse, setNotifyResponse] = useState(null)

  // Chuẩn hoá source để hỗ trợ cả import module (Next/webpack) lẫn require/uri
  const normalizeImageSource = (src) => {
    if (!src) return null
    if (typeof src === 'number' || typeof src === 'string') return src
    if (src.uri) return src
    if (src.src) return { uri: src.src }
    if (src.default) return src.default
    return src
  }

  const logoSource = normalizeImageSource(LogoImage)

  // Danh sách role được phép truy cập admin panel
  const allowedRoles = ['Admin', 'Staff', 'Moderator']

  const handleSubmit = async () => {
    if (loading) return

    // Validate basic input
    if (!email && !password) {
      const msg = 'Vui lòng nhập email và mật khẩu.'
      setError(msg)
      setNotifyResponse({
        isSuccess: false,
        message: msg,
        statusCode: 400,
      })
      return
    }
    if (email && !password) {
      const msg = 'Vui lòng nhập mật khẩu.'
      setError(msg)
      setNotifyResponse({
        isSuccess: false,
        message: msg,
        statusCode: 400,
      })
      return
    }
    if (!email && password) {
      const msg = 'Vui lòng nhập email.'
      setError(msg)
      setNotifyResponse({
        isSuccess: false,
        message: msg,
        statusCode: 400,
      })
      return
    }

    setLoading(true)
    setError(null)
    setApiResponse(null)
    setNotifyResponse(null)

    try {
      // Gọi API login
      const response = await login({ email, password })

      // Lưu response để hiển thị HelperAdmin
      setApiResponse(response)

      // Xử lý khi đăng nhập thành công
      if (response.isSuccess && response.data) {
        const { token, role } = response.data

        console.log('Login response:', { role, allowedRoles, isAllowed: allowedRoles.includes(role) })

        // Kiểm tra role có được phép truy cập admin panel không
        if (!allowedRoles.includes(role)) {
          await clearAuthToken()
          const msg = 'Bạn không có quyền truy cập trang quản trị. Chỉ Admin, Staff và Moderator mới được phép.'
          setError(msg)
          setNotifyResponse({
            isSuccess: false,
            message: msg,
            statusCode: 403,
          })
          setLoading(false)
          return
        }

        // Lưu token để dùng cho các request authorize
        await setAuthToken(token)

        console.log('Đăng nhập thành công:', {
          email,
          role,
        })

        // Đợi một chút để đảm bảo token đã được lưu vào storage
        await new Promise((resolve) => setTimeout(resolve, 100))

        // Chuyển đến dashboard tương ứng với role
        // Admin -> /admin, Staff -> /staff, Moderator -> /moderator
        let redirectPath = '/admin?tab=users-all' // Default
        if (role === 'Staff') {
          redirectPath = '/staff?tab=users'
        } else if (role === 'Moderator') {
          redirectPath = '/moderator?tab=approve-blog'
        } else if (role === 'Admin') {
          redirectPath = '/admin?tab=users-all'
        }

        // Dùng window.location.href để đảm bảo redirect hoạt động và reload page
        if (typeof window !== 'undefined') {
          window.location.href = redirectPath
        } else {
          router.push(redirectPath)
        }
      } else {
        // Clear token nếu thất bại
        await clearAuthToken()

        // Lưu response cho HelperAdmin và dòng lỗi dưới form
        setNotifyResponse(response)

        // Lấy message lỗi ưu tiên theo backend trả về
        const msg =
          (response && response.message) ||
          (response && response.errors && response.errors[0]?.description) ||
          'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.'

        setError(msg)
      }
    } catch (err) {
      // Xử lý lỗi network hoặc lỗi không mong đợi
      await clearAuthToken()
      const msg = err?.message || 'Đã xảy ra lỗi. Vui lòng thử lại sau.'
      setError(msg)
      setNotifyResponse({
        isSuccess: false,
        message: msg,
        statusCode: 500,
      })
    } finally {
      // Đảm bảo luôn tắt trạng thái loading
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      {/* HelperAdmin để hiển thị thông báo từ API (chỉ trên web) */}
      {Platform.OS === 'web' && notifyResponse && (
        <HelperAdmin response={notifyResponse} type="error" hideStatusCode hideErrorCode />
      )}
      {Platform.OS === 'web' && apiResponse && apiResponse.isSuccess && (
        <HelperAdmin response={apiResponse} type="success" hideStatusCode hideErrorCode />
      )}



      <View style={styles.content}>
        <View style={styles.headerBlock}>
          <Text style={styles.title}>Đăng nhập nội bộ</Text>
          <Text style={styles.subtitle}>
            Dành cho Admin, Staff và Moderator
          </Text>
        </View>

        <View style={styles.formBlock}>
          <TextInput
            label="Email"
            placeholder="Ví dụ: admin@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            label="Mật khẩu"
            placeholder="Nhập mật khẩu"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Button
          title={loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          onPress={handleSubmit}
          disabled={loading}
          color="darkGreen"
          disabledColor="#88A455"
          style={styles.submitBtn}
        />

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Bạn là người dùng thường? </Text>
          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text style={styles.footerLink}>Đăng nhập tại đây</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 32,
    backgroundColor: '#A9A9A9',
    minHeight: '100vh',
  },
  logoContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  logoImage: {
    width: 200,
    height: 60,
    resizeMode: 'contain',
  },
  content: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#fff',
    padding: 32,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerBlock: {
    gap: 16,
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    fontFamily: 'Lexend, sans-serif',
    textAlign: 'center',
    color: '#111',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
  },
  formBlock: {
    gap: 16,
    marginBottom: 16,
  },
  errorText: {
    color: '#E53935',
    fontSize: 13,
    fontFamily: 'Epilogue, sans-serif',
    marginBottom: 8,
  },
  submitBtn: {
    marginTop: 8,
    width: '100%',
  },
  footerRow: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D4060A',
    fontFamily: 'Epilogue, sans-serif',
    textDecorationLine: 'underline',
  },
})

export default AdminLoginForm

