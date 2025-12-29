'use client'

import { useRouter } from 'next/navigation'
import { RegisterScreen } from '@tokki/app/features/authentication/register-screen'

export default function RegisterPage() {
  const router = useRouter()

  return (
    <RegisterScreen onPressLogin={() => router.push('/login')} />
  )
}

