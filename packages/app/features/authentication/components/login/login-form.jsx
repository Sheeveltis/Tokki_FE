import React, { useState, useMemo } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native'
import { useRouter } from 'solito/navigation'
// Import CheckOutlined conditionally for web
let CheckOutlined = null
if (Platform.OS === 'web') {
  try {
    const iconModule = require('@ant-design/icons')
    CheckOutlined = iconModule.CheckOutlined
  } catch (e) {
    // console.warn('Ant Design icons not available')
  }
}
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
import { TextInput } from '../../../../../components/textInput'
import { Button } from '../../../../../components/button'
import { loginUser, loginWithGoogle, checkDailyTitles, addXP } from '../../api'
import { setAuthToken, clearAuthToken, setCurrentUserAvatar } from '../../../../provider/api/client'
import { heartbeatService } from '../shared/heartbeat-service'
import { showApiNotification } from '../../utils/notification'
import { encryptToken, decryptToken } from '../../../../helpers/token-encryption'
import { setStorageItem, getStorageItem, removeStorageItem, dispatchStorageEvent } from '../../../../helpers/storage'
import { HelperAdmin } from '../../../../../components/HelperAdmin'
import LogoImage from '../../../../../assets/logo-text.png'
import { NavigationPill } from '../../../../../components/navigation-pill'
import { InputEmail } from '../shared/input-email'
import { InputOTP } from '../shared/input-otp'
// Import helper function - Metro/Webpack sẽ tự động resolve đúng file (.web.js cho web, .js cho native)
import { getGoogleClientId } from './get-google-client-id'

/**
 * LoginPanel: toàn bộ cột bên phải của màn đăng nhập (tiêu đề + form + ghi chú)
 *
 * @param {{
 *   onPressSignUp?: () => void
 *   onPressGoogle?: () => void
 *   navigation?: any - Navigation object từ React Navigation (cho native)
 * }} props
 */
