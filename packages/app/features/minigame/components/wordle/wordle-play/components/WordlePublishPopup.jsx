import { Modal, View, Text, StyleSheet, Pressable, Platform } from 'react-native'

export function WordlePublishPopup({ visible, loading, onConfirm, onCancel }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Công khai câu văn</Text>
 
          <Text style={styles.message}>
            Bạn có muốn công khai câu văn này lên không?
          </Text>

          <View style={styles.buttonContainer}>
            <Pressable
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </Pressable>

            <Pressable
              style={[styles.button, styles.confirmButton]}
              onPress={onConfirm}
              disabled={loading}
            >
              <Text style={styles.confirmButtonText}>Gửi</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  container: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#FFF9E3',
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#8D6E63',
    padding: 24,
    alignItems: 'center',
    elevation: 12,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
    }),
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 12,
    textAlign: 'center',
    color: '#8B4513',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#5D4037',
    lineHeight: 22,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 4px 0 #2E7D32, 0 4px 8px rgba(0,0,0,0.15)',
    }),
  },
  cancelButton: {
    backgroundColor: '#CFD8DC',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 4px 0 #90A4AE, 0 4px 8px rgba(0,0,0,0.1)',
    }),
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 16,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  cancelButtonText: {
    color: '#37474F',
    fontWeight: '800',
    fontSize: 16,
  },
})

export default WordlePublishPopup