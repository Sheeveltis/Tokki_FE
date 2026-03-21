import { useMemo, useState } from 'react'
import { Modal, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { TOPIK_LEVELS, formatTime, getTotalTime } from '../../api/roadmap-info'

const LEVELS = TOPIK_LEVELS.map((l) => ({ value: l.level, label: l.label }))

const SELF_DECLARED_LEVELS = [
  { value: 0, label: 'Chưa bao giờ' },
  { value: 1, label: 'Học cơ bản' },
  { value: 3, label: 'Đã học 1-2 năm' },
  { value: 5, label: 'Đã thành thạo' },
]

const LEARNING_FLOW_DAYS = [
  { day: 'Ngày 1', focus: 'Nghe - Từ vựng trọng tâm' },
  { day: 'Ngày 2', focus: 'Đọc - Dạng câu thường gặp' },
  { day: 'Ngày 3', focus: 'Viết - Mẫu câu ghi điểm' },
  { day: 'Ngày 4', focus: 'Luyện đề mini + chữa lỗi' },
  { day: 'Ngày 5', focus: 'Ôn tập tổng hợp theo chủ đề' },
]

export function RoadmapInfo({ onStart, initialLevel = 1 }) {
  const [selectedLevel, setSelectedLevel] = useState(initialLevel)
  const [selectedSelfDeclaredLevel, setSelectedSelfDeclaredLevel] = useState(SELF_DECLARED_LEVELS[0].value)
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false)
  const [openListKey, setOpenListKey] = useState(null)

  const selectedLevelInfo = useMemo(
    () => TOPIK_LEVELS.find((level) => level.level === selectedLevel) || TOPIK_LEVELS[0],
    [selectedLevel],
  )

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

  return (
    <View style={styles.container}>
      <View style={styles.introCard}>
        <Text style={styles.introTitle}>Lộ trình luyện TOPIK cá nhân hóa</Text>
        <Text style={styles.introText}>
          Chọn đúng đầu vào để hệ thống sắp xếp nội dung học theo ngày, giúp bạn biết hôm nay cần học gì và bám sát
          tiến độ thi TOPIK.
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.metaPill}>
            <Text style={styles.metaPillLabel}>Bài kiểm tra</Text>
            <Text style={styles.metaPillValue}>{selectedLevelInfo.label}</Text>
          </View>
          <View style={styles.metaPill}>
            <Text style={styles.metaPillLabel}>Số câu</Text>
            <Text style={styles.metaPillValue}>{selectedLevelInfo.questions} câu</Text>
          </View>
          <View style={styles.metaPill}>
            <Text style={styles.metaPillLabel}>Thời lượng</Text>
            <Text style={styles.metaPillValue}>{formatTime(getTotalTime(selectedLevel))}</Text>
          </View>
        </View>
      </View>

      <View style={styles.learningPlanCard}>
        <Text style={styles.planTitle}>Lịch học theo ngày</Text>
        <View style={styles.dayGrid}>
          {LEARNING_FLOW_DAYS.map((item) => (
            <View key={item.day} style={styles.dayCell}>
              <Text style={styles.dayLabel}>{item.day}</Text>
              <Text style={styles.dayFocus} numberOfLines={2}>
                {item.focus}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.instruction}>Bắt đầu kiểm tra để tạo kế hoạch học chuẩn theo từng ngày</Text>
        <Pressable onPress={openSelectionModal} style={({ pressed }) => [styles.startButton, pressed && styles.startButtonPressed]}>
          <Text style={styles.startButtonText}>Bắt đầu ngay</Text>
        </Pressable>
      </View>

      <Modal visible={isSelectionModalOpen} transparent animationType="fade" onRequestClose={closeSelectionModal}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={closeSelectionModal}>
          <View style={styles.selectionModalContainer}>
            <Text style={styles.selectionTitle}>Chọn trình độ để bắt đầu</Text>

            <View style={styles.selectionSection}>
              <Text style={styles.selectionLabel}>Bài kiểm tra</Text>
              <Pressable style={styles.selectionTrigger} onPress={() => toggleList('level')}>
                <Text style={styles.selectionTriggerText}>{LEVELS.find((level) => level.value === selectedLevel)?.label}</Text>
                <Text style={styles.selectionTriggerArrow}>▼</Text>
              </Pressable>
              <Modal visible={openListKey === 'level'} transparent animationType="fade" onRequestClose={() => setOpenListKey(null)}>
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setOpenListKey(null)}>
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
                        <Text style={[styles.dropdownItemText, selectedLevel === level.value && styles.dropdownItemTextSelected]}>
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
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setOpenListKey(null)}>
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
    gap: 14,
    width: '100%',
  },
  introCard: {
    backgroundColor: '#FDF7EC',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 18,
    gap: 10,
    borderWidth: 1,
    borderColor: '#FFD7D0',
  },
  introTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
  },
  introText: {
    fontSize: 14,
    color: '#4A4A4A',
    fontFamily: 'Epilogue, sans-serif',
    lineHeight: 21,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  metaPill: {
    backgroundColor: '#FFF3E8',
    borderColor: '#FFD6B8',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 120,
  },
  metaPillLabel: {
    fontSize: 12,
    color: '#6C5A45',
    fontFamily: 'Epilogue, sans-serif',
  },
  metaPillValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E1E1E',
    fontFamily: 'Epilogue, sans-serif',
    marginTop: 2,
  },
  learningPlanCard: {
    backgroundColor: '#FFFDF8',
    borderColor: '#FFE8C8',
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2A2A2A',
    fontFamily: 'Epilogue, sans-serif',
  },
  dayGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayCell: {
    width: '32%',
    minWidth: 150,
    backgroundColor: '#FFF5E8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFDDB5',
    paddingVertical: 10,
    paddingHorizontal: 10,
    gap: 4,
  },
  dayLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#7A4B0A',
    fontFamily: 'Epilogue, sans-serif',
  },
  dayFocus: {
    fontSize: 13,
    lineHeight: 18,
    color: '#4A4A4A',
    fontFamily: 'Epilogue, sans-serif',
  },
  content: {
    gap: 12,
    alignItems: 'center',
    width: '100%',
  },
  instruction: {
    fontSize: 14,
    color: '#4A4A4A',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
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
    backgroundColor: '#FF6B6B',
    borderRadius: 100,
    paddingHorizontal: 34,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 4,
    elevation: 3,
    ...(Platform.OS === 'web' && {
      transitionDuration: '150ms',
      transitionProperty: 'transform, background-color',
      transitionTimingFunction: 'ease-out',
    }),
  },
  startButtonPressed: {
    backgroundColor: '#FF5252',
    transform: [{ scale: 0.98 }],
  },
  startButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Epilogue, sans-serif',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
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
