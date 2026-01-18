import React, { useMemo, useState } from 'react'
import { View, Text, StyleSheet, Image, Platform } from 'react-native'
import { useRouter } from 'solito/navigation'
import { TextInput } from '../../../../../components/textInput'
import { Button } from '../../../../../components/button'
import { NavigationPill } from '../../../../../components/navigation-pill'
import LogoImage from '../../../../../assets/logo-text.png'

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
    <View style={styles.container}>
      {/* Trang chủ button - chỉ hiển thị trên web */}
      {Platform.OS === 'web' && (
        <NavigationPill style={styles.backHome} label="Trang chủ" to="/homepage" />
      )}
      
      {/* Logo - chỉ hiển thị trên web */}
      {Platform.OS === 'web' && (
        <View style={styles.logoContainer}>
          {logoSource && <Image source={logoSource} style={styles.logoImage} />}
        </View>
      )}

      <View style={styles.content}>
        {/* Title */}
        <View style={styles.headerBlock}>
          <Text style={styles.title}>Tạo mật khẩu mới</Text>
          <Text style={styles.subtitle}>Hãy nhập mật khẩu mới của bạn.</Text>
        </View>

        {/* Inputs */}
        <View style={styles.formBlock}>
          <TextInput
            label="Mật khẩu"
            placeholder="Nhập Mật Khẩu Mới"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TextInput
            label="Xác nhận mật khẩu"
            placeholder="Xác Nhận Mật Khẩu"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Button
          title={submitting ? 'Đang xử lý...' : 'Xác Nhận'}
          onPress={handleSubmit}
          color="lightGreen"
          disabled={submitting}
          style={styles.submitBtn}
        />
      </View>
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
  backHome: {
    position: 'absolute',
    top: 24,
    left: 24,
    zIndex: 15,
  },
  logoContainer: {
    position: 'absolute',
    top: 24,
    right: 24,
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
    width: Platform.OS === 'web' ? '30%' : '50%',
    alignSelf: 'center',
  },
})
