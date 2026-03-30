import React from 'react'
import { View, Text, StyleSheet, Pressable, Modal, Platform } from 'react-native'

/**
 * SettingsModal: Modal để chọn chế độ câu hỏi và cách trả lời
 */
export function SettingsModal({
  visible,
  questionMode,
  answerMode,
  onClose,
  onSave,
  canChangeAnswerMode = true,
}) {
  const [localQuestionMode, setLocalQuestionMode] = React.useState(questionMode)
  const [localAnswerMode, setLocalAnswerMode] = React.useState(answerMode)

  React.useEffect(() => {
    if (visible) {
      setLocalQuestionMode(questionMode)
      setLocalAnswerMode(answerMode)
    }
  }, [visible, questionMode, answerMode])

  const handleSave = () => {
    onSave(localQuestionMode, localAnswerMode)
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Cài đặt</Text>

          {/* Question Mode Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chế độ câu hỏi</Text>
            <View style={styles.optionsContainer}>
              <Pressable
                style={[
                  styles.option,
                  localQuestionMode === 'vietnamese' && styles.optionSelected,
                ]}
                onPress={() => setLocalQuestionMode('vietnamese')}
              >
                <Text style={[
                  styles.optionText,
                  localQuestionMode === 'vietnamese' && styles.optionTextSelected,
                ]}>
                  Tiếng Việt
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.option,
                  localQuestionMode === 'korean' && styles.optionSelected,
                ]}
                onPress={() => setLocalQuestionMode('korean')}
              >
                <Text style={[
                  styles.optionText,
                  localQuestionMode === 'korean' && styles.optionTextSelected,
                ]}>
                  Tiếng Hàn
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.option,
                  localQuestionMode === 'mix' && styles.optionSelected,
                ]}
                onPress={() => setLocalQuestionMode('mix')}
              >
                <Text style={[
                  styles.optionText,
                  localQuestionMode === 'mix' && styles.optionTextSelected,
                ]}>
                  Trộn
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Answer Mode Selection */}
          {canChangeAnswerMode && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Cách trả lời</Text>
              <View style={styles.optionsContainer}>
                <Pressable
                  style={[
                    styles.option,
                    localAnswerMode === 'multipleChoice' && styles.optionSelected,
                  ]}
                  onPress={() => setLocalAnswerMode('multipleChoice')}
                >
                  <Text style={[
                    styles.optionText,
                    localAnswerMode === 'multipleChoice' && styles.optionTextSelected,
                  ]}>
                    Trắc nghiệm
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.option,
                    localAnswerMode === 'typeAnswer' && styles.optionSelected,
                  ]}
                  onPress={() => setLocalAnswerMode('typeAnswer')}
                >
                  <Text style={[
                    styles.optionText,
                    localAnswerMode === 'typeAnswer' && styles.optionTextSelected,
                  ]}>
                    Gõ đáp án
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.option,
                    localAnswerMode === 'mix' && styles.optionSelected,
                  ]}
                  onPress={() => setLocalAnswerMode('mix')}
                >
                  <Text style={[
                    styles.optionText,
                    localAnswerMode === 'mix' && styles.optionTextSelected,
                  ]}>
                    Trộn
                  </Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <Pressable style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </Pressable>
            <Pressable style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Lưu</Text>
            </Pressable>
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
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 500,
    gap: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  option: {
    flex: 1,
    minWidth: 100,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  optionSelected: {
    borderColor: '#79964E',
    backgroundColor: '#79964E20',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
  },
  optionTextSelected: {
    color: '#79964E',
    fontWeight: '700',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
  },
  saveButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#79964E',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Epilogue, sans-serif',
  },
})

