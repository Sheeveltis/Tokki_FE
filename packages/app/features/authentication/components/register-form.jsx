import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'
import { useRouter } from 'solito/navigation'
import { TextInput } from '../../../../components/textInput'
import { DatePicker } from '../../../../components/datePicker'
import { Button } from '../../../../components/button'
import { register, sendEmailVerificationOtp, verifyEmailOtp } from '../api'
import { showApiNotification } from '../helpers/notification'
import { HelperAdmin } from '../../../../components/HelperAdmin'
import LogoImage from '../../../../assets/logo-text.png'
import HomeIcon from '../../../../assets/icon/icon-mainflow/home.svg'
import { InputOTP } from '../forgot-password/components/input-OTP'

/**
 * RegisterPanel: cột bên phải cho màn Đăng ký
 *
 * Tự xử lý logic đăng ký (fake) và trạng thái loading/error.
 *
 * @param {{
 *   onPressLogin?: () => void
 * }} props
 */
export function RegisterPanel({ onPressLogin }) {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [apiResponse, setApiResponse] = useState(null)
  const [notifyResponse, setNotifyResponse] = useState(null)
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const [otpSending, setOtpSending] = useState(false)

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
  const homeIconSource = normalizeImageSource(HomeIcon)

  const handleOpenOtpModal = async () => {
    if (otpSending) return
    // Kiểm tra email trước khi cho nhập OTP
    if (!email || !email.trim()) {
      const msg = 'Vui lòng nhập email trước khi xác thực.'
      setError(msg)
      setNotifyResponse({
        isSuccess: false,
        message: msg,
        statusCode: 400,
      })
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      const msg = 'Email không hợp lệ.'
      setError(msg)
      setNotifyResponse({
        isSuccess: false,
        message: msg,
        statusCode: 400,
      })
      return
    }

    // Reset trạng thái xác thực mỗi khi thay đổi email
    setIsEmailVerified(false)

    try {
      setOtpSending(true)
      // Gửi OTP xác thực email
      const resp = await sendEmailVerificationOtp(email.trim())

      if (resp?.isSuccess) {
        // Thông báo thành công và mở modal nhập OTP
        setApiResponse(resp)
        setNotifyResponse(null)
        showApiNotification({
          ...resp,
          message: resp.message || 'Đã gửi OTP tới email.',
        })
        setShowOtpModal(true)
      } else {
        // Lưu để HelperAdmin hiển thị lỗi
        setNotifyResponse(resp)
        setApiResponse(null)
        const msg =
          (resp && resp.message) ||
          (resp && resp.errors && resp.errors[0]?.description) ||
          'Gửi OTP thất bại.'
        setError(msg)
        showApiNotification(resp)
      }
    } finally {
      setOtpSending(false)
    }
  }

  const handleOtpSuccess = (resp) => {
    if (resp && resp.isSuccess) {
      setIsEmailVerified(true)
      setError(null)
      setNotifyResponse(null)
      setApiResponse(resp)
      showApiNotification(resp)
    } else if (resp) {
      setIsEmailVerified(false)
      setApiResponse(null)
      setNotifyResponse(resp)
      const msg =
        resp.message ||
        (resp.errors && resp.errors[0]?.description) ||
        'Xác thực OTP thất bại.'
      setError(msg)
      showApiNotification(resp)
    }
  }

  const handleSubmit = async () => {
    if (loading) return

    // Validation đơn giản trên FE
    if (!fullName || !email || !phoneNumber || !password || !confirmPassword || !dateOfBirth) {
      const msg = 'Vui lòng nhập đầy đủ thông tin.'
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
    if (password !== confirmPassword) {
      const msg = 'Mật khẩu xác nhận không khớp.'
      setError(msg)
      setNotifyResponse({
        isSuccess: false,
        message: msg,
        statusCode: 400,
      })
      return
    }

    try {
      setLoading(true)
      setError(null)
      setApiResponse(null)
      setNotifyResponse(null)
      
      // Bắt buộc người dùng xác thực email trước khi đăng ký
      if (!isEmailVerified) {
        const msg = 'Vui lòng xác thực email bằng OTP trước khi đăng ký.'
        setError(msg)
        setNotifyResponse({
          isSuccess: false,
          message: msg,
          statusCode: 400,
        })
        setLoading(false)
        return
      }
      
      // Gọi API register
      const response = await register({
        email,
        phoneNumber,
        password,
        fullName,
        dateOfBirth,
      })
      
      // Lưu response để hiển thị HelperAdmin
      setApiResponse(response)
      
      // Xử lý khi đăng ký thành công
      if (response.isSuccess && response.data) {
        const userId = response.data
        
        console.log('Đăng ký thành công:', {
          userId,
        })
        
        // Chuyển trang đến homepage sau khi hiển thị thông báo
        setTimeout(() => {
          router.push('/homepage')
        }, 500) // Delay nhỏ để user thấy thông báo
      } else {
        // Hiển thị lỗi trong form nếu cần
        if (response.errors && response.errors.length > 0) {
          setError(response.errors[0].description || response.message)
        } else {
          setError(response.message || 'Đăng ký thất bại, vui lòng thử lại.')
        }
        // Vẫn hiển thị thông báo lỗi bằng React Native Alert
        showApiNotification(response)
      }
    } catch (err) {
      console.error('Register error:', err)
      // Xử lý lỗi không mong đợi
      const fallbackMsg = 'Lỗi hệ thống. Vui lòng thử lại sau.'
      const errMsg = (typeof err?.message === 'string' && err.message) || ''
      const lowerMsg = errMsg.toLowerCase()
      const isConnRefused = lowerMsg.includes('err_connection_refused')
      const isNetworkError = lowerMsg.includes('network error')
      const finalMsg = isConnRefused || isNetworkError ? fallbackMsg : errMsg || fallbackMsg
      const errorResponse = {
        isSuccess: false,
        data: null,
        errors: [
          {
            code: 'Error.Unknown',
            description: finalMsg,
          },
        ],
        message: finalMsg,
        statusCode: 500,
      }
      setApiResponse(errorResponse)
      setNotifyResponse(errorResponse)
      showApiNotification(errorResponse)
      setError(errorResponse.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backHome}
        onPress={() => router.push('/homepage')}
        activeOpacity={0.8}
      >
        {homeIconSource ? <Image source={homeIconSource} style={styles.backIcon} /> : null}
        <Text style={styles.backText}>Trang chủ</Text>
      </TouchableOpacity>
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
          <Text style={styles.title}>Đăng ký</Text>
          <Text style={styles.subtitle}>
            Hãy nhập thông tin để đăng ký tài khoản của riêng bạn
          </Text>
        </View>

        <View style={styles.formBlock}>
          <TextInput
            label="Họ và tên"
            placeholder="Nhập họ và tên"
            value={fullName}
            onChangeText={setFullName}
          />

          {/* Email + nút xác thực nằm trong ô nhập */}
          <View style={styles.emailField}>
            <TextInput
              label="Email"
              placeholder="Ví dụ: an@example.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text)
                // Khi người dùng đổi email thì coi như chưa xác thực
                if (isEmailVerified) {
                  setIsEmailVerified(false)
                }
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              inputStyle={styles.emailInputWithButton}
            />
            <TouchableOpacity
              style={[
                styles.verifyEmailButton,
                isEmailVerified && styles.verifyEmailButtonSuccess,
                otpSending && styles.verifyEmailButtonDisabled,
              ]}
              onPress={handleOpenOtpModal}
              activeOpacity={0.8}
              disabled={otpSending}
            >
              <Text
                style={[
                  styles.verifyEmailText,
                  isEmailVerified && styles.verifyEmailTextSuccess,
                  otpSending && styles.verifyEmailTextDisabled,
                ]}
              >
                {otpSending
                  ? 'ĐANG GỬI...'
                  : isEmailVerified
                    ? 'ĐÃ XÁC THỰC'
                    : 'XÁC THỰC'}
              </Text>
            </TouchableOpacity>
          </View>

          <TextInput
            label="Số điện thoại"
            placeholder="Ví dụ: 0585204417"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />
          <TextInput
            label="Mật khẩu"
            placeholder="Nhập mật khẩu"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TextInput
            label="Xác nhận mật khẩu"
            placeholder="Nhập lại mật khẩu"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
          <DatePicker
            label="Ngày sinh"
            placeholder="Chọn ngày sinh"
            value={dateOfBirth}
            onChange={setDateOfBirth}
          />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Button
          title={loading ? 'Đang đăng ký...' : 'Đăng ký'}
          onPress={handleSubmit}
          disabled={loading}
          color="darkGreen"
          disabledColor="#88A455"
          style={styles.submitBtn}
        />

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Đã có tài khoản? </Text>
          <TouchableOpacity onPress={onPressLogin}>
            <Text style={styles.loginHighlight}>ĐĂNG NHẬP NGAY</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal nhập OTP để xác thực email */}
      <InputOTP
        visible={showOtpModal}
        email={email}
        onClose={() => setShowOtpModal(false)}
        onSuccess={handleOtpSuccess}
        verifyFn={verifyEmailOtp}
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
  backIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  backText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
    fontFamily: 'Epilogue, sans-serif',
  },
  logoImage: {
    width: 160,
    height: 48, // chiều cao nhỏ để cùng hàng với nút
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
    color: '#555',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
  },
  formBlock: {
    gap: 12,
  },
  emailField: {
    position: 'relative',
  },
  emailInputWithButton: {
    paddingRight: 110, // chừa chỗ cho nút xác thực
  },
  verifyEmailButton: {
    position: 'absolute',
    right: 12,
    top: '65%',
    transform: [{ translateY: -18 }], // canh giữa theo chiều dọc
    paddingHorizontal: 12,
    height: 36,
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D4060A',
    backgroundColor: '#FFF',
  },
  verifyEmailButtonSuccess: {
    borderColor: '#2E7D32',
    backgroundColor: 'rgba(46,125,50,0.08)',
  },
  verifyEmailButtonDisabled: {
    opacity: 0.6,
  },
  verifyEmailText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D4060A',
    fontFamily: 'Epilogue, sans-serif',
  },
  verifyEmailTextSuccess: {
    color: '#2E7D32',
  },
  verifyEmailTextDisabled: {
    color: '#888',
  },
  errorText: {
    color: '#E53935',
    fontSize: 13,
    fontFamily: 'Epilogue, sans-serif',
  },
  submitBtn: {
    marginTop: 8,
    width: '40%',
    alignSelf: 'center',
  },
  loginRow: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 18,
    color: '#333',
    fontFamily: 'Epilogue, sans-serif',
  },
  loginHighlight: {
    fontSize: 18,
    fontWeight: '700',
    color: '#D4060A',
    fontFamily: 'Epilogue, sans-serif',
  },
})


