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

const TOPIK_REQUIREMENTS = [
  { value: 1, displayName: 'TOPIK I - Level 1', passScore: 80, totalScore: 200 },
  { value: 2, displayName: 'TOPIK I - Level 2', passScore: 140, totalScore: 200 },
  { value: 3, displayName: 'TOPIK II - Level 3', passScore: 120, totalScore: 300 },
  { value: 4, displayName: 'TOPIK II - Level 4', passScore: 150, totalScore: 300 },
  { value: 5, displayName: 'TOPIK II - Level 5', passScore: 190, totalScore: 300 },
  { value: 6, displayName: 'TOPIK II - Level 6', passScore: 230, totalScore: 300 },
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
        <View style={styles.badgeRow}>
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumBadgeText}>LỘ TRÌNH CÁ NHÂN HÓA</Text>
          </View>
        </View>

        <Text style={styles.introTitle}>Lộ trình luyện TOPIK cá nhân hóa</Text>
        <Text style={styles.introText}>
          Giúp bạn biết chính xác hôm nay cần học gì để bám sát mục tiêu thi TOPIK.
          Hệ thống sẽ dựa vào trình độ đầu vào của bạn để sắp xếp nội dung tối ưu nhất.
        </Text>
      </View>

      <View style={styles.learningPlanCard}>
        <View style={styles.planHeader}>
          <Text style={styles.planTitle}>Yêu cầu điểm đạt theo trình độ</Text>
          <View style={styles.planBadge}>
            <Text style={styles.planBadgeText}>CHỈ TIÊU TOPIK</Text>
          </View>
        </View>

        <View style={styles.dayGrid}>
          {TOPIK_REQUIREMENTS.map((item) => (
            <Pressable
              key={item.value}
              onPress={() => setSelectedLevel(item.value)}
              style={({ pressed, hovered }) => [
                styles.dayCell,
                selectedLevel === item.value && styles.selectedRequirement,
                pressed && styles.pressedRequirement,
                hovered && styles.hoveredRequirement,
              ]}
            >
              <View style={[styles.dayIndicator, selectedLevel === item.value && styles.selectedIndicator]}>
                <Text style={[styles.dayLabel, selectedLevel === item.value && styles.selectedLabelText]}>{item.displayName}</Text>
              </View>
              <View style={styles.scoreInfo}>
                <Text style={styles.scoreProgressText}>{item.passScore} / {item.totalScore}</Text>
                <Text style={styles.scoreLabel}>Điểm đạt</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.footerSection}>
        <Text style={styles.instruction}>Bắt đầu bài kiểm tra để kích hoạt lộ trình riêng cho bạn</Text>
        <Pressable
          onPress={openSelectionModal}
          style={({ pressed }) => [
            styles.startButton,
            pressed && styles.startButtonPressed
          ]}
        >
          <Text style={styles.startButtonText}>Bắt đầu ngay</Text>
        </Pressable>
      </View>

      <Modal visible={isSelectionModalOpen} transparent animationType="fade" onRequestClose={closeSelectionModal}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={closeSelectionModal}>
          <View style={styles.selectionModalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.selectionTitle}>Cấu hình đầu vào</Text>
              <Text style={styles.modalSubtitle}>Chọn trình độ phù hợp để chúng tôi sắp xếp lộ trình</Text>
            </View>

            <View style={[styles.selectionSection, { zIndex: openListKey === 'level' ? 20 : 10 }]}>
              <Text style={styles.selectionLabel}>Bạn muốn thi lấy chứng chỉ nào?</Text>
              <Pressable style={styles.selectionTrigger} onPress={() => toggleList('level')}>
                <View>
                  <Text style={styles.selectionTriggerValue}>
                    {LEVELS.find((level) => level.value === selectedLevel)?.label}
                  </Text>
                </View>
                <Text style={styles.selectionTriggerArrow}>▼</Text>
              </Pressable>

              {openListKey === 'level' && (
                <View style={styles.inlineDropdown}>
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
              )}
            </View>

            <View style={[styles.selectionSection, { zIndex: openListKey === 'selfDeclared' ? 20 : 5 }]}>
              <Text style={styles.selectionLabel}>Trình độ hiện tại của bạn</Text>
              <Pressable style={styles.selectionTrigger} onPress={() => toggleList('selfDeclared')}>
                <View>
                  <Text style={styles.selectionTriggerValue}>
                    {SELF_DECLARED_LEVELS.find((level) => level.value === selectedSelfDeclaredLevel)?.label}
                  </Text>
                </View>
                <Text style={styles.selectionTriggerArrow}>▼</Text>
              </Pressable>

              {openListKey === 'selfDeclared' && (
                <View style={styles.inlineDropdown}>
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
                      <Text style={[styles.dropdownItemText, selectedSelfDeclaredLevel === level.value && styles.dropdownItemTextSelected]}>
                        {level.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.modalActions}>
              <Pressable style={styles.cancelButton} onPress={closeSelectionModal}>
                <Text style={styles.cancelButtonText}>Để sau</Text>
              </Pressable>
              <Pressable style={styles.confirmButton} onPress={confirmSelection}>
                <Text style={styles.confirmButtonText}>Bắt đầu kiểm tra</Text>
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
    gap: 20,
    width: '100%',
  },
  introCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    gap: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
    }),
  },
  badgeRow: {
    marginBottom: 4,
  },
  premiumBadge: {
    backgroundColor: '#FFF2CC',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  premiumBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#D48806',
    letterSpacing: 1,
  },
  introTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
    lineHeight: 34,
  },
  introText: {
    fontSize: 15,
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
    lineHeight: 24,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  metaPill: {
    backgroundColor: '#FAFAFA',
    borderColor: '#EEEEEE',
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flex: 1,
    minWidth: 140,
  },
  metaPillLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  metaPillValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  learningPlanCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#F0F0F0',
    borderWidth: 1,
    borderRadius: 24,
    padding: 24,
    gap: 20,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
    }),
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  planTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  planBadge: {
    backgroundColor: '#F0F7FF',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  planBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0066FF',
  },
  dayGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  dayCell: {
    flex: 1,
    minWidth: 160,
    backgroundColor: '#FDFDFD',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F5F5F5',
    padding: 16,
    gap: 12,
  },
  selectedRequirement: {
    backgroundColor: '#FFF2CC',
    borderColor: '#FFC107',
  },
  hoveredRequirement: {
    backgroundColor: '#F7F7F7',
    borderColor: '#DDD',
  },
  pressedRequirement: {
    backgroundColor: '#EEEEEE',
    transform: [{ scale: 0.98 }],
  },
  dayIndicator: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  selectedIndicator: {
    backgroundColor: '#FFEB3B',
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: '#888',
  },
  selectedLabelText: {
    color: '#7A4B0A',
  },
  scoreInfo: {
    gap: 2,
  },
  scoreProgressText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1A1A1A',
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#AAA',
    textTransform: 'uppercase',
  },
  footerSection: {
    marginTop: 10,
    gap: 16,
    alignItems: 'center',
  },
  instruction: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
    textAlign: 'center',
  },
  startButton: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    paddingHorizontal: 32,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
      transition: 'all 0.2s ease',
    }),
  },
  startButtonPressed: {
    transform: [{ scale: 0.98 }],
    backgroundColor: '#333',
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  startButtonArrow: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      backdropFilter: 'blur(8px)',
    }),
  },
  selectionModalContainer: {
    width: '90%',
    maxWidth: 480,
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 32,
    gap: 24,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 30px 60px rgba(0,0,0,0.2)',
    }),
  },
  modalHeader: {
    gap: 4,
  },
  selectionTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1A1A1A',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  selectionSection: {
    gap: 12,
    zIndex: 10, // Higher zIndex for stacking
    position: 'relative', // Context for absolute dropdown
  },
  selectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  selectionTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#F0F0F0',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FDFDFD',
  },
  selectionTriggerValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  selectionTriggerArrow: {
    fontSize: 10,
    color: '#999',
  },
  inlineDropdown: {
    position: 'absolute',
    top: 96, // Adjust based on height of label + trigger
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    overflow: 'hidden',
    zIndex: 100,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    }),
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#666',
  },
  confirmButton: {
    flex: 1.5,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  dropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#FAFAFA',
  },
  dropdownItemSelected: {
    backgroundColor: '#FAF9F6',
  },
  dropdownItemHover: {
    backgroundColor: '#F8F8F8',
  },
  dropdownItemPressed: {
    backgroundColor: '#F0F0F0',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#444',
    fontWeight: '500',
  },
  dropdownItemTextSelected: {
    fontWeight: '800',
    color: '#1A1A1A',
  },
})

