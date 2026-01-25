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
 * }} props
 */
export function LoginScreen({ onPressSignUp }) {
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

  return (
    <AuthLayout
      hero={<LoginHero backgroundSource={LoginHeroImage} overlaySource={LoginHeroImage2} />}
      panel={
        <LoginPanel
          onPressSignUp={handlePressSignUp}
        />
      }
    />
  )
}

const styles = StyleSheet.create({})
