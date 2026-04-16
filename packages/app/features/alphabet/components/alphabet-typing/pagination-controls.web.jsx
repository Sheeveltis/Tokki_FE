import React from 'react'
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native'
import { StudyIcon } from '../../../study/components/study-icon.web'
import ArrowIcon from '../../../../../assets/icon/icon-mainflow/arrow.svg'

/**
 * PaginationControls: Điều khiển phân trang
 */
export function PaginationControls({ currentIndex, total, onPrev, onNext }) {
  // Xử lý các dạng export khác nhau của SVG
  const Arrow = typeof ArrowIcon === 'function' ? ArrowIcon : (ArrowIcon?.default || ArrowIcon)

  return (
    <View style={styles.container}>
      <Pressable 
        style={({ pressed }) => [
          styles.button,
          pressed && { opacity: 0.7, transform: [{ scale: 0.95 }] }
        ]} 
        onPress={onPrev}
      >
        <StudyIcon 
          source={Arrow} 
          style={{ transform: [{ scaleX: -1 }] }} 
          tintColor="#1F1F1F"
          width={22}
          height={22}
        />
      </Pressable>

      <View style={styles.textContainer}>
        <Text style={styles.text}>
          <Text style={styles.textCurrent}>{currentIndex + 1}</Text>
          <Text style={styles.textTotal}> / {total}</Text>
        </Text>
      </View>

      <Pressable 
        style={({ pressed }) => [
          styles.button,
          pressed && { opacity: 0.7, transform: [{ scale: 0.95 }] }
        ]} 
        onPress={onNext}
      >
        <StudyIcon 
          source={Arrow} 
          tintColor="#1F1F1F"
          width={22}
          height={22}
        />
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
    alignSelf: 'center',
    width: '100%',
    paddingVertical: 10,
  },
  button: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#F1BE4B',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F1BE4B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }),
  },
  textContainer: {
    minWidth: 80,
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
  },
  textCurrent: {
    fontWeight: '900',
  },
  textTotal: {
    fontWeight: '600',
    opacity: 0.5,
  },
})

