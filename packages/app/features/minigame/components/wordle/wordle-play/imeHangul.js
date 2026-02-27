// Pure JS Hangul IME helpers for Wordle (2-set style, 1 syllable per cell)

// Unicode base constants
const S_BASE = 0xac00
const L_BASE = 0x1100
const V_BASE = 0x1161
const T_BASE = 0x11a7

// Compatibility jamo lists used for input / rendering
// 초성 19
export const LEADS = [
  'ㄱ',
  'ㄲ',
  'ㄴ',
  'ㄷ',
  'ㄸ',
  'ㄹ',
  'ㅁ',
  'ㅂ',
  'ㅃ',
  'ㅅ',
  'ㅆ',
  'ㅇ',
  'ㅈ',
  'ㅉ',
  'ㅊ',
  'ㅋ',
  'ㅌ',
  'ㅍ',
  'ㅎ',
]

// 중성 21
export const VOWELS = [
  'ㅏ',
  'ㅐ',
  'ㅑ',
  'ㅒ',
  'ㅓ',
  'ㅔ',
  'ㅕ',
  'ㅖ',
  'ㅗ',
  'ㅘ',
  'ㅙ',
  'ㅚ',
  'ㅛ',
  'ㅜ',
  'ㅝ',
  'ㅞ',
  'ㅟ',
  'ㅠ',
  'ㅡ',
  'ㅢ',
  'ㅣ',
]

// 종성 28 (index 0 = no final)
export const TAILS = [
  '',
  'ㄱ',
  'ㄲ',
  'ㄳ',
  'ㄴ',
  'ㄵ',
  'ㄶ',
  'ㄷ',
  'ㄹ',
  'ㄺ',
  'ㄻ',
  'ㄼ',
  'ㄽ',
  'ㄾ',
  'ㄿ',
  'ㅀ',
  'ㅁ',
  'ㅂ',
  'ㅄ',
  'ㅅ',
  'ㅆ',
  'ㅇ',
  'ㅈ',
  'ㅊ',
  'ㅋ',
  'ㅌ',
  'ㅍ',
  'ㅎ',
]

// Vowel combine map (base, input) -> combined
const VOWEL_COMBINE = {
  'ㅗㅏ': 'ㅘ',
  'ㅗㅐ': 'ㅙ',
  'ㅗㅣ': 'ㅚ',
  'ㅜㅓ': 'ㅝ',
  'ㅜㅔ': 'ㅞ',
  'ㅜㅣ': 'ㅟ',
  'ㅡㅣ': 'ㅢ',
  // optional
  'ㅏㅣ': 'ㅐ',
  'ㅓㅣ': 'ㅔ',
  'ㅑㅣ': 'ㅒ',
  'ㅕㅣ': 'ㅖ',
}

// Reverse for backspace (combined -> base)
const VOWEL_SPLIT = {
  'ㅘ': 'ㅗ',
  'ㅙ': 'ㅗ',
  'ㅚ': 'ㅗ',
  'ㅝ': 'ㅜ',
  'ㅞ': 'ㅜ',
  'ㅟ': 'ㅜ',
  'ㅢ': 'ㅡ',
}

// Final cluster combine and split
const FINAL_CLUSTER_COMBINE = {
  'ㄱㅅ': 'ㄳ',
  'ㄴㅈ': 'ㄵ',
  'ㄴㅎ': 'ㄶ',
  'ㄹㄱ': 'ㄺ',
  'ㄹㅁ': 'ㄻ',
  'ㄹㅂ': 'ㄼ',
  'ㄹㅅ': 'ㄽ',
  'ㄹㅌ': 'ㄾ',
  'ㄹㅍ': 'ㄿ',
  'ㄹㅎ': 'ㅀ',
  'ㅂㅅ': 'ㅄ',
}

