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
    backgroundColor: '#FFF5E6',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    elevation: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
    color: '#1C1C1C',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#4E342E',
    lineHeight: 22,
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
  },
  confirmButton: {
    backgroundColor: '#6AAA64',
  },
  cancelButton: {
    backgroundColor: '#CFD8DC',
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  cancelButtonText: {
    color: '#37474F',
    fontWeight: '700',
    fontSize: 16,
  },
})

export default WordlePublishPopup