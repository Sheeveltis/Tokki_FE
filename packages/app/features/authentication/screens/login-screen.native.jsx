// packages/app/features/authentication/screens/login-screen.native.jsx
import React from 'react'
import { StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'

import { AuthLayout } from '../components/login/auth-layout'
import { LoginHero } from '../components/login/login-hero'
import { LoginPanel } from '../components/login/login-form'
import LoginHeroImage from '../../../../assets/background1.png'
import LoginHeroImage2 from '../../../../assets/loginBackground.png'

/**
 * @param {{
 *   onPressSignUp?: () => void
 *   onPressGoogle?: () => void
 * }} props
 */
export function LoginScreen({ onPressSignUp, onPressGoogle }) {
  const navigation = useNavigation()

  const handlePressSignUp = () => {
    if (onPressSignUp) {
      onPressSignUp()
      return
    }
    try {
      navigation.navigate('register')
    } catch (error) {
      console.error('Navigation error:', error)
    }
  }

  const handlePressGoogle = () => {
    // TODO: tích hợp đăng nhập bằng Google
    onPressGoogle?.()
  }

  return (
    <AuthLayout
      hero={<LoginHero backgroundSource={LoginHeroImage} overlaySource={LoginHeroImage2} />}
      panel={
        <LoginPanel
          onPressSignUp={handlePressSignUp}
          onPressGoogle={handlePressGoogle}
        />
      }
    />
  )
}

const styles = StyleSheet.create({})
