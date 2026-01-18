import React, { useState, useMemo } from 'react'
import { Pressable, StyleSheet, Text, View, Modal, TouchableOpacity } from 'react-native'
import { TOPIK_LEVELS, getLevelData, formatTime, getTotalTime } from '../../api/roadmap-info'

const LEVELS = TOPIK_LEVELS.map((l) => ({ value: l.level, label: l.label }))

export function RoadmapInfo({ onStart, initialLevel = 1 }) {
  const [selectedLevel, setSelectedLevel] = useState(initialLevel)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const selectedLevelData = LEVELS.find((l) => l.value === selectedLevel) || LEVELS[0]
  const levelInfo = useMemo(() => getLevelData(selectedLevel), [selectedLevel])
  const totalTime = useMemo(() => getTotalTime(selectedLevel), [selectedLevel])
  const formattedTime = useMemo(() => formatTime(totalTime), [totalTime])

  const handleStart = () => {
    if (onStart) {
      onStart(selectedLevel)
    }
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

        {/* Test Info */}
        <View style={styles.testInfo}>
          <Text style={styles.testDetail}>Thời gian: {formattedTime}</Text>
          <Text style={styles.testDetail}>Số câu: {levelInfo.questions}</Text>
        </View>

        {/* Level Selection */}
        <View style={styles.levelSection}>
          <Text style={styles.levelLabel}>Chọn cấp độ để bắt đầu</Text>
          <Pressable onPress={() => setIsDropdownOpen(true)} style={styles.dropdownButton}>
            <Text style={styles.dropdownText}>{selectedLevelData.label}</Text>
            <Text style={styles.dropdownArrow}>▼</Text>
          </Pressable>
        </View>

        {/* Start Button */}
        <Pressable onPress={handleStart} style={({ pressed }) => [styles.startButton, pressed && styles.startButtonPressed]}>
          <Text style={styles.startButtonText}>Bắt đầu Ngay</Text>
        </Pressable>
      </View>

      {/* Dropdown Modal */}
      <Modal visible={isDropdownOpen} transparent animationType="fade" onRequestClose={() => setIsDropdownOpen(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsDropdownOpen(false)}
        >
          <View style={styles.dropdownContainer}>
            {LEVELS.map((level) => (
              <TouchableOpacity
                key={level.value}
                style={[styles.dropdownItem, selectedLevel === level.value && styles.dropdownItemSelected]}
                onPress={() => {
                  setSelectedLevel(level.value)
                  setIsDropdownOpen(false)
                }}
              >
                <Text style={[styles.dropdownItemText, selectedLevel === level.value && styles.dropdownItemTextSelected]}>
                  {level.label}
                </Text>
              </TouchableOpacity>
            ))}
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
    backgroundColor: '#FFF8F0',
    borderRadius: 30,
    paddingVertical: 20,
    paddingHorizontal: 24,
    gap: 12,
  },
  introTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
  },
  introText: {
    fontSize: 15,
    color: '#2C2C2C',
    fontFamily: 'Epilogue, sans-serif',
    lineHeight: 22,
  },
  content: {
    gap: 16,
    alignItems: 'center',
    width: '100%',
  },
  callToAction: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
  },
  instruction: {
    fontSize: 15,
    color: '#2C2C2C',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
  },
  testInfo: {
    gap: 8,
    alignItems: 'center',
  },
  testDetail: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
  },
  levelSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
  },
  levelLabel: {
    fontSize: 15,
    color: '#2C2C2C',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF8F0',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    minWidth: 140,
  },
  dropdownText: {
    fontSize: 15,
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
    fontWeight: '600',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
  },
  startButton: {
    alignSelf: 'center',
    backgroundColor: '#FFF8F0',
    borderRadius: 16,
    paddingHorizontal: 32,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  startButtonPressed: {
    transform: [{ scale: 0.98 }],
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1C',
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
