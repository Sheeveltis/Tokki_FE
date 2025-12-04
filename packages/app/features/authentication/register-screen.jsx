import React from 'react'
import { StyleSheet } from 'react-native'

import { AuthLayout } from './components/auth-layout'
import { LoginHero } from './components/login-hero'
import { RegisterPanel } from './components/register-form'
import LoginHeroImage from '../../../assets/background1.png'
import LoginHeroImage2 from '../../../assets/logo.png'

/**
 * @param {{
 *   onPressLogin?: () => void
 * }} props
 */
export function RegisterScreen({ onPressLogin }) {
  const handlePressLogin = () => {
    onPressLogin?.()
  }

  return (
    <AuthLayout
      hero={<LoginHero backgroundSource={LoginHeroImage} overlaySource={LoginHeroImage2} />}
      panel={
        <RegisterPanel
          onPressLogin={handlePressLogin}
        />
      }
    />
  )
}

const styles = StyleSheet.create({})


