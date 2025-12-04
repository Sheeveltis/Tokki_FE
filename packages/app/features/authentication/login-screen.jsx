import React from 'react'
import { StyleSheet } from 'react-native'

import { AuthLayout } from './components/auth-layout'
import { LoginHero } from './components/login-hero'
import { LoginPanel } from './components/login-form'
import LoginHeroImage from '../../../assets/background1.png'
import LoginHeroImage2 from '../../../assets/logo.png'

/**
 * @param {{
 *   onPressSignUp?: () => void
 *   onPressGoogle?: () => void
 * }} props
 */
export function LoginScreen({ onPressSignUp, onPressGoogle }) {
  const handlePressGoogle = () => {
    // TODO: tích hợp đăng nhập bằng Google
    onPressGoogle?.()
  }

  return (
    <AuthLayout
      hero={<LoginHero backgroundSource={LoginHeroImage} overlaySource={LoginHeroImage2} />}
      panel={
        <LoginPanel
          onPressSignUp={onPressSignUp}
          onPressGoogle={handlePressGoogle}
        />
      }
    />
  )
}

const styles = StyleSheet.create({})

