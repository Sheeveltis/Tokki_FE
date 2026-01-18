import React from 'react'
import { StyleSheet } from 'react-native'
import { useRouter } from 'solito/navigation'

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
  const router = useRouter()

  const handlePressSignUp = () => {
    if (onPressSignUp) {
      onPressSignUp()
      return
    }
    
    // Web: dùng Solito router
    router.push('/register')
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