const FINAL_CLUSTER_SPLIT = {
  'ㄳ': ['ㄱ', 'ㅅ'],
  'ㄵ': ['ㄴ', 'ㅈ'],
  'ㄶ': ['ㄴ', 'ㅎ'],
  'ㄺ': ['ㄹ', 'ㄱ'],
  'ㄻ': ['ㄹ', 'ㅁ'],
  'ㄼ': ['ㄹ', 'ㅂ'],
  'ㄽ': ['ㄹ', 'ㅅ'],
  'ㄾ': ['ㄹ', 'ㅌ'],
  'ㄿ': ['ㄹ', 'ㅍ'],
  'ㅀ': ['ㄹ', 'ㅎ'],
  'ㅄ': ['ㅂ', 'ㅅ'],
}

// Double initial (쌍자음)
const DOUBLE_INITIAL_COMBINE = {
  'ㄱㄱ': 'ㄲ',
  'ㄷㄷ': 'ㄸ',
  'ㅂㅂ': 'ㅃ',
  'ㅅㅅ': 'ㅆ',
  'ㅈㅈ': 'ㅉ',
}

export function isJamoConsonant(ch) {
  return 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ'.includes(ch)
}

export function isJamoVowel(ch) {
  return 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ'.includes(ch)
}

export function isHangulSyllable(ch) {
  if (!ch || ch.length !== 1) return false
  const code = ch.charCodeAt(0)
  return code >= 0xac00 && code <= 0xd7a3
}

export function decomposeSyllableChar(ch) {
  if (!isHangulSyllable(ch)) return { L: null, V: null, T: null }
  const code = ch.charCodeAt(0) - S_BASE
  const lIndex = Math.floor(code / (21 * 28))
  const vIndex = Math.floor((code % (21 * 28)) / 28)
  const tIndex = code % 28

  const L = LEADS[lIndex] || null
  const V = VOWELS[vIndex] || null
  const T = TAILS[tIndex] || null

  return { L, V, T: T || null }
}

export function composeSyllableFromJamo(L, V, T) {
  if (!L || !V) return ''
  const lIndex = LEADS.indexOf(L)
  const vIndex = VOWELS.indexOf(V)
  const tIndex = T ? TAILS.indexOf(T) : 0
  if (lIndex < 0 || vIndex < 0 || tIndex < 0) return ''
  const code = S_BASE + lIndex * 21 * 28 + vIndex * 28 + tIndex
  return String.fromCharCode(code)
}

export function createEmptyCell() {
  return { L: null, V: null, T: null }
}

// Render cell to display string for grid
export function renderCell(cell) {
  const { L, V, T } = cell || {}
  if (L && V) {
    const syllable = composeSyllableFromJamo(L, V, T)
    if (syllable) return syllable
  }
  // partial or invalid → show raw jamo joined
  return [L, V, T].filter(Boolean).join('')
}

// Apply a vowel to current cell, may mutate cell and/or request move to next
function applyVowelToCell(cell, vowel) {
  const next = { ...cell }

  // no initial → implicit ㅇ
  if (!next.L && !next.V && !next.T) {
    next.L = 'ㅇ'
    next.V = vowel
    return { cell: next, moveToNext: false, carryToNext: null }
  }

  // L only
  if (next.L && !next.V && !next.T) {
    next.V = vowel
    return { cell: next, moveToNext: false, carryToNext: null }
  }

  // L + V (no T yet)
  if (next.L && next.V && !next.T) {
    const key = next.V + vowel
    const combined = VOWEL_COMBINE[key]
    if (combined) {
      next.V = combined
      return { cell: next, moveToNext: false, carryToNext: null }
    }
    // cannot combine → push to next syllable
    return {
      cell: next,
      moveToNext: true,
      carryToNext: { L: 'ㅇ', V: vowel, T: null },
    }
  }

  // L + V + T  (vowel will start next syllable, moving T)
  if (next.L && next.V && next.T) {
    const cluster = FINAL_CLUSTER_SPLIT[next.T]
    if (cluster) {
      // keep first part as final, second part moves as initial
      const [first, second] = cluster
      next.T = first
      return {
        cell: next,
        moveToNext: true,
        carryToNext: { L: second, V: vowel, T: null },
      }
    }
    // single final: move it to next cell initial
    const moving = next.T
    next.T = null
    return {
      cell: next,
      moveToNext: true,
      carryToNext: { L: moving, V: vowel, T: null },
    }
  }

  return { cell: next, moveToNext: false, carryToNext: null }
}

