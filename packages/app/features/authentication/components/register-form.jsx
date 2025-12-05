import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'
import { TextInput } from '../../../../components/textInput'
import { Button } from '../../../../components/button'
import BigfootImage from '../../../../assets/bigfoot.png'

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
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Chuẩn hoá source để hỗ trợ cả import module (Next/webpack) lẫn require/uri
  const normalizeImageSource = (src) => {
    if (!src) return null
    if (typeof src === 'number' || typeof src === 'string') return src
    if (src.uri) return src
    if (src.src) return { uri: src.src }
    if (src.default) return src.default
    return src
  }

  const bigfootSource = normalizeImageSource(BigfootImage)

  const handleSubmit = async () => {
    if (loading) return

    // Validation đơn giản trên FE
    if (!fullName || !email || !password || !confirmPassword) {
      setError('Vui lòng nhập đầy đủ thông tin.')
      return
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.')
      return
    }

    try {
      setLoading(true)
      setError(null)
      // TODO: gọi API đăng ký thật sự
      console.log('Register payload:', { fullName, email, password, confirmPassword })
      await new Promise((resolve) => setTimeout(resolve, 800))
    } catch (err) {
      console.error(err)
      setError(err.message || 'Đăng ký thất bại, vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>Tooki</Text>
        {bigfootSource && (
          <Image source={bigfootSource} style={styles.logoImage} />
        )}
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
          <TextInput
            label="Xác nhận mật khẩu"
            placeholder="Nhập lại mật khẩu"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
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
    top: 32,
    left: 32,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontSize: 30,
    fontWeight: '700',
    fontFamily: 'Lexend, sans-serif',
    color: '#000',
  },
  logoImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    position: 'absolute',
    top: -30,
    left: 80,
    zIndex: 10,
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


