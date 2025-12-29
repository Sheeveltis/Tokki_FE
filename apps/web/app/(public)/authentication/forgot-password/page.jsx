'use client'

import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ForgotPasswordScreen } from '@tokki/app/features/authentication/forgot-password/forgot-password-screen'
import { resetForgotPassword } from '@tokki/app/features/authentication/forgot-password/api/api'
import { showApiNotification } from '@tokki/app/features/authentication/helpers/notification'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams?.get('email') || ''

  const handleSubmit = async ({ email: formEmail, newPassword, confirmPassword }) => {
    try {
      const response = await resetForgotPassword({
        email: formEmail || email,
        newPassword,
        confirmPassword,
      })

      if (response) {
        showApiNotification({
          ...response,
          message: 'Đặt lại mật khẩu thành công',
          isSuccess: true,
        })
        // Quay lại trang đăng nhập
        router.push('/login')
      }
    } catch (error) {
      showApiNotification(
        error || {
          isSuccess: false,
          message: error?.message || 'Không thể đặt lại mật khẩu',
        }
      )
    }
  }

  return <ForgotPasswordScreen email={email} onSubmit={handleSubmit} />
}

