import React from 'react'
import { useSearchParams } from 'solito/navigation'
import WordleBoardWeb from '../../components/wordle/wordle-board/wordle-board.web'

/**
 * Web screen cho bảng xếp hạng các câu văn Wordle.
 * Nhận dailyWordleId từ query string và truyền xuống WordleBoardWeb.
 */
export function WordleBoardScreen() {
  const searchParams = useSearchParams()
  const dailyWordleId = searchParams?.get('dailyWordleId') || ''

  return <WordleBoardWeb dailyWordleId={dailyWordleId} />
}

export default WordleBoardScreen


