import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'
import { useRouter } from 'solito/navigation'
import { TextInput } from '../../../../components/textInput'
import { Button } from '../../../../components/button'
import { login } from '../api'
import { showApiNotification } from '../helpers/notification'
import { HelperAdmin } from '../../../../components/HelperAdmin'
import LogoImage from '../../../../assets/logo-text.png'
import HomeIcon from '../../../../assets/icon/icon-mainflow/home.svg'

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

    try {
      setLoading(true)
      setError(null)
      setApiResponse(null)
      setNotifyResponse(null)
      
      // Gọi API login
      const response = await login({ email, password })
      
      // Lưu response để hiển thị HelperAdmin
      setApiResponse(response)
      
      // Xử lý khi đăng nhập thành công
      if (response.isSuccess && response.data) {
        const { token, fullName, role, avatarUrl } = response.data
        
        // TODO: Lưu token vào context / storage
        // TODO: Lưu thông tin user vào context / storage
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
        // Chỉ hiển thị thông báo lỗi bằng React Native Alert, không hiển thị text lỗi ở dưới form
        showApiNotification(response)
      }
    } catch (err) {
      console.error('Login error:', err)
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

        <Text style={styles.forgotText}>Quên mật khẩu?</Text>

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
