import React from 'react'
import { View, Text, StyleSheet, Pressable, Image } from 'react-native'
import { normalizeImageSource } from '../../api'
import ArrowIcon from '../../../../../assets/icon/icon-mainflow/arrow.svg'

/**
 * PaginationControls: Điều khiển phân trang
 */
export function PaginationControls({ currentIndex, total, onPrev, onNext }) {
  return (
    <View style={styles.container}>
      <Pressable style={styles.button} onPress={onPrev}>
        <Image
          source={normalizeImageSource(ArrowIcon)}
          style={[styles.icon, { transform: [{ scaleX: -1 }] }]}
          resizeMode="contain"
        />
      </Pressable>
      <Text style={styles.text}>
        {currentIndex + 1} / {total}
      </Text>
      <Pressable style={styles.button} onPress={onNext}>
        <Image source={normalizeImageSource(ArrowIcon)} style={styles.icon} resizeMode="contain" />
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '5%',
    alignSelf: 'center',
    width: '100%',
    maxWidth: 400,
  },
  button: {
    width: '20%',
    height: '50%',
    aspectRatio: 1,
    minWidth: 44,
    minHeight: 44,
    borderRadius: 16,
    backgroundColor: '#F1BE4B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 20,
    height: 20,
    tintColor: '#1F1F1F',
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
  },
})

