import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'
import { TextInput } from '../../../../components/textInput'
import { Button } from '../../../../components/button'
import { login } from '../api'
import BigfootImage from '../../../../assets/bigfoot.png'

/**
 * LoginPanel: toàn bộ cột bên phải của màn đăng nhập (tiêu đề + form + ghi chú)
 *
 * @param {{
 *   onPressSignUp?: () => void
 *   onPressGoogle?: () => void
 * }} props
 */
export function LoginPanel({ onPressSignUp, onPressGoogle }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
    try {
      setLoading(true)
      setError(null)
      const result = await login({ email, password })
      // TODO: gắn token vào context / storage
      console.log('Đăng nhập thành công:', result)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Đăng nhập thất bại, vui lòng thử lại.')
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
