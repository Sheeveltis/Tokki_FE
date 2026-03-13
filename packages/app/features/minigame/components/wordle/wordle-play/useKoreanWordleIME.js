import { useCallback, useMemo, useRef, useState } from 'react'
import {
  createEmptyCell,
  decomposeSyllableChar,
  getCommittedWordFromCells,
  isHangulSyllable,
  isJamoConsonant,
  isJamoVowel,
  reduceRowState,
  renderCell,
} from './imeHangul'

// Hook quản lý IME cho 1 hàng Wordle (web + virtual keyboard)
export function useKoreanWordleIME({ wordLength, maxGuesses = 6, onSubmitRow }) {
  const initialCells = useMemo(() => Array.from({ length: wordLength }, () => createEmptyCell()), [wordLength])

  const [rowState, setRowState] = useState({
    cells: initialCells,
    activeColIndex: 0,
  })

  // Ref đồng bộ activeColIndex để tránh stale state khi IME/composition events đến rất nhanh
  const activeColIndexRef = useRef(0)

  const setRowStateWithRef = useCallback((updater) => {
    setRowState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      activeColIndexRef.current = next.activeColIndex
      return next
    })
  }, [])

  // Track độ dài chuỗi syllable đang composing để có thể clear range đúng khi update/end
  const composingLenRef = useRef(0)
  const composingBaseColRef = useRef(0)

  // grid text cho active row
  const gridCells = useMemo(() => rowState.cells.map((c) => renderCell(c)), [rowState.cells])

  const setActiveColIndex = useCallback(
    (index) => {
      let next = index
      if (next < 0) next = 0
      if (next > wordLength - 1) next = wordLength - 1
      setRowStateWithRef((prev) => ({ ...prev, activeColIndex: next }))
    },
    [setRowStateWithRef, wordLength]
  )

  const focusCell = useCallback(
    (col) => {
      setActiveColIndex(col)
    },
    [setActiveColIndex]
  )

  // Commit word (nếu hợp lệ) và gọi onSubmitRow
  const trySubmitRow = useCallback(() => {
    const word = getCommittedWordFromCells(rowState.cells)
    if (!word || word.length !== wordLength) return
    if (typeof onSubmitRow === 'function') {
      onSubmitRow(word)
    }
  }, [onSubmitRow, rowState.cells, wordLength])

  const handleVirtualKey = useCallback(
    (key) => {
      if (!key) return
  
      // ENTER xử lý submit riêng, KHÔNG đặt trong setState updater
      if (key === 'ENTER') {
        const word = getCommittedWordFromCells(rowState.cells)
        if (word && word.length === wordLength && typeof onSubmitRow === 'function') {
          onSubmitRow(word)
        }
        return
      }
  
      // control keys
      if (key === 'BACKSPACE' || key === 'ARROW_LEFT' || key === 'ARROW_RIGHT') {
        setRowStateWithRef((prev) => reduceRowState(prev, key, wordLength))
        return
      }
  
      // jamo input
      const ch = String(key)
      setRowStateWithRef((prev) => reduceRowState(prev, ch, wordLength))
    },
    [onSubmitRow, rowState.cells, setRowStateWithRef, wordLength]
  )

  // Bàn phím vật lý: chỉ nhận jamo, hangul syllable, backspace, enter, arrows
  const handlePhysicalKeyDown = useCallback(
    (e) => {
      if (!e) return

      // chặn các tổ hợp Ctrl / Meta để không phá shortcut trình duyệt
      if (e.ctrlKey || e.metaKey || e.altKey) {
        return
      }

      const key = e.key

      if (key === 'Backspace') {
        e.preventDefault()
        handleVirtualKey('BACKSPACE')
        return
      }

      if (key === 'Enter') {
        e.preventDefault()
        handleVirtualKey('ENTER')
        return
      }

      if (key === 'ArrowLeft') {
        e.preventDefault()
        handleVirtualKey('ARROW_LEFT')
        return
      }

      if (key === 'ArrowRight') {
        e.preventDefault()
        handleVirtualKey('ARROW_RIGHT')
        return
      }

      // Chỉ accept jamo / hangul, ignore còn lại
      if (isJamoConsonant(key) || isJamoVowel(key) || isHangulSyllable(key)) {
        e.preventDefault()
        // Nếu là syllable hoàn chỉnh (từ IME hệ thống) → decompose và ghi trực tiếp vào cell
        if (isHangulSyllable(key)) {
          setRowStateWithRef((prev) => {
            const cells = prev.cells.map((c) => ({ ...c }))
            let col = prev.activeColIndex
            const dec = decomposeSyllableChar(key)
            if (col >= 0 && col < wordLength) {
              cells[col] = {
                L: dec.L,
                V: dec.V,
                T: dec.T,
              }
              if (col < wordLength - 1) col += 1
            }
            return { cells, activeColIndex: col }
          })
        } else {
          handleVirtualKey(key)
        }
      }
    },
    [handleVirtualKey, setRowStateWithRef, wordLength]
  )

  // Nhận text từ hidden IME input (web). phase: 'update' (preview), 'end' (commit)
  // const handleIMEText = useCallback(
  //   (text, { phase, startCol } = {}) => {
  //     if (!text) return
  //     // Chỉ lấy hangul syllables (IME có thể đưa cả ký tự khác trong một số trường hợp)
  //     const syllables = Array.from(text).filter((ch) => isHangulSyllable(ch))
  //     if (syllables.length === 0) return
  //     const baseCol = typeof startCol === 'number' ? startCol : rowState.activeColIndex

  //     if (phase === 'update') {
  //       // Preview toàn bộ chuỗi composing theo baseCol (để IME biến "관" -> "과나" không bị overwrite block 1)
  //       const nextLen = Math.min(syllables.length, wordLength - baseCol)
  //       if (composingLenRef.current === 0) {
  //         setRowState((prev) => {
  //           const cur = prev.cells[baseCol]
  //           const hasSyllable = cur && cur.L && cur.V // đã có âm tiết
  //           if (hasSyllable && baseCol < wordLength - 1) {
  //             baseColRef.current = baseCol + 1
  //             return { ...prev, activeColIndex: baseCol + 1 }
  //           }
  //           return prev
  //         })
  //       }
  //       setRowState((prev) => {
  //         const cells = prev.cells.map((c) => ({ ...c }))
  //         const maxToClear = Math.min(wordLength - baseCol, Math.max(composingLenRef.current, nextLen))
  //         for (let i = 0; i < maxToClear; i++) {
  //           cells[baseCol + i] = createEmptyCell()
  //         }
  //         for (let i = 0; i < nextLen; i++) {
  //           const dec = decomposeSyllableChar(syllables[i])
  //           cells[baseCol + i] = { L: dec.L, V: dec.V, T: dec.T }
  //         }
  //         composingLenRef.current = nextLen
  //         const nextActive = Math.min(wordLength - 1, baseCol + Math.max(0, nextLen - 1))
  //         return { cells, activeColIndex: nextActive }
  //       })
  //       return
  //     }

  //     // phase === 'end' → commit hoàn toàn, có thể move cột
  //     setRowState((prev) => {
  //       const cells = prev.cells.map((c) => ({ ...c }))
  //       const nextLen = Math.min(syllables.length, wordLength - baseCol)
  //       const maxToClear = Math.min(wordLength - baseCol, Math.max(composingLenRef.current, nextLen))
  //       for (let i = 0; i < maxToClear; i++) {
  //         cells[baseCol + i] = createEmptyCell()
  //       }
  //       for (let i = 0; i < nextLen; i++) {
  //         const dec = decomposeSyllableChar(syllables[i])
  //         cells[baseCol + i] = { L: dec.L, V: dec.V, T: dec.T }
  //       }
  //       composingLenRef.current = 0
  //       // Sau commit: focus vào ô kế tiếp nếu còn, giống behavior trước đây
  //       const nextActive =
  //         nextLen === 0
  //           ? prev.activeColIndex
  //           : Math.min(wordLength - 1, baseCol + (nextLen < wordLength - baseCol ? nextLen : nextLen - 1))
  //       return { cells, activeColIndex: nextActive }
  //     })
  //   },
  //   [isHangulSyllable, rowState.activeColIndex, wordLength]
  // )
  const handleIMEText = useCallback(
    (text, { phase, startCol } = {}) => {
      if (!text) return
  
      // chỉ lấy hangul syllables
      const syllables = Array.from(text).filter((ch) => isHangulSyllable(ch))
      if (syllables.length === 0) return
  
      // baseCol của lượt composition: chỉ set 1 lần khi bắt đầu composing
      const initBase = typeof startCol === 'number' ? startCol : rowState.activeColIndex
  
      if (phase === 'update') {
        setRowStateWithRef((prev) => {
          const cells = prev.cells.map((c) => ({ ...c }))
  
          // nếu bắt đầu một lượt composing mới
          if (composingLenRef.current === 0) {
            composingBaseColRef.current =
              typeof startCol === 'number' ? startCol : prev.activeColIndex
          }
  
          const baseCol = composingBaseColRef.current
          const nextLen = Math.min(syllables.length, wordLength - baseCol)
  
          // clear range cũ đã preview
          const maxToClear = Math.min(
            wordLength - baseCol,
            Math.max(composingLenRef.current, nextLen)
          )
          for (let i = 0; i < maxToClear; i++) {
            cells[baseCol + i] = createEmptyCell()
          }
  
          // preview syllables
          for (let i = 0; i < nextLen; i++) {
            const dec = decomposeSyllableChar(syllables[i])
            cells[baseCol + i] = { L: dec.L, V: dec.V, T: dec.T }
          }
  
          composingLenRef.current = nextLen
          const nextActive = Math.min(wordLength - 1, baseCol + Math.max(0, nextLen - 1))
          return { cells, activeColIndex: nextActive }
        })
        return
      }
  
      // phase === 'end' -> commit và move cột
      setRowStateWithRef((prev) => {
        const cells = prev.cells.map((c) => ({ ...c }))
  
        const baseCol =
          composingLenRef.current > 0
            ? composingBaseColRef.current
            : (typeof startCol === 'number' ? startCol : prev.activeColIndex)
  
        const nextLen = Math.min(syllables.length, wordLength - baseCol)
  
        // clear range cũ đã preview
        const maxToClear = Math.min(
          wordLength - baseCol,
          Math.max(composingLenRef.current, nextLen)
        )
        for (let i = 0; i < maxToClear; i++) {
          cells[baseCol + i] = createEmptyCell()
        }
  
        // commit syllables
        for (let i = 0; i < nextLen; i++) {
          const dec = decomposeSyllableChar(syllables[i])
          cells[baseCol + i] = { L: dec.L, V: dec.V, T: dec.T }
        }
  
        composingLenRef.current = 0
  
        // ✅ move sang ô kế sau commit
        const nextActive = nextLen
          ? Math.min(wordLength - 1, baseCol + nextLen)
          : prev.activeColIndex
  
        return { cells, activeColIndex: nextActive }
      })
    },
    [rowState.activeColIndex, setRowStateWithRef, wordLength]
  )

  const resetRow = useCallback(() => {
    setRowStateWithRef({
      cells: Array.from({ length: wordLength }, () => createEmptyCell()),
      activeColIndex: 0,
    })
  }, [setRowStateWithRef, wordLength])

  const getCommittedWord = useCallback(() => {
    return getCommittedWordFromCells(rowState.cells)
  }, [rowState.cells])

  return {
    gridCells,
    activeColIndex: rowState.activeColIndex,
    activeColIndexRef,
    setActiveColIndex,
    focusCell,
    handlePhysicalKeyDown,
    handleVirtualKey,
    handleIMEText,
    resetRow,
    getCommittedWord,
  }
}

export default useKoreanWordleIME