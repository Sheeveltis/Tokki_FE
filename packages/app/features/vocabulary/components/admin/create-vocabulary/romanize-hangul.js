const INITIALS = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
]

const VOWELS = [
  'ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ',
  'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ',
]

const FINALS = [
  '', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ',
  'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ',
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
]

const INITIAL_ROMAN = {
  'ㄱ': 'g',
  'ㄲ': 'kk',
  'ㄴ': 'n',
  'ㄷ': 'd',
  'ㄸ': 'tt',
  'ㄹ': 'r',
  'ㅁ': 'm',
  'ㅂ': 'b',
  'ㅃ': 'pp',
  'ㅅ': 's',
  'ㅆ': 'ss',
  'ㅇ': '',
  'ㅈ': 'j',
  'ㅉ': 'jj',
  'ㅊ': 'ch',
  'ㅋ': 'k',
  'ㅌ': 't',
  'ㅍ': 'p',
  'ㅎ': 'h',
}

const VOWEL_ROMAN = {
  'ㅏ': 'a',
  'ㅐ': 'ae',
  'ㅑ': 'ya',
  'ㅒ': 'yae',
  'ㅓ': 'eo',
  'ㅔ': 'e',
  'ㅕ': 'yeo',
  'ㅖ': 'ye',
  'ㅗ': 'o',
  'ㅘ': 'wa',
  'ㅙ': 'wae',
  'ㅚ': 'oe',
  'ㅛ': 'yo',
  'ㅜ': 'u',
  'ㅝ': 'wo',
  'ㅞ': 'we',
  'ㅟ': 'wi',
  'ㅠ': 'yu',
  'ㅡ': 'eu',
  'ㅢ': 'ui',
  'ㅣ': 'i',
}

const FINAL_ROMAN = {
  '': '',
  'ㄱ': 'k',
  'ㄲ': 'k',
  'ㄳ': 'k',
  'ㄴ': 'n',
  'ㄵ': 'n',
  'ㄶ': 'n',
  'ㄷ': 't',
  'ㄹ': 'l',
  'ㄺ': 'k',
  'ㄻ': 'm',
  'ㄼ': 'l',
  'ㄽ': 'l',
  'ㄾ': 'l',
  'ㄿ': 'p',
  'ㅀ': 'l',
  'ㅁ': 'm',
  'ㅂ': 'p',
  'ㅄ': 'p',
  'ㅅ': 't',
  'ㅆ': 't',
  'ㅇ': 'ng',
  'ㅈ': 't',
  'ㅊ': 't',
  'ㅋ': 'k',
  'ㅌ': 't',
  'ㅍ': 'p',
  'ㅎ': 't',
}

const isHangulSyllable = (ch) => {
  if (!ch) return false
  const code = ch.charCodeAt(0)
  return code >= 0xac00 && code <= 0xd7a3
}

export const romanizeHangul = (text = '') => {
  let result = ''
  let prevWasSyllable = false

  for (const ch of text) {
    if (isHangulSyllable(ch)) {
      const code = ch.charCodeAt(0) - 0xac00
      const initialIndex = Math.floor(code / 588)
      const vowelIndex = Math.floor((code % 588) / 28)
      const finalIndex = code % 28
      const initial = INITIALS[initialIndex]
      const vowel = VOWELS[vowelIndex]
      const final = FINALS[finalIndex]
      const romanized = `${INITIAL_ROMAN[initial] || ''}${VOWEL_ROMAN[vowel] || ''}${FINAL_ROMAN[final] || ''}`

      if (prevWasSyllable && result.length > 0 && !result.endsWith('-')) {
        result += '-'
      }

      result += romanized
      prevWasSyllable = true
    } else {
      result += ch
      prevWasSyllable = false
    }
  }

  return result
}