export function LoginPanel({ onPressSignUp, onPressGoogle, navigation: navigationProp }) {
  const router = useRouter()
  // Sử dụng navigation prop nếu có, nếu không thì thử dùng useNavigation hook
  const navigationHook = useNavigation ? useNavigation() : null
  const navigation = navigationProp || navigationHook
  const insets = useSafeAreaInsets() // Lấy safe area insets để tránh navigation bar
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [apiResponse, setApiResponse] = useState(null)
  const [notifyResponse, setNotifyResponse] = useState(null)
  const [forgotEmail, setForgotEmail] = useState('')
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

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
    // Load remembered credentials
    const loadRememberedCredentials = async () => {
      try {
        const savedEmail = await getStorageItem('rememberedEmail')
        const savedPassword = await getStorageItem('rememberedPassword')

        if (savedEmail) {
          setEmail(savedEmail)
          setRememberMe(true)
        }
        if (savedPassword) {
          // Giải mã mật khẩu nếu có
          const decryptedPassword = decryptToken(savedPassword)
          setPassword(decryptedPassword)
        }
      } catch (error) {
        console.error('Error loading remembered credentials:', error)
      }
    }

    loadRememberedCredentials()

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
      const response = await loginUser({ email, password, rememberMe })
    

      // Lưu response để hiển thị HelperAdmin
      setApiResponse(response)

      // Xử lý khi đăng nhập thành công
      if (response.isSuccess && response.data) {
        const { token, fullName, role, avatarUrl } = response.data

        // Danh sách role không được phép đăng nhập qua form user
        const adminRoles = ['Admin', 'Staff', 'Moderator']

        // Kiểm tra nếu là admin/staff/moderator thì không cho đăng nhập
        if (adminRoles.includes(role)) {
          await clearAuthToken()
          const msg = 'Tài khoản Admin, Staff và Moderator không thể đăng nhập tại đây. Vui lòng sử dụng trang đăng nhập nội bộ.'
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
        // setAuthToken đã tự động mã hóa và lưu vào storage, không cần gọi setToken nữa
        await setAuthToken(token)

        // Lưu hoặc xóa thông tin ghi nhớ đăng nhập
        if (rememberMe) {
          await setStorageItem('rememberedEmail', email)
          const encryptedPassword = encryptToken(password)
          await setStorageItem('rememberedPassword', encryptedPassword)
        } else {
          await removeStorageItem('rememberedEmail')
          await removeStorageItem('rememberedPassword')
        }

        // Luôn cập nhật avatar (hoặc xóa avatar cũ nếu avatarUrl null)
        await setCurrentUserAvatar(avatarUrl)

        // console.log('Đăng nhập thành công:', {
        //   token,
        //   fullName,
        //   role,
        //   avatarUrl,
        // })

        // Bắt đầu heartbeat service sau khi login thành công
        // Service sẽ tự động gửi heartbeat mỗi 300 giây
        // Backend sẽ tự động cập nhật TotalXP và Streak sau khi nhận đủ số lần heartbeat
        heartbeatService.start()

        // Chuyển trang ngay sau khi đăng nhập thành công
        setTimeout(() => {
          if (Platform.OS === 'web') {
            // Kiểm tra redirect query param
            const searchParams = new URLSearchParams(window.location.search);
            const redirectPath = searchParams.get('redirect');
            if (redirectPath) {
              router.push(redirectPath);
            } else {
              router.push('/study');
            }
          } else {
            // Trên native, dùng React Navigation
            if (navigation) {
              navigation.navigate('flashcard-list')
            } else {
              // Fallback nếu navigation không có
              router.push('/study')
            }
          }
        }, 500) // Delay nhỏ để user thấy thông báo
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

        // Chỉ hiển thị Alert trên mobile, web dùng HelperAdmin
        if (Platform.OS !== 'web') {
          showApiNotification(response)
        }
      }
    } finally {
      // Đảm bảo luôn tắt trạng thái loading kể cả khi login ném lỗi ngoài ý muốn
      setLoading(false)
    }
  }

  // ===== GOOGLE LOGIN (web only) =====
  // Lấy Google Client ID từ env vars (hỗ trợ cả Vite và Next.js)
  const GOOGLE_CLIENT_ID = getGoogleClientId()

  const loadGoogleScript = () =>
    new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('Google login chỉ hỗ trợ trên web.'))
        return
      }
      if (window.google?.accounts?.id) {
        resolve(window.google.accounts.id)
        return
      }
      const existing = document.getElementById('google-identity-script')
      if (existing) {
        existing.onload = () => resolve(window.google.accounts.id)
        existing.onerror = reject
        return
      }
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.id = 'google-identity-script'
      script.onload = () => resolve(window.google.accounts.id)
      script.onerror = reject
      document.body.appendChild(script)
    })

  const handleGoogleLogin = async () => {
    if (Platform.OS !== 'web') {
      setError('Đăng nhập Google chỉ hỗ trợ trên web.')
      return
    }
    if (!GOOGLE_CLIENT_ID) {
      setError('Thiếu GOOGLE_CLIENT_ID. Vui lòng cấu hình VITE_GOOGLE_CLIENT_ID (hoặc NEXT_PUBLIC_GOOGLE_CLIENT_ID).')
      return
    }
    if (googleLoading) return

    setGoogleLoading(true)
    setError(null)
    setApiResponse(null)
    setNotifyResponse(null)

    try {
      const accountsId = await loadGoogleScript()

      // Debug: xác nhận origin & client_id thực tế đang được dùng
      try {
        console.info('[GoogleLogin] origin:', window.location.origin)
        console.info('[GoogleLogin] client_id:', GOOGLE_CLIENT_ID)
      } catch (e) {
        // ignore
      }

      await accountsId.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response) => {
          const idToken = response?.credential
          if (!idToken) {
            setError('Không lấy được idToken từ Google.')
            setGoogleLoading(false)
            return
          }
          try {
            const resp = await loginWithGoogle({ idToken, isComfirmToMergeAcc: false })
            setApiResponse(resp)

            if (resp.isSuccess && resp.data) {
              const { token, fullName, role, avatarUrl } = resp.data

              const adminRoles = ['Admin', 'Staff', 'Moderator']
              if (adminRoles.includes(role)) {
                await clearAuthToken()
                const msg = 'Tài khoản Admin, Staff và Moderator không thể đăng nhập tại đây.'
                setError(msg)
                setNotifyResponse({
                  isSuccess: false,
                  message: msg,
                  statusCode: 403,
                })
                setGoogleLoading(false)
                return
              }

              await setAuthToken(token)

              // Luôn cập nhật avatar
              await setCurrentUserAvatar(avatarUrl)
              
              heartbeatService.start()

              setTimeout(() => {
                const searchParams = new URLSearchParams(window.location.search);
                const redirectPath = searchParams.get('redirect');
                if (redirectPath) {
                  router.push(redirectPath);
                } else {
                  router.push('/study');
                }
              }, 500)
            } else {
              await clearAuthToken()
              setNotifyResponse(resp)
              const msg =
                resp?.message ||
                resp?.errors?.[0]?.description ||
                'Đăng nhập Google thất bại. Vui lòng thử lại.'
              setError(msg)
              if (Platform.OS !== 'web') {
                showApiNotification(resp)
              }
            }
          } catch (err) {
            const msg = err?.message || 'Đăng nhập Google thất bại.'
            setError(msg)
          } finally {
            setGoogleLoading(false)
          }
        },
      })

      // Hiển thị popup chọn tài khoản Google
      accountsId.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          setGoogleLoading(false)
        }
      })
    } catch (err) {
      const msg = err?.message || 'Không thể khởi tạo Google login.'
      setError(msg)
      setGoogleLoading(false)
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

        <View style={styles.rememberForgotRow}>
          <TouchableOpacity
            style={styles.rememberRow}
            onPress={() => setRememberMe(!rememberMe)}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
              {rememberMe && (
                Platform.OS === 'web' && CheckOutlined ? (
                  <CheckOutlined style={styles.checkIcon} />
                ) : (
                  <View style={styles.nativeCheckmark} />
                )
              )}
            </View>
            <Text style={styles.rememberText}>Ghi nhớ đăng nhập</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleForgotPassword} activeOpacity={0.8}>
            <Text style={styles.forgotText}>Quên mật khẩu?</Text>
          </TouchableOpacity>
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

        <View style={styles.separatorRow}>
          <View style={styles.separatorLine} />
          <Text style={styles.separatorText}>Hoặc đăng nhập bằng</Text>
          <View style={styles.separatorLine} />
        </View>

        <Button
          title={googleLoading ? 'Đang đăng nhập Google...' : 'Đăng nhập bằng Google'}
          onPress={() => {
            if (onPressGoogle) {
              onPressGoogle()
              return
            }
            handleGoogleLogin()
          }}
          disabled={googleLoading}
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
        email={forgotEmail}
        visible={showOtpModal}
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
    justifyContent: Platform.OS === 'web' ? 'center' : 'flex-start',
    paddingHorizontal: 32,
    paddingVertical: 32,
    position: 'relative',
    minHeight: Platform.OS !== 'web' ? '100%' : 'auto',
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
    fontSize: 14,
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
    fontSize: 14,
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
    fontSize: 13,
    color: '#8B4513',
    fontWeight: '600',
    fontFamily: 'Epilogue, sans-serif',
  },
  rememberForgotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: -4,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    borderColor: '#CCC',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  checkboxChecked: {
    backgroundColor: '#4C662B',
    borderColor: '#4C662B',
  },
  checkIcon: {
    fontSize: 12,
    color: '#FFF',
  },
  nativeCheckmark: {
    width: 8,
    height: 8,
    borderRadius: 2,
    backgroundColor: '#FFF',
  },
  rememberText: {
    fontSize: 13,
    color: '#555',
    fontFamily: 'Epilogue, sans-serif',
  },
  submitBtn: {
    marginTop: 8,
    width: Platform.OS === 'web' ? '30%' : '50%',
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
    width: Platform.OS === 'web' ? '60%' : '100%',
    alignSelf: 'center',
  },
  signupRow: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Epilogue, sans-serif',
  },
  signupHighlight: {
    fontSize: 16,
    fontWeight: '700',
    color: '#D4060A',
    fontFamily: 'Epilogue, sans-serif',
  },
})
