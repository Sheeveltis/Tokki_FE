import React from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'

import Carrot from '../../../../../assets/carrot.png'
import { BasicInfo } from './basic-info'
import { SecurityInfo } from './security-info'
import { UserAvatarCard } from './user-avt'

const normalizeImageSource = (src) => {
  if (!src) return null
  if (typeof src === 'number' || src.uri) return src
  if (typeof src === 'object' && src.src) return { uri: src.src }
  if (typeof src === 'string') return { uri: src }
  return src
}

export function UserInformation() {
  return (
    <View style={styles.container}>
      <Image source={normalizeImageSource(Carrot)} style={styles.carrot} resizeMode="contain" />

      <View style={styles.header}>
        <Text style={styles.title}>Thông tin người dùng</Text>
        <Text style={styles.subtitle}>
          Quản lí thông tin tài khoản của bạn, bạn có thể xem trạng thái tài khoản và đổi mật khẩu.
        </Text>
      </View>

      <View style={styles.topRow}>
        <View style={styles.avatarWrap}>
          <UserAvatarCard />
        </View>
        <View style={styles.basicWrap}>
          <BasicInfo />
        </View>
      </View>

      <View style={styles.securityWrap}>
        <SecurityInfo />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5F0DD',
    borderRadius: 30,
    paddingVertical: 24,
    paddingHorizontal: 20,
    gap: 18,
    position: 'relative',
  },
  carrot: {
    position: 'absolute',
    top: -50,
    right: -100,
    width: 200,
    height: 100,
    zIndex: 2,
    pointerEvents: 'none',
  },
  header: {
    gap: 6,
    paddingRight: 100,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    fontFamily: 'Epilogue, sans-serif',
    color: '#1C1C1C',
  },
  subtitle: {
    fontSize: 14,
    color: '#2C2C2C',
    fontFamily: 'Epilogue, sans-serif',
    lineHeight: 20,
  },
  topRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'stretch',
  },
  basicWrap: {
    flex: 1,
    minHeight: 200,
  },
  avatarWrap: {
    width: 220,
    minHeight: 200,
  },
  securityWrap: {
    width: '100%',
  },
})


