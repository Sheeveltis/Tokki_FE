import React, { useState, useMemo } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native'
import { useRouter } from 'solito/navigation'
// Import useNavigation cho native
let useNavigation = null
if (Platform.OS !== 'web') {
  try {
    const navigationModule = require('@react-navigation/native')
    useNavigation = navigationModule.useNavigation
  } catch (e) {
    // @react-navigation/native không có sẵn trên web
  }
}

// Import useSafeAreaInsets chỉ trên native
let useSafeAreaInsets = () => ({ bottom: 0, top: 0, left: 0, right: 0 })
if (Platform.OS !== 'web') {
  try {
    const safeAreaModule = require('react-native-safe-area-context')
    useSafeAreaInsets = safeAreaModule.useSafeAreaInsets || (() => ({ bottom: 0, top: 0, left: 0, right: 0 }))
  } catch (e) {
    // react-native-safe-area-context không có sẵn trên web, sử dụng fallback
  }
}
import { TextInput } from '../../../../components/textInput'
import { Button } from '../../../../components/button'
import { login } from '../api'
import { setAuthToken } from '../../../provider/api/client'
import { heartbeatService } from './heartbeat-service'
import { showApiNotification } from '../helpers/notification'
import { encryptToken } from '../../../helpers/token-encryption'
import { setStorageItem, removeStorageItem, dispatchStorageEvent } from '../../../helpers/storage'
import { HelperAdmin } from '../../../../components/HelperAdmin'
import LogoImage from '../../../../assets/logo-text.png'
import { NavigationPill } from '../../../../components/navigation-pill'
import { InputEmail } from '../forgot-password/components/input-Email'
import { InputOTP } from '../forgot-password/components/input-OTP'

/**
 * LoginPanel: toàn bộ cột bên phải của màn đăng nhập (tiêu đề + form + ghi chú)
 *
 * @param {{
 *   onPressSignUp?: () => void
 *   onPressGoogle?: () => void
 * }} props
 */
