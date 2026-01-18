import React from 'react'
import { View, Text, Image, StyleSheet } from 'react-native'
import { Button } from '../../../../../components/button'
import BunnyImage from '../../../../../assets/bunny/15.png'

const normalizeImageSource = (src) => {
  if (!src) return null
  if (typeof src === 'number' || src.uri) return src
  if (typeof src === 'object' && src.src) {
    return { uri: src.src }
  }
  if (typeof src === 'string') {
    return { uri: src }
  }
  return src
}

export const ErrorView = ({ style }) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.card}>
        <Image source={normalizeImageSource(BunnyImage)} style={styles.illustration} resizeMode="contain" />

        <View style={styles.divider} />

        <View style={styles.textBlock}>
          <Text style={styles.title}>Oops!</Text>
          <Text style={styles.subtitle}>Đã xảy ra lỗi</Text>
        </View>
      </View>

      <View style={styles.buttonWrapper}>
        <Button
          title="Quay về trang chủ"
          onPress={() => {
            if (typeof window !== 'undefined') {
              window.location.href = '/'
            }
          }}
          fullWidth={false}
          style={styles.button}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    maxWidth: 700,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    alignSelf: 'center',
  },
  illustration: {
    width: 320,
    height: 280,
    flexShrink: 0,
  },
  divider: {
    width: 4,
    height: 200,
    backgroundColor: '#940000',
    borderRadius: 999,
    marginHorizontal: 32,
  },
  textBlock: {
    flex: 1,
    alignItems: 'flex-start',
    marginLeft: 4,
  },
  buttonWrapper: {
    marginTop: 28,
    width: '100%',
    alignItems: 'center',
  },
  button: {
    minWidth: 220,
  },
  title: {
    fontSize: 72,
    fontWeight: '800',
    fontFamily: 'Lexend, sans-serif',
    color: '#940000',
    lineHeight: 78,
    textAlign: 'left',
  },
  subtitle: {
    fontSize: 40,
    fontWeight: '700',
    fontFamily: 'Lexend, sans-serif',
    color: '#000000',
    lineHeight: 46,
    marginTop: 8,
    textAlign: 'left',
  },
})


