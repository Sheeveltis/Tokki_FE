import React from 'react'
import { View, Text, StyleSheet, Pressable, Image, Platform } from 'react-native'
import { normalizeImageSource } from '../../api'
import CloseIcon from '../../../../../assets/icon/icon-mainflow/arrow.svg'

/**
 * TestProgressHeader: Header với progress và nút close
 */
export function TestProgressHeader({ answered, total, progress, onClose }) {
  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          {answered} / {total} câu đã trả lời
        </Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>
      {onClose && (
        <Pressable style={styles.closeButton} onPress={onClose}>
          <Image
            source={normalizeImageSource(CloseIcon)}
            style={styles.closeIcon}
            resizeMode="contain"
          />
        </Pressable>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressContainer: {
    flex: 1,
    gap: 8,
  },
  progressText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F1BE4B',
    fontFamily: 'Epilogue, sans-serif',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#F1BE4B',
    borderRadius: 4,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  closeIcon: {
    width: 20,
    height: 20,
    tintColor: '#1F1F1F',
  },
})

