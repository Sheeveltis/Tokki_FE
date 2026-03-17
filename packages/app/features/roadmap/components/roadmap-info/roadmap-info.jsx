import { useState } from 'react'
import { Pressable, StyleSheet, Text, View, Modal, TouchableOpacity } from 'react-native'
import { TOPIK_LEVELS } from '../../api/roadmap-info'

const LEVELS = TOPIK_LEVELS.map((l) => ({ value: l.level, label: l.label }))

const SELF_DECLARED_LEVELS = [
  { value: 0, label: 'Chưa bao giờ' },
  { value: 1, label: 'Học cơ bản' },
  { value: 3, label: 'Đã học 1-2 năm' },
  { value: 5, label: 'Đã thành thạo' },
]

export function RoadmapInfo({ onStart, initialLevel = 1 }) {
  const [selectedLevel, setSelectedLevel] = useState(initialLevel)
  const [selectedSelfDeclaredLevel, setSelectedSelfDeclaredLevel] = useState(SELF_DECLARED_LEVELS[0].value)
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false)
  const [openListKey, setOpenListKey] = useState(null)

  const openSelectionModal = () => {
    setIsSelectionModalOpen(true)
  }

  const closeSelectionModal = () => {
    setIsSelectionModalOpen(false)
    setOpenListKey(null)
  }

  const toggleList = (key) => {
    setOpenListKey((current) => (current === key ? null : key))
  }

  const confirmSelection = () => {
    if (onStart) {
      onStart(selectedLevel, selectedSelfDeclaredLevel)
    }
    closeSelectionModal()
  }

  const handleStart = () => {
    openSelectionModal()
  }

  return (
    <View style={styles.container}>
      {/* Introduction Card */}
      <View style={styles.introCard}>
        <Text style={styles.introTitle}>Giới thiệu chung Lộ Trình</Text>
        <Text style={styles.introText}>
          Lộ trình được giảng viên Tooki khuyên dùng, hỗ trợ người dùng Luyện tập và Luyện đề để đạt điểm đỗ TOPIK
          trong thời gian ngắn nhất.
        </Text>
        <Text style={styles.introText}>
          Lộ trình cá nhân hóa cho từng người dùng và phù hợp nhất trong giai đoạn Luyện để trước kỳ thi TOPIK.
        </Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.callToAction}>Hãy cùng nhau chinh phục TOPIK nhé</Text>
        <Text style={styles.instruction}>Để bắt đầu, vui lòng làm bài kiểm tra trình độ của bạn</Text>

        {/* Start Button */}
        <Pressable onPress={handleStart} style={({ pressed }) => [styles.startButton, pressed && styles.startButtonPressed]}>
          <Text style={styles.startButtonText}>Bắt đầu Ngay</Text>
        </Pressable>
      </View>

      <Modal
        visible={isSelectionModalOpen}
        transparent
        animationType="fade"
        onRequestClose={closeSelectionModal}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={closeSelectionModal}>
          <View style={styles.selectionModalContainer}>
            <Text style={styles.selectionTitle}>Chọn trình độ để bắt đầu</Text>

            <View style={styles.selectionSection}>
              <Text style={styles.selectionLabel}>Bài kiểm tra</Text>
              <Pressable style={styles.selectionTrigger} onPress={() => toggleList('level')}>
                <Text style={styles.selectionTriggerText}>
                  {LEVELS.find((level) => level.value === selectedLevel)?.label}
                </Text>
                <Text style={styles.selectionTriggerArrow}>▼</Text>
              </Pressable>
              <Modal
                visible={openListKey === 'level'}
                transparent
                animationType="fade"
                onRequestClose={() => setOpenListKey(null)}
              >
                <TouchableOpacity
                  style={styles.modalOverlay}
                  activeOpacity={1}
                  onPress={() => setOpenListKey(null)}
                >
                  <View style={styles.listModalContainer}>
                    {LEVELS.map((level) => (
                      <Pressable
                        key={level.value}
                        onPress={() => {
                          setSelectedLevel(level.value)
                          setOpenListKey(null)
                        }}
                        style={({ hovered, pressed }) => [
                          styles.dropdownItem,
                          hovered && styles.dropdownItemHover,
                          pressed && styles.dropdownItemPressed,
                          selectedLevel === level.value && styles.dropdownItemSelected,
                        ]}
                      >
                        <Text
                          style={[styles.dropdownItemText, selectedLevel === level.value && styles.dropdownItemTextSelected]}
                        >
                          {level.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </TouchableOpacity>
              </Modal>
            </View>

            <View style={styles.selectionSection}>
              <Text style={styles.selectionLabel}>Trình độ hiện tại</Text>
              <Pressable style={styles.selectionTrigger} onPress={() => toggleList('selfDeclared')}>
                <Text style={styles.selectionTriggerText}>
                  {SELF_DECLARED_LEVELS.find((level) => level.value === selectedSelfDeclaredLevel)?.label}
                </Text>
                <Text style={styles.selectionTriggerArrow}>▼</Text>
              </Pressable>
              <Modal
                visible={openListKey === 'selfDeclared'}
                transparent
                animationType="fade"
                onRequestClose={() => setOpenListKey(null)}
              >
                <TouchableOpacity
                  style={styles.modalOverlay}
                  activeOpacity={1}
                  onPress={() => setOpenListKey(null)}
                >
                  <View style={styles.listModalContainer}>
                    {SELF_DECLARED_LEVELS.map((level) => (
                      <Pressable
                        key={level.value}
                        onPress={() => {
                          setSelectedSelfDeclaredLevel(level.value)
                          setOpenListKey(null)
                        }}
                        style={({ hovered, pressed }) => [
                          styles.dropdownItem,
                          hovered && styles.dropdownItemHover,
                          pressed && styles.dropdownItemPressed,
                          selectedSelfDeclaredLevel === level.value && styles.dropdownItemSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.dropdownItemText,
                            selectedSelfDeclaredLevel === level.value && styles.dropdownItemTextSelected,
                          ]}
                        >
                          {level.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </TouchableOpacity>
              </Modal>
            </View>

            <View style={styles.modalActions}>
              <Pressable style={styles.cancelButton} onPress={closeSelectionModal}>
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </Pressable>
              <Pressable style={styles.confirmButton} onPress={confirmSelection}>
                <Text style={styles.confirmButtonText}>Bắt đầu</Text>
              </Pressable>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  )
}


const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    gap: 24,
    width: '100%',
  },
  introCard: {
    backgroundColor: '#FDF7EC', 
    borderRadius: 16,           
    paddingVertical: 24,
    paddingHorizontal: 24,
    gap: 12,
    borderWidth: 1,
    borderColor: '#FFD7D0',     // Thêm viền nhẹ cho đồng bộ
  },
  introTitle: {
    fontSize: 22,               // Tăng size giống title bên Learning
    fontWeight: '700',
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
  },
  introText: {
    fontSize: 15,
    color: '#4A4A4A',           // Màu text phụ giống subtitle bên Learning
    fontFamily: 'Epilogue, sans-serif',
    lineHeight: 22,
  },
  content: {
    gap: 20,
    alignItems: 'center',
    width: '100%',
  },
  callToAction: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
  },
  instruction: {
    fontSize: 15,
    color: '#4A4A4A',
    fontFamily: 'Epilogue, sans-serif',
  },
  testInfo: {
    flexDirection: 'row',       // Để thời gian và số câu nằm ngang cho hiện đại
    gap: 20,
    alignItems: 'center',
    backgroundColor: '#FFE5E0', // Màu nền nhẹ cho thông số
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  testDetail: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF6B6B',           // Màu đỏ cam thương hiệu
    fontFamily: 'Epilogue, sans-serif',
  },
  selectionModalContainer: {
    width: '90%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    gap: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  selectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
  },
  selectionSection: {
    gap: 8,
  },
  selectionLabel: {
    fontSize: 14,
    color: '#4A4A4A',
    fontFamily: 'Epilogue, sans-serif',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 4,
  },
  selectionTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#FFD7D0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FFFDFB',
  },
  selectionTriggerText: {
    fontSize: 15,
    color: '#2C2C2C',
    fontFamily: 'Epilogue, sans-serif',
  },
  selectionTriggerArrow: {
    fontSize: 12,
    color: '#8C8C8C',
  },
  listModalContainer: {
    width: '80%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  cancelButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 100,
    backgroundColor: '#F0F0F0',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A4A4A',
    fontFamily: 'Epilogue, sans-serif',
  },
  confirmButton: {
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 100,
    backgroundColor: '#FF6B6B',
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Epilogue, sans-serif',
  },
  startButton: {
    marginTop: 10,
    backgroundColor: '#FF6B6B', // Màu đỏ cam giống nút History
    borderRadius: 100,
    paddingHorizontal: 40,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  startButtonPressed: {
    backgroundColor: '#FF5252',
    transform: [{ scale: 0.98 }],
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',           // Chữ trắng trên nền đỏ cam
    fontFamily: 'Epilogue, sans-serif',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    minWidth: 200,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownItemSelected: {
    backgroundColor: '#FFF8F0',
  },
  dropdownItemHover: {
    backgroundColor: '#FFF2EC',
  },
  dropdownItemPressed: {
    backgroundColor: '#FFE6DC',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#2C2C2C',
    fontFamily: 'Epilogue, sans-serif',
  },
  dropdownItemTextSelected: {
    fontWeight: '700',
    color: '#1C1C1C',
  },
})
