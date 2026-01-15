import React from 'react'
import { ForgotPasswordForm } from '../components/forgot-password/forgot-password-form'
import { ForgotPasswordLayoutWeb } from '../components/forgot-password/forgot-password-layout.web'
import { LoginHero } from '../components/login/login-hero'
import LoginHeroImage from '../../../../assets/background1.png'
import LoginHeroImage2 from '../../../../assets/loginBackground.png'

/**
 * ForgotPasswordScreen: màn tạo mật khẩu mới (web)
 */
export function ForgotPasswordScreen({ email, onSubmit }) {
  return (
    <ForgotPasswordLayoutWeb
      hero={<LoginHero backgroundSource={LoginHeroImage} overlaySource={LoginHeroImage2} />}
      form={<ForgotPasswordForm email={email} onSubmit={onSubmit} />}
    />
  )
}
