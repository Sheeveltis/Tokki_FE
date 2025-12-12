'use client'

import { useRouter } from 'next/navigation'
import { HomeScreen } from 'app/features/home/screen'

export default function HomePage() {
  const router = useRouter()

  return (
    <HomeScreen
    />
  )
}