// Apply consonant to current cell
function applyConsonantToCell(cell, consonant) {
  const next = { ...cell }

  // empty → become initial
  if (!next.L && !next.V && !next.T) {
    next.L = consonant
    return { cell: next, moveToNext: false, carryToNext: null }
  }

  // L only → try double initial, else start new syllable
  if (next.L && !next.V && !next.T) {
    const key = next.L + consonant
    const combined = DOUBLE_INITIAL_COMBINE[key]
    if (combined) {
      next.L = combined
      return { cell: next, moveToNext: false, carryToNext: null }
    }
    // cannot double → move to next as new initial
    return {
      cell: next,
      moveToNext: true,
      carryToNext: { L: consonant, V: null, T: null },
    }
  }

  // L + V (no T yet) → consonant becomes final
  if (next.L && next.V && !next.T) {
    next.T = consonant
    // auto-advance sau khi đã có 받침 để người chơi nhập âm tiết tiếp theo nhanh hơn
    // (các case tạo final cluster / kéo 받침 sang ô sau sẽ được handle ở reduceRowState)
    return { cell: next, moveToNext: true, carryToNext: null }
  }

  // L + V + T → try to build final cluster, else push to next syllable as new L
  if (next.L && next.V && next.T) {
    const key = next.T + consonant
    const combined = FINAL_CLUSTER_COMBINE[key]
    if (combined) {
      next.T = combined
      // Nếu tạo được final cluster thì cũng auto-advance
      return { cell: next, moveToNext: true, carryToNext: null }
    }
    // cannot combine into T cluster → move to next cell as initial
    return {
      cell: next,
      moveToNext: true,
      carryToNext: { L: consonant, V: null, T: null },
    }
  }

  return { cell: next, moveToNext: false, carryToNext: null }
}

// Backspace on single cell, returns updated cell + info whether it became empty
export function backspaceCell(cell) {
  const next = { ...(cell || {}) }

  // T cluster → drop second part only
  if (next.T && FINAL_CLUSTER_SPLIT[next.T]) {
    const [first] = FINAL_CLUSTER_SPLIT[next.T]
    next.T = first
    return { cell: next, emptied: false }
  }

  // T single → remove
  if (next.T) {
    next.T = null
    return { cell: next, emptied: !next.L && !next.V && !next.T }
  }

  // V diphthong → split to base vowel
  if (next.V && VOWEL_SPLIT[next.V]) {
    next.V = VOWEL_SPLIT[next.V]
    return { cell: next, emptied: false }
  }

  // V single → remove
  if (next.V) {
    next.V = null
    return { cell: next, emptied: !next.L && !next.V && !next.T }
  }

  // only L → remove
  if (next.L) {
    next.L = null
    return { cell: next, emptied: true }
  }

  return { cell: next, emptied: true }
}

