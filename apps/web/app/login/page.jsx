'use client'

import { useRouter } from 'next/navigation'
import { LoginScreen } from 'app/features/authentication/login-screen'

export default function LoginPage() {
  const router = useRouter()

  return (
    <LoginScreen
      onPressSignUp={() => router.push('/register')}
    />
  )
}


