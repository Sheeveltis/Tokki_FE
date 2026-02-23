import React from 'react'
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native'

/**
 * Popup hỏi người dùng có muốn công khai câu văn đã submit không
 * Props:
 * - visible: boolean
 * - loading: boolean
 * - onConfirm: () => void - khi bấm "Có"
 * - onCancel: () => void - khi bấm "Không"
 */
export function WordlePublishPopup({ visible, loading, onConfirm, onCancel }) {
  if (!visible) return null

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <Text style={styles.title}>Công khai câu văn</Text>
        <Text style={styles.message}>
          Bạn có muốn công khai câu văn này lên không?
        </Text>

        <View style={styles.buttonContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.cancelButton,
              pressed && styles.buttonPressed,
              loading && styles.buttonDisabled,
            ]}
            onPress={onCancel}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Không</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.confirmButton,
              pressed && styles.buttonPressed,
              loading && styles.buttonDisabled,
            ]}
            onPress={onConfirm}
            disabled={loading}
          >
            <Text style={styles.confirmButtonText}>Có</Text>
          </Pressable>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3000,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(4px)',
      },
    }),
  },
  card: {
    width: '90%',
    maxWidth: 420,
    backgroundColor: '#FFF5E6',
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 28,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 8,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1C1C1C',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: Platform.select({
      web: 'Epilogue, sans-serif',
      default: undefined,
    }),
  },
  message: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4E342E',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 26,
    fontFamily: Platform.select({
      web: 'Epilogue, sans-serif',
      default: undefined,
    }),
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 16,
    justifyContent: 'center',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      },
    }),
  },
  confirmButton: {
    backgroundColor: '#7CB342',
  },
  cancelButton: {
    backgroundColor: '#CFD8DC',
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    opacity: 0.6,
    ...Platform.select({
      web: {
        cursor: 'not-allowed',
      },
    }),
  },
  confirmButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: Platform.select({
      web: 'Epilogue, sans-serif',
      default: undefined,
    }),
  },
  cancelButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#37474F',
    fontFamily: Platform.select({
      web: 'Epilogue, sans-serif',
      default: undefined,
    }),
  },
})

export default WordlePublishPopup