// Row level state reducer
export function reduceRowState(state, input, wordLength) {
  const { cells, activeColIndex } = state
  const nextCells = cells.map((c) => ({ ...c }))
  let col = activeColIndex

  const clampCol = () => {
    if (col < 0) col = 0
    if (col > wordLength - 1) col = wordLength - 1
  }

  if (input === 'ARROW_LEFT') {
    col = Math.max(0, col - 1)
    return { cells: nextCells, activeColIndex: col }
  }
  if (input === 'ARROW_RIGHT') {
    col = Math.min(wordLength - 1, col + 1)
    return { cells: nextCells, activeColIndex: col }
  }

  if (input === 'BACKSPACE') {
    // if current cell has something → backspace here
    let { cell, emptied } = backspaceCell(nextCells[col])
    nextCells[col] = cell

    if (!emptied) {
      return { cells: nextCells, activeColIndex: col }
    }

    // current became empty → move left and continue if possible
    if (col > 0) {
      col -= 1
      const res = backspaceCell(nextCells[col])
      nextCells[col] = res.cell
    }
    clampCol()
    return { cells: nextCells, activeColIndex: col }
  }

  if (input === 'ENTER') {
    // only IME-level enter handling (submit happens in hook)
    // if not at last col → move next
    if (col < wordLength - 1) {
      col += 1
    }
    clampCol()
    return { cells: nextCells, activeColIndex: col }
  }

  // jamo input
  const ch = input
  if (!isJamoConsonant(ch) && !isJamoVowel(ch)) {
    // ignore anything not a jamo
    return { cells: nextCells, activeColIndex: col }
  }

  let current = nextCells[col]
  if (!current) current = nextCells[col] = createEmptyCell()

  // Nếu cursor đang ở ô mới (do auto-advance) nhưng ô này còn trống,
  // thì cho phép "gộp ngược" / "kéo ngược" với ô trước để giữ đúng IME:
  // - phụ âm: có thể là phần 2 của final cluster (ㄳ/ㅄ/...) → gộp vào ô trước
  // - nguyên âm: kéo 받침 của ô trước sang làm 초성 của ô hiện tại
  const isCurrentEmpty = !current.L && !current.V && !current.T
  const prevCol = col - 1
  const prev = prevCol >= 0 ? nextCells[prevCol] : null
  const prevHasSyllable = !!(prev && prev.L && prev.V)

  // Case A: nhập phụ âm để tạo final cluster cho ô trước (vd: 값 = ㄱㅏㅂ + ㅅ)
  if (isCurrentEmpty && prevHasSyllable && prev?.T && isJamoConsonant(ch)) {
    const backKey = prev.T + ch
    const backCombined = FINAL_CLUSTER_COMBINE[backKey]
    if (backCombined) {
      nextCells[prevCol] = { ...prev, T: backCombined }
      return { cells: nextCells, activeColIndex: col }
    }
  }

  // Case B: nhập nguyên âm sau khi đã có 받침 ở ô trước → kéo 받침 sang ô hiện tại làm 초성
  if (isCurrentEmpty && prevHasSyllable && prev?.T && isJamoVowel(ch)) {
    const prevCopy = { ...prev }
    const curCopy = { ...current }

    const cluster = FINAL_CLUSTER_SPLIT[prevCopy.T]
    if (cluster) {
      const [first, second] = cluster
      prevCopy.T = first
      curCopy.L = second
    } else {
      const moving = prevCopy.T
      prevCopy.T = null
      curCopy.L = moving
    }

    nextCells[prevCol] = prevCopy
    nextCells[col] = curCopy
    current = nextCells[col]
  }

  let result
  if (isJamoVowel(ch)) {
    result = applyVowelToCell(current, ch)
  } else {
    result = applyConsonantToCell(current, ch)
  }

  nextCells[col] = result.cell

  if (result.moveToNext && col < wordLength - 1) {
    col += 1
    clampCol()
    if (result.carryToNext) {
      nextCells[col] = {
        ...(nextCells[col] || createEmptyCell()),
        ...result.carryToNext,
      }
    }
  }

  return { cells: nextCells, activeColIndex: col }
}

// Compose committed word from cells; returns '' if any cell is incomplete
export function getCommittedWordFromCells(cells) {
  let word = ''
  for (const cell of cells) {
    const { L, V, T } = cell || {}
    if (!L || !V) {
      return ''
    }
    const ch = composeSyllableFromJamo(L, V, T)
    if (!ch) return ''
    word += ch
  }
  return word
}

