import React, { useMemo, useState } from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native'
import { useRouter } from 'solito/navigation'
import { TextInput } from '../../../../../components/textInput'
import { Button } from '../../../../../components/button'
import LogoImage from '../../../../../assets/logo-text.png'
import HomeIcon from '../../../../../assets/icon/icon-mainflow/home.svg'

/**
 * ForgotPasswordForm: Form tạo mật khẩu mới
 * Props:
 *  - email?: string
 *  - onSubmit?: (data: { email?: string; newPassword: string; confirmPassword: string }) => void
 */
export const ForgotPasswordForm = ({ email, onSubmit }) => {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Chuẩn hoá source để hỗ trợ cả web/native
  const normalizeImageSource = (src) => {
    if (!src) return null
    if (typeof src === 'number' || typeof src === 'string') return src
    if (src.uri) return src
    if (src.src) return { uri: src.src }
    if (src.default) return src.default
    return src
  }

  const logoSource = useMemo(() => normalizeImageSource(LogoImage), [])
  const homeIconSource = useMemo(() => normalizeImageSource(HomeIcon), [])

  const handleSubmit = () => {
    if (submitting) return
    if (!password.trim() || !confirmPassword.trim()) {
      setError('Vui lòng nhập đầy đủ thông tin')
      return
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      onSubmit?.({
        email,
        newPassword: password,
        confirmPassword,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <View style={styles.wrapper}>
      {/* Trang chủ + Logo */}
      <TouchableOpacity
        style={styles.backHome}
        onPress={() => router.push('/homepage')}
        activeOpacity={0.8}
      >
        {homeIconSource ? <Image source={homeIconSource} style={styles.backIcon} /> : null}
        <Text style={styles.backText}>Trang chủ</Text>
      </TouchableOpacity>
      <View style={styles.logoContainer}>
        {logoSource ? <Image source={logoSource} style={styles.logoImage} /> : null}
      </View>

      <View style={styles.card}>
        {/* Title */}
        <View style={styles.headerBlock}>
          <Text style={styles.title}>Tạo mật khẩu mới</Text>
          <Text style={styles.subtitle}>Hãy nhập mật khẩu mới của bạn.</Text>
        </View>

        {/* Inputs */}
        <View style={styles.inputGroup}>
          <TextInput
            label="Mật khẩu"
            placeholder="Nhập Mật Khẩu Mới"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            inputStyle={styles.input}
          />
          <TextInput
            label="Xác nhận mật khẩu"
            placeholder="Xác Nhận Mật Khẩu"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            inputStyle={styles.input}
          />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Button
          title={submitting ? 'Đang xử lý...' : 'Xác Nhận'}
          onPress={handleSubmit}
          color="lightGreen"
          disabled={submitting}
          style={styles.submitBtn}
          textStyle={styles.submitText}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 10,
    position: 'relative',
  },
  card: {
    width: '200%',
    maxWidth: 1000,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    gap: 50,
    marginTop: 32,
    paddingTop: 8,
    bottom: 50,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2D2D2D',
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
  inputGroup: {
    width: '100%',
    gap: 12,
  },
  input: {
    backgroundColor: '#F3F3F3',
    borderRadius: 4,
    minHeight: 50,
  },
  errorText: {
    color: '#941C28',
    fontSize: 14,
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
  },
  submitBtn: {
    marginTop: 8,
    width: '40%',
    alignSelf: 'center',
  },
  submitText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  backHome: {
    position: 'absolute',
    top: 24,
    left: -100, // sát hơn cạnh trái
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
  logoContainer: {
    position: 'absolute',
    top: 24,
    right: -100, // sát hơn cạnh phải
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoImage: {
    width: 160,
    height: 48,
    resizeMode: 'contain',
  },
  headerBlock: {
    gap: 12,
    width: '100%',
  },
})

