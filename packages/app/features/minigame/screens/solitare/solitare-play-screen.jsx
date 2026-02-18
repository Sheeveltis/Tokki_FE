import React from 'react'

import { SolitarePlayLayoutWeb } from '../../components/solitare/solitare-play/solitare-play-native/solitare-play-layout.web'

/**
 * Screen wrapper cho màn chơi solitaire (web).
 * Hiện tại chưa đọc thêm query param nào, chỉ render layout.
 */
export default function SolitarePlayScreen() {
  return <SolitarePlayLayoutWeb />
}


