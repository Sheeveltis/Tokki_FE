import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'
import { useRouter } from 'solito/navigation'
import { TextInput } from '../../../../components/textInput'
import { Button } from '../../../../components/button'
import { login } from '../api'
import { setAuthToken } from '../../../provider/api/client'
import { showApiNotification } from '../helpers/notification'
import { encryptToken, decryptToken } from '../helpers/token-encryption'
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
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [apiResponse, setApiResponse] = useState(null)
  const [notifyResponse, setNotifyResponse] = useState(null)
  const [forgotEmail, setForgotEmail] = useState('')
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [showOtpModal, setShowOtpModal] = useState(false)

  // fuwy thêm token để check login (đã mã hóa)
  const setToken = (token) => {
    if (typeof window === 'undefined') return
    if (token) {
      // Mã hóa token trước khi lưu vào localStorage
      const encryptedToken = encryptToken(token)
      window.localStorage.setItem('token', encryptedToken)
    } else {
      window.localStorage.removeItem('token')
    }
    // thông báo cho navbar/khác biết token đổi
    window.dispatchEvent(new Event('token-changed'))
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
        setAuthToken(token)
        // Lưu token vào localStorage để navbar nhận biết đã đăng nhập
        setToken(token)
        // TODO: Lưu thông tin user vào context / storage nếu cần
        console.log('Đăng nhập thành công:', {
          token,
          fullName,
          role,
          avatarUrl,
        })

        // Chuyển trang đến homepage sau khi hiển thị thông báo
        setTimeout(() => {
          router.push('/homepage')
        }, 500) // Delay nhỏ để user thấy thông báo
      } else {
        // Clear token nếu thất bại
        setToken(null)

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

  return (
    <View style={styles.container}>
      <NavigationPill style={styles.backHome} label="Trang chủ" to="/homepage" />
      {/* HelperAdmin để hiển thị thông báo từ API (chỉ hiển thị khi thành công) */}
      {notifyResponse && (
        <HelperAdmin response={notifyResponse} type="error" hideStatusCode hideErrorCode />
      )}
      {apiResponse && apiResponse.isSuccess && (
        <HelperAdmin response={apiResponse} type="success" hideStatusCode hideErrorCode />
      )}
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
