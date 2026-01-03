'use client'

import React from 'react'
import { ImageBackground, ScrollView, StyleSheet, View } from 'react-native'
import { useRouter } from 'solito/navigation'
import { Navbar } from '../../../../../components/navbar'
import { UserDashboard } from '../../components/user-dashboard'
import { UserInformation } from './components/user-information'
import BgPattern from '../../../../../assets/background2.png'

const normalizeImageSource = (src) => {
  if (!src) return null
  if (typeof src === 'number' || src.uri) return src
  if (typeof src === 'object' && src.src) return { uri: src.src }
  if (typeof src === 'string') return { uri: src }
  return src
}

export function ProfileScreen() {
  const router = useRouter()

  const handleActionPress = (key) => {
    if (key === 'profile') {
      router.push('/user-profile')
    } else if (key === 'history') {
      router.push('/user-profile?tab=history')
    } else if (key === 'roadmap') {
      // Handle roadmap navigation
      router.push('/roadmap')
    } else if (key === 'logout') {
      // Handle logout
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
      }
      router.push('/login')
    }
  }

  return (
    <View style={styles.root}>
      <Navbar />

      <ImageBackground
        source={normalizeImageSource(BgPattern)}
        style={styles.bg}
        resizeMode="cover"
        imageStyle={styles.bgImage}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.row}>
            <UserDashboard onActionPress={handleActionPress} initialActive="profile" />
            <View style={styles.spacer} />
            <UserInformation />
          </View>
        </ScrollView>
      </ImageBackground>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
  },
  bg: {
    flex: 1,
  },
  bgImage: {
    opacity: 0.3,
  },
  content: {
    paddingVertical: 48,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  row: {
    width: '100%',
    maxWidth: 1280,
    flexDirection: 'row',
    gap: 24,
    alignItems: 'flex-start',
  },
  spacer: {
    width: 12,
  },
})

export default ProfileScreen

