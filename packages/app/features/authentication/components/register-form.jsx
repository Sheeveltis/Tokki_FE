import React, { useState, useMemo } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native'

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
import { useRouter } from 'solito/navigation'
import { TextInput } from '../../../../components/textInput'
import { TextInput as RNTextInput } from 'react-native'
import { DatePicker } from '../../../../components/datePicker'
import { Button } from '../../../../components/button'
import { register, sendEmailVerificationOtp, verifyEmailOtp } from '../api'
import { showApiNotification } from '../utils/notification'
import { HelperAdmin } from '../../../../components/HelperAdmin'
import LogoImage from '../../../../assets/logo-text.png'
import HomeIcon from '../../../../assets/icon/icon-mainflow/home.svg'
import { InputOTP } from './input-otp'
import { 
  scaleWidth, 
  scaleHeight, 
  scaleFont, 
  scaleSize, 
  percentWidth,
  getScreenDimensions 
} from '../utils/responsive'

// Tạo styles responsive - chỉ áp dụng trên mobile
const createResponsiveStyles = () => {
  const { width, height } = getScreenDimensions()
  const isMobile = Platform.OS !== 'web'
  
  // Base values (cho iPhone X - 375x812)
  const baseValues = {
    paddingHorizontal: 32,
    paddingVertical: 32,
    topOffset: 24,
    sideOffset: 24,
    logoWidth: 160,
    logoHeight: 48,
    iconSize: 20,
    titleFont: 32,
    subtitleFont: 14, // Sửa từ 18 thành 14 để giống login-form
    backTextFont: 14,
    formGap: 12,
    headerGap: 16,
    buttonPaddingH: 12,
    buttonPaddingV: 8,
    verifyButtonHeight: 36,
    verifyButtonPaddingH: 12,
    verifyTextFont: 12,
    errorFont: 13,
    loginTextFont: 14,
    emailInputPaddingRight: 110,
  }
  
  // Scale values cho mobile, giữ nguyên cho web
  const scaled = isMobile ? {
    paddingHorizontal: scaleWidth(baseValues.paddingHorizontal),
    paddingVertical: scaleHeight(baseValues.paddingVertical),
    topOffset: scaleHeight(baseValues.topOffset),
    sideOffset: scaleWidth(baseValues.sideOffset),
    logoWidth: scaleWidth(baseValues.logoWidth),
    logoHeight: scaleHeight(baseValues.logoHeight),
    iconSize: scaleSize(baseValues.iconSize),
    titleFont: scaleFont(baseValues.titleFont),
    subtitleFont: scaleFont(baseValues.subtitleFont),
    backTextFont: scaleFont(baseValues.backTextFont),
    formGap: scaleHeight(baseValues.formGap),
    headerGap: scaleHeight(baseValues.headerGap),
    buttonPaddingH: scaleWidth(baseValues.buttonPaddingH),
    buttonPaddingV: scaleHeight(baseValues.buttonPaddingV),
    verifyButtonHeight: scaleHeight(baseValues.verifyButtonHeight),
    verifyButtonPaddingH: scaleWidth(baseValues.verifyButtonPaddingH),
    verifyTextFont: scaleFont(baseValues.verifyTextFont),
    errorFont: scaleFont(baseValues.errorFont),
    loginTextFont: scaleFont(baseValues.loginTextFont),
    emailInputPaddingRight: scaleWidth(baseValues.emailInputPaddingRight),
  } : baseValues
  
  return StyleSheet.create({
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
      top: isMobile ? scaled.topOffset : 24,
      right: isMobile ? scaled.sideOffset : 24,
      zIndex: 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: isMobile ? scaleWidth(8) : 8,
    },
    backHome: {
      position: 'absolute',
      top: isMobile ? scaled.topOffset : 24,
      left: isMobile ? scaled.sideOffset : 24,
      zIndex: 15,
      flexDirection: 'row',
      alignItems: 'center',
      gap: isMobile ? scaleWidth(8) : 8,
      paddingHorizontal: isMobile ? scaled.buttonPaddingH : 12,
      paddingVertical: isMobile ? scaled.buttonPaddingV : 8,
      borderRadius: 999,
      backgroundColor: 'rgba(0,0,0,0.05)',
    },
    backIcon: {
      width: scaled.iconSize,
      height: scaled.iconSize,
      resizeMode: 'contain',
    },
    backText: {
      fontSize: scaled.backTextFont,
      fontWeight: '600',
      color: '#111',
      fontFamily: 'Epilogue, sans-serif',
    },
    logoImage: {
      width: isMobile ? scaled.logoWidth : 160,
      height: isMobile ? scaled.logoHeight : 48,
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
      fontSize: 32, // Dùng giá trị cố định giống login-form, không scale
      fontWeight: '700',
      fontFamily: 'Lexend, sans-serif',
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 14, // Dùng giá trị cố định giống login-form, không scale
      color: '#555',
      fontFamily: 'Epilogue, sans-serif',
      textAlign: 'center',
    },
    formBlock: {
      gap: 12, // Dùng giá trị cố định giống login-form
    },
    emailField: {
      position: 'relative',
      width: '100%', // Đảm bảo emailField có cùng width như các field khác
    },
    emailInputWithButton: {
      paddingRight: scaled.emailInputPaddingRight,
    },
    verifyEmailButton: {
      position: 'absolute',
      right: 0, // Sát gốc phải
      top: '50%', // Đặt ở giữa input field
      transform: [{ translateY: -scaled.verifyButtonHeight / 2 }],
      paddingHorizontal: scaled.verifyButtonPaddingH,
      height: scaled.verifyButtonHeight,
      justifyContent: 'center',
      borderRadius: 0, // Bỏ border radius để sát góc
      borderWidth: 1,
      borderColor: '#D4060A',
      backgroundColor: '#FFF',
      zIndex: 10,
    },
    verifyEmailButtonSuccess: {
      borderColor: '#2E7D32',
      backgroundColor: 'rgba(46,125,50,0.08)',
    },
    verifyEmailButtonDisabled: {
      opacity: 0.6,
    },
    verifyEmailText: {
      fontSize: scaled.verifyTextFont,
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
      fontSize: 13, // Dùng giá trị cố định giống login-form
      fontFamily: 'Epilogue, sans-serif',
    },
    submitBtn: {
      marginTop: 8, // Dùng giá trị cố định giống login-form
      width: Platform.OS === 'web' ? '40%' : '50%', // Giống login-form: web 40%, mobile 50%
      alignSelf: 'center',
    },
    loginRow: {
      marginTop: 16, // Dùng giá trị cố định giống login-form
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    loginText: {
      fontSize: 14, // Dùng giá trị cố định, không scale
      color: '#333',
      fontFamily: 'Epilogue, sans-serif',
    },
    loginHighlight: {
      fontSize: 14, // Dùng giá trị cố định, không scale
      fontWeight: '700',
      color: '#D4060A',
      fontFamily: 'Epilogue, sans-serif',
    },
    // Native-specific styles: Logo ở giữa, title phía dưới
    nativeHeaderContainer: {
      width: '100%',
      alignItems: 'center',
      marginBottom: 24, // Dùng giá trị cố định giống login-form
    },
    nativeLogoContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16, // Dùng giá trị cố định giống login-form
    },
    nativeLogoImage: {
      width: 160,
      height: 48,
      resizeMode: 'contain',
    },
    nativeHeaderBlock: {
      alignItems: 'center',
      gap: 16, // Dùng giá trị cố định giống login-form
    },
    nativeTitle: {
      fontSize: 32, // Dùng giá trị cố định giống login-form
      fontWeight: '700',
      fontFamily: 'Lexend, sans-serif',
      textAlign: 'center',
    },
    nativeSubtitle: {
      fontSize: 14, // Dùng giá trị cố định giống login-form
      color: '#555',
      fontFamily: 'Epilogue, sans-serif',
      textAlign: 'center',
    },
  })
}

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
  const insets = useSafeAreaInsets() // Lấy safe area insets để tránh navigation bar
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
  
  // Tính toán responsive styles dựa trên kích thước màn hình hiện tại
  const styles = useMemo(() => createResponsiveStyles(), [])
  
  // Style động cho container với padding bottom từ safe area
  const containerStyle = useMemo(() => {
    // Tính padding bottom dựa trên safe area, tối thiểu 16px trên mobile
    const minPaddingBottom = Platform.OS !== 'web' ? scaleHeight(16) : 0
    const paddingBottom = Math.max(insets.bottom, minPaddingBottom)
    
    return [
      styles.container,
      { paddingBottom }
    ]
  }, [styles.container, insets.bottom])

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
        // Chỉ hiển thị Alert trên mobile, web dùng HelperAdmin
        if (Platform.OS !== 'web') {
          showApiNotification({
            ...resp,
            message: resp.message || 'Đã gửi OTP tới email.',
          })
        }
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
        // Chỉ hiển thị Alert trên mobile, web dùng HelperAdmin
        if (Platform.OS !== 'web') {
          showApiNotification(resp)
        }
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
      // Chỉ hiển thị Alert trên mobile, web dùng HelperAdmin
      if (Platform.OS !== 'web') {
        showApiNotification(resp)
      }
    } else if (resp) {
      setIsEmailVerified(false)
      setApiResponse(null)
      setNotifyResponse(resp)
      const msg =
        resp.message ||
        (resp.errors && resp.errors[0]?.description) ||
        'Xác thực OTP thất bại.'
      setError(msg)
      // Chỉ hiển thị Alert trên mobile, web dùng HelperAdmin
      if (Platform.OS !== 'web') {
        showApiNotification(resp)
      }
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
        // Chỉ hiển thị Alert trên mobile, web dùng HelperAdmin
        if (Platform.OS !== 'web') {
          showApiNotification(response)
        }
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
      // Chỉ hiển thị Alert trên mobile, web dùng HelperAdmin
      if (Platform.OS !== 'web') {
        showApiNotification(errorResponse)
      }
      setError(errorResponse.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={containerStyle}>
      {/* Ẩn button Trang chủ trên native */}
      {Platform.OS === 'web' && (
      <TouchableOpacity
        style={styles.backHome}
        onPress={() => router.push('/homepage')}
        activeOpacity={0.8}
      >
        {homeIconSource ? <Image source={homeIconSource} style={styles.backIcon} /> : null}
        <Text style={styles.backText}>Trang chủ</Text>
      </TouchableOpacity>
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
          <Text style={styles.title}>Đăng ký</Text>
          <Text style={styles.subtitle}>
            Hãy nhập thông tin để đăng ký tài khoản của riêng bạn
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
            <Text style={styles.nativeTitle}>Đăng ký</Text>
            <Text style={styles.nativeSubtitle}>
              Hãy nhập thông tin để đăng ký tài khoản của riêng bạn
            </Text>
          </View>
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.formBlock}>
          <TextInput
            label="Họ và tên"
            placeholder="Nhập họ và tên"
            value={fullName}
            onChangeText={setFullName}
          />

          {/* Email + nút xác thực nằm trong ô nhập */}
          <View style={styles.emailField}>
            <View style={{ width: '100%' }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '500',
                  marginBottom: 8,
                  color: '#333',
                  fontFamily: 'Epilogue, sans-serif',
                }}
              >
                Email
              </Text>
              <View style={{ position: 'relative' }}>
                <RNTextInput
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
                  style={[
                    {
                      backgroundColor: '#F3F3F3',
                      borderRadius: 0,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      fontSize: 16,
                      fontFamily: 'Epilogue, sans-serif',
                      color: '#333',
                      minHeight: 48,
                      textAlignVertical: 'center',
                    },
                    styles.emailInputWithButton,
                  ]}
                  placeholderTextColor="#999"
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
            </View>
          </View>

          <TextInput
            label="Số điện thoại"
            placeholder="Nhập số điện thoại"
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



