import React from 'react'
import { StyleSheet } from 'react-native'
import { useRouter } from 'solito/navigation'

import { AuthLayout } from './components/auth-layout'
import { LoginHero } from './components/login-hero'
import { RegisterPanel } from './components/register-form'
import LoginHeroImage from '../../../assets/background1.png'
import LoginHeroImage2 from '../../../assets/registerBackground.png'

/**
 * @param {{
 *   onPressLogin?: () => void
 * }} props
 */
export function RegisterScreen({ onPressLogin }) {
  const router = useRouter()

  const handlePressLogin = () => {
    if (onPressLogin) {
      onPressLogin()
      return
    }
    
    // Web: dùng Solito router
    router.push('/login')
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