export function LoginPanel({ onPressSignUp, onPressGoogle }) {
  const router = useRouter()
  // Sử dụng navigation cho native, router cho web
  const navigation = useNavigation ? useNavigation() : null
  const insets = useSafeAreaInsets() // Lấy safe area insets để tránh navigation bar
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [apiResponse, setApiResponse] = useState(null)
  const [notifyResponse, setNotifyResponse] = useState(null)
  const [forgotEmail, setForgotEmail] = useState('')
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [showOtpModal, setShowOtpModal] = useState(false)

  // Lưu token vào storage (hỗ trợ cả web và mobile)
  const setToken = async (token) => {
    if (token) {
      // Mã hóa token trước khi lưu vào storage
      const encryptedToken = encryptToken(token)
      await setStorageItem('token', encryptedToken)
    } else {
      await removeStorageItem('token')
    }
    // Thông báo cho navbar/khác biết token đổi (chỉ trên web)
    dispatchStorageEvent('token-changed')
  }

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

  // Không cần các hàm heartbeat nữa vì đã chuyển sang service

  // Cleanup khi component unmount
  // Cleanup heartbeat service khi component unmount
  React.useEffect(() => {
    return () => {
      heartbeatService.stop()
    }
  }, [])

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
      // Gọi API login (toàn bộ xử lý lỗi network / format response nằm trong tầng API)
      const response = await login({ email, password })

      // Lưu response để hiển thị HelperAdmin
      setApiResponse(response)

      // Xử lý khi đăng nhập thành công
      if (response.isSuccess && response.data) {
        const { token, fullName, role, avatarUrl } = response.data

        // Lưu token để dùng cho các request authorize
        await setAuthToken(token)
        // Lưu token vào storage để navbar nhận biết đã đăng nhập
        await setToken(token)
        // TODO: Lưu thông tin user vào context / storage nếu cần
        console.log('Đăng nhập thành công:', {
          token,
          fullName,
          role,
          avatarUrl,
        })

        // Bắt đầu heartbeat service sau khi login thành công
        // Service sẽ tự động gửi heartbeat mỗi 300 giây
        // Backend sẽ tự động cập nhật TotalXP và Streak sau khi nhận đủ số lần heartbeat
        heartbeatService.start()

        // Chuyển trang sau khi hiển thị thông báo
        // Native: chuyển đến payment-package để test giao diện (dùng React Navigation)
        // Web: chuyển đến homepage (dùng solito router)
        setTimeout(() => {
          if (Platform.OS === 'web') {
            router.push('/homepage')
          } else {
            // Trên native, dùng React Navigation
            if (navigation) {
              navigation.navigate('payment-package')
            } else {
              // Fallback nếu navigation không có
              router.push('/payment-package')
            }
          }
        }, 500) // Delay nhỏ để user thấy thông báo
      } else {
        // Clear token nếu thất bại
        await setToken(null)

        // Lưu response cho HelperAdmin và dòng lỗi dưới form
        setNotifyResponse(response)

        // Lấy message lỗi ưu tiên theo backend trả về
        const msg =
          (response && response.message) ||
          (response && response.errors && response.errors[0]?.description) ||
          'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.'

        setError(msg)

        // Vẫn hiển thị notification (Alert / toast) nếu hàm đã được dùng ở nơi khác
        showApiNotification(response)
      }
    } finally {
      // Đảm bảo luôn tắt trạng thái loading kể cả khi login ném lỗi ngoài ý muốn
      setLoading(false)
    }
  }

  const handleForgotPassword = () => {
    setShowEmailModal(true)
  }

  const handleEmailSuccess = (_resp, enteredEmail) => {
    setForgotEmail(enteredEmail)
    setShowEmailModal(false)
    setShowOtpModal(true)
  }

  const handleOtpSuccess = () => {
    setShowOtpModal(false)
    // chuyển sang trang tạo mật khẩu mới, kèm email
    if (forgotEmail) {
      router.push(`/authentication/forgot-password?email=${encodeURIComponent(forgotEmail)}`)
    } else {
      router.push('/authentication/forgot-password')
    }
  }

  // Style động cho container với padding bottom từ safe area
  const containerStyle = useMemo(() => {
    // Tính padding bottom dựa trên safe area, tối thiểu 16px trên mobile
    const minPaddingBottom = Platform.OS !== 'web' ? 16 : 0
    const paddingBottom = Math.max(insets.bottom, minPaddingBottom)
    
    return [
      styles.container,
      { paddingBottom }
    ]
  }, [insets.bottom, styles.container])

  return (
    <View style={containerStyle}>
      {/* Ẩn button Trang chủ trên native */}
      {Platform.OS === 'web' && (
      <NavigationPill style={styles.backHome} label="Trang chủ" to="/homepage" />
      )}
      {/* HelperAdmin để hiển thị thông báo từ API (chỉ hiển thị khi thành công) - Chỉ trên web */}
      {Platform.OS === 'web' && notifyResponse && (
        <HelperAdmin response={notifyResponse} type="error" hideStatusCode hideErrorCode />
      )}
      {Platform.OS === 'web' && apiResponse && apiResponse.isSuccess && (
        <HelperAdmin response={apiResponse} type="success" hideStatusCode hideErrorCode />
      )}
      {/* Logo và title - layout khác nhau cho web và native */}
      {Platform.OS === 'web' ? (
        <>
      <View style={styles.logoContainer}>
        {logoSource && <Image source={logoSource} style={styles.logoImage} />}
      </View>
      <View style={styles.content}>
        <View style={styles.headerBlock}>
          <Text style={styles.title}>Đăng nhập</Text>
          <Text style={styles.subtitle}>
          Hãy nhập thông tin để đăng nhập vào tài khoản của bạn
          </Text>
        </View>
          </View>
        </>
      ) : (
        // Native: Logo ở giữa, title phía dưới
        <View style={styles.nativeHeaderContainer}>
          <View style={styles.nativeLogoContainer}>
            {logoSource && <Image source={logoSource} style={styles.nativeLogoImage} />}
          </View>
          <View style={styles.nativeHeaderBlock}>
            <Text style={styles.nativeTitle}>Đăng nhập</Text>
            <Text style={styles.nativeSubtitle}>
              Hãy nhập thông tin để đăng nhập vào tài khoản của bạn
            </Text>
          </View>
        </View>
      )}
      
      <View style={styles.content}>

        <View style={styles.formBlock}>
          <TextInput
            label="Email"
            placeholder="Ví dụ: an@example.com"
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

        <TouchableOpacity onPress={handleForgotPassword} activeOpacity={0.8}>
          <Text style={styles.forgotText}>Quên mật khẩu?</Text>
        </TouchableOpacity>

        <Button
          title={loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          onPress={handleSubmit}
          disabled={loading}
          color="darkGreen"
          disabledColor="#88A455"
          style={styles.submitBtn}
        />

        <View style={styles.separatorRow}>
          <View style={styles.separatorLine} />
          <Text style={styles.separatorText}>Hoặc đăng nhập bằng</Text>
          <View style={styles.separatorLine} />
        </View>

        <Button
          title="Đăng nhập bằng Google"
          onPress={onPressGoogle}
          disabled={false}
          color="#DB4437"
          style={styles.googleBtn}
        />

        <View style={styles.signupRow}>
          <Text style={styles.signupText}>Chưa có tài khoản? </Text>
          <TouchableOpacity onPress={onPressSignUp}>
            <Text style={styles.signupHighlight}>ĐĂNG KÝ NGAY</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal nhập Email */}
      <InputEmail
        visible={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onSuccess={handleEmailSuccess}
      />

      {/* Modal nhập OTP */}
      <InputOTP
        visible={showOtpModal}
        email={forgotEmail}
        onClose={() => setShowOtpModal(false)}
        onSuccess={handleOtpSuccess}
      />
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
    position: 'relative',
  },
  logoContainer: {
    position: 'absolute',
    top: 24, // căn cùng hàng với nút Trang chủ
    right: 24, // logo nằm sát phải
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backHome: {
    position: 'absolute',
    top: 24,
    left: 24, // nút Trang chủ sát cạnh trái
    zIndex: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  logoImage: {
    width: 160,
    height: 48, // chiều cao nhỏ để nằm cùng hàng với nút
    resizeMode: 'contain',
  },
  content: {
    width: '100%',
    maxWidth: 620,
    gap: 16,
  },
  headerBlock: {
    gap: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    fontFamily: 'Lexend, sans-serif',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    maxHeight: 50,
    color: '#555',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
  },
  // Native-specific styles: Logo ở giữa, title phía dưới
  nativeHeaderContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24, // Khoảng cách giống register
  },
  nativeLogoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16, // Khoảng cách giữa logo và title
  },
  nativeLogoImage: {
    width: 160,
    height: 48,
    resizeMode: 'contain',
  },
  nativeHeaderBlock: {
    alignItems: 'center',
    gap: 16,
  },
  nativeTitle: {
    fontSize: 32, // Cùng font size như title hiện tại
    fontWeight: '700',
    fontFamily: 'Lexend, sans-serif',
    textAlign: 'center',
  },
  nativeSubtitle: {
    fontSize: 18,
    color: '#555',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
  },
  formBlock: {
    gap: 12,
  },
  errorText: {
    color: '#E53935',
    fontSize: 13,
    fontFamily: 'Epilogue, sans-serif',
  },
  forgotText: {
    marginTop: 4,
    fontSize: 13,
    color: '#111',
    fontFamily: 'Epilogue, sans-serif',
  },
  submitBtn: {
    marginTop: 8,
    width: '30%',
    alignSelf: 'center',
  },
  separatorRow: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#D0D0D0',
    borderRadius: 999,
  },
  separatorText: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
    letterSpacing: 0.5,
  },
  googleBtn: {
    marginTop: 12,
    width: '80%',
    alignSelf: 'center',
  },
  signupRow: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: 20,
    color: '#333',
    fontFamily: 'Epilogue, sans-serif',
  },
  signupHighlight: {
    fontSize: 20,
    fontWeight: '700',
    color: '#D4060A',
    fontFamily: 'Epilogue, sans-serif',
  },
})
