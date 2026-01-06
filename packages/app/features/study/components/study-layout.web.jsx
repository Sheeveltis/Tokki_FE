import React, { useState } from 'react'
import { View, StyleSheet, ScrollView, Platform, TouchableOpacity, Text } from 'react-native'
import { Navbar } from 'components/navbar'
import { QuickLevelTestButton } from './quick-level-test-button.web'
import { StudyStatsCards } from './study-stats-cards.web'
import { MessageModal } from 'components/MessageModal'
import Bunny2 from '../../../../assets/bunny/2.png'

/**
 * StudyLayout (Web): Bố cục chung với button bên trái và stats bên phải
 */
export function StudyLayout({ children, onQuickTestPress, lessonsLearned, streakDays, modalState, onModalClose, onModalContinue, onModalTest }) {
  const [hoveredButton, setHoveredButton] = useState(null)
  const { showModal, selectedLevel } = modalState || { showModal: false, selectedLevel: null }

  return (
    <View style={styles.root}>
      <Navbar />
      
      {/* Bên trái: Nút kiểm tra level nhanh - nằm ngoài ScrollView */}
      <View style={styles.leftSide}>
        <QuickLevelTestButton onPress={onQuickTestPress} />
      </View>

      {/* Giữa: Content chính trong ScrollView */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.centerContent}>
          {children}
        </View>
      </ScrollView>

      {/* Bên phải: Thống kê học tập - nằm ngoài ScrollView */}
      <View style={styles.rightSide}>
        <StudyStatsCards lessonsLearned={lessonsLearned} streakDays={streakDays} />
      </View>

      {/* Modal overlay - render ở level cao nhất để che phủ navbar */}
      {showModal && (
        <View
          style={styles.modalOverlay}
          pointerEvents="box-none"
        >
          <MessageModal
            title="Làm test nhé"
            message="Bạn có muốn kiểm tra level hiện tại của bạn để Tooki bám sát khả năng của bạn đưa ra lộ trình tốt hơn không ?"
            image={Bunny2}
            backgroundColor="#FFFFFF"
            showButton={false}
            showCloseButton={true}
            onClose={onModalClose}
            customButtons={
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    styles.continueButton,
                    hoveredButton === 'continue' && styles.modalButtonHovered,
                  ]}
                  onPress={onModalContinue}
                  onHoverIn={() => Platform.OS === 'web' && setHoveredButton('continue')}
                  onHoverOut={() => Platform.OS === 'web' && setHoveredButton(null)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.continueButtonText}>Tiếp tục học</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    styles.testButton,
                    hoveredButton === 'test' && styles.modalButtonHovered,
                  ]}
                  onPress={onModalTest}
                  onHoverIn={() => Platform.OS === 'web' && setHoveredButton('test')}
                  onHoverOut={() => Platform.OS === 'web' && setHoveredButton(null)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.testButtonText}>Kiểm tra</Text>
                </TouchableOpacity>
              </View>
            }
          />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFD7D0',
    position: 'relative',
  },
  scrollContent: {
    width: '100%',
    flex: 1,
    alignItems: 'center',
    // Căn từ trên xuống để không tạo khoảng trống lớn phía dưới
    justifyContent: 'flex-start',
    paddingTop: 0,
    paddingBottom: 32,
    paddingHorizontal: 16,
  },
  centerContent: {
    width: '100%',
    maxWidth: 900,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftSide: {
    position: 'absolute',
    left: 40,
    top: 100,
    zIndex: 10,
    ...(Platform.OS === 'web' && {
      position: 'fixed',
    }),
  },
  rightSide: {
    position: 'absolute',
    right: 40,
    top: 100,
    zIndex: 10,
    ...(Platform.OS === 'web' && {
      position: 'fixed',
    }),
  },
  modalOverlay: {
    position: Platform.OS === 'web' ? 'fixed' : 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    zIndex: 9999,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 22,
    minWidth: 160,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transitionProperty: 'transform, opacity',
      transitionDuration: '200ms',
      transitionTimingFunction: 'ease-out',
    }),
  },
  modalButtonHovered: {
    transform: [{ scale: 1.05 }],
    opacity: 0.9,
  },
  continueButton: {
    backgroundColor: '#89A455',
  },
  testButton: {
    backgroundColor: '#F4B8AF',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Epilogue, sans-serif',
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Epilogue, sans-serif',
  },
})


