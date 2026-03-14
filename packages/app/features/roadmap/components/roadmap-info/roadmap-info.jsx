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
  levelSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFD7D0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  startButton: {
    marginTop: 10,
    backgroundColor: '#FF6B6B', // Màu đỏ cam giống nút History
    borderRadius: 8,
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
