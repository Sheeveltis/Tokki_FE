import React from 'react'
import { useSearchParams } from 'solito/navigation'

import { SolitarePlayWeb } from '../../components/solitare/solitare-play/solitare-play-web/solitare-play-web'

/**
 * Screen wrapper cho màn chơi solitaire (web).
 * Đọc level từ URL query param và truyền xuống game play component.
 */
export default function SolitarePlayScreen({onFinish}) {
  const searchParams = useSearchParams()
  const level = searchParams?.get('level') || 'medium'

  console.log('[PlayScreen] level from URL =', level)

  return <SolitarePlayWeb level={level} onFinish={onFinish}/>
}