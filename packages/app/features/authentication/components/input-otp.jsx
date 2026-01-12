import React, { useState } from 'react'
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native'
import { TextInput } from '../../../../components/textInput'
import { RedBtn } from '../../../../components/redbtn'
import { verifyForgotPasswordOtp } from '../api'

/**
 * InputOTP: Modal popup để nhập OTP và xác thực
 * Props:
 *  - visible: boolean - Hiển thị/ẩn modal
 *  - email: string - Email đã nhập từ InputEmail
 *  - onClose: () => void - Callback khi đóng modal
 *  - verifyFn?: (email: string, otp: string) => Promise<any> - hàm verify tuỳ biến
 *  - onSuccess: (data) => void - Callback khi xác thực OTP thành công
 */
export const InputOTP = ({ visible, email, onClose, onSuccess, verifyFn }) => {
  const [otpCode, setOtpCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleConfirm = async () => {
    // Validate OTP
    if (!otpCode || !otpCode.trim()) {
      setError('Vui lòng nhập OTP')
      return
    }

    if (!email) {
      setError('Email không hợp lệ')
      return
    }

    try {
      setLoading(true)
      setError('')
      const verify = verifyFn || verifyForgotPasswordOtp
      const response = await verify(email, otpCode.trim())
      
      if (onSuccess) {
        onSuccess(response)
      }
      
      // Reset form and close modal
      setOtpCode('')
      if (onClose) {
        onClose()
      }
    } catch (err) {
      setError(err.message || 'OTP không đúng. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setOtpCode('')
    setError('')
    if (onClose) {
      onClose()
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Nhập OTP</Text>
            <TouchableOpacity
              onPress={handleClose}
              style={styles.closeButton}
              activeOpacity={0.7}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          {/* OTP Input */}
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Nhập OTP"
              value={otpCode}
              onChangeText={(text) => {
                setOtpCode(text)
                setError('')
              }}
              keyboardType="number-pad"
              autoCapitalize="none"
              inputStyle={styles.input}
            />
            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}
          </View>

          {/* Confirm Button */}
          <View style={styles.buttonContainer}>
            <RedBtn
              onPress={handleConfirm}
              disabled={loading}
              style={[
                styles.confirmButton,
                loading && styles.confirmButtonDisabled,
              ]}
            >
              <Text style={styles.confirmButtonText}>
                {loading ? 'Đang xác thực...' : 'Xác nhận'}
              </Text>
            </RedBtn>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#DCDCDC',
    borderRadius: 12,
    padding: 28,
    width: '92%',
    maxWidth: 520,
    borderWidth: 1,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    fontFamily: 'Epilogue, sans-serif',
    flex: 1,
    paddingRight: 12,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    fontFamily: 'Epilogue, sans-serif',
  },
  inputContainer: {
    marginBottom: 24,
    width: '100%',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: 'Epilogue, sans-serif',
    color: '#333',
    minHeight: 50,
  },
  errorText: {
    fontSize: 14,
    color: '#941C28',
    marginTop: 8,
    fontFamily: 'Epilogue, sans-serif',
  },
  buttonContainer: {
    alignItems: 'flex-end',
    width: '100%',
  },
  confirmButton: {
    minWidth: 140,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Epilogue, sans-serif',
  },
})
