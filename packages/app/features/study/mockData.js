import ChatboxIcon from 'assets/icon/icon-mainflow/chatbox.svg'
import AIIcon from 'assets/icon/icon-mainflow/ai.svg'
import FolderIcon from 'assets/icon/icon-mainflow/folder.svg'
import GameIcon from 'assets/icon/icon-mainflow/game.svg'

export { FLASHCARD_TOPICS, FLASHCARDS } from '../vocabulary/mockData'

/**
 * Mock data cho chữ cái Hàn Quốc (Hangul)
 */
export const ALPHABET_LETTERS = [
  // Phụ âm cơ bản
  { word: 'ㄱ', meaning: 'giyeok (g/k)', pronunciation: 'g/k' },
  { word: 'ㄴ', meaning: 'nieun (n)', pronunciation: 'n' },
  { word: 'ㄷ', meaning: 'digeut (d/t)', pronunciation: 'd/t' },
  { word: 'ㄹ', meaning: 'rieul (r/l)', pronunciation: 'r/l' },
  { word: 'ㅁ', meaning: 'mieum (m)', pronunciation: 'm' },
  { word: 'ㅂ', meaning: 'bieup (b/p)', pronunciation: 'b/p' },
  { word: 'ㅅ', meaning: 'siot (s)', pronunciation: 's' },
  { word: 'ㅇ', meaning: 'ieung (ng/không phát âm)', pronunciation: 'ng/-' },
  { word: 'ㅈ', meaning: 'jieut (j/ch)', pronunciation: 'j/ch' },
  { word: 'ㅊ', meaning: 'chieut (ch)', pronunciation: 'ch' },
  { word: 'ㅋ', meaning: 'kieuk (k)', pronunciation: 'k' },
  { word: 'ㅌ', meaning: 'tieut (t)', pronunciation: 't' },
  { word: 'ㅍ', meaning: 'pieup (p)', pronunciation: 'p' },
  { word: 'ㅎ', meaning: 'hieut (h)', pronunciation: 'h' },
  // Nguyên âm cơ bản
  { word: 'ㅏ', meaning: 'a', pronunciation: 'a' },
  { word: 'ㅓ', meaning: 'eo', pronunciation: 'eo' },
  { word: 'ㅗ', meaning: 'o', pronunciation: 'o' },
  { word: 'ㅜ', meaning: 'u', pronunciation: 'u' },
  { word: 'ㅡ', meaning: 'eu', pronunciation: 'eu' },
  { word: 'ㅣ', meaning: 'i', pronunciation: 'i' },
  { word: 'ㅑ', meaning: 'ya', pronunciation: 'ya' },
  { word: 'ㅕ', meaning: 'yeo', pronunciation: 'yeo' },
  { word: 'ㅛ', meaning: 'yo', pronunciation: 'yo' },
  { word: 'ㅠ', meaning: 'yu', pronunciation: 'yu' },
  { word: 'ㅐ', meaning: 'ae', pronunciation: 'ae' },
  { word: 'ㅔ', meaning: 'e', pronunciation: 'e' },
  { word: 'ㅚ', meaning: 'oe', pronunciation: 'oe' },
  { word: 'ㅟ', meaning: 'wi', pronunciation: 'wi' },
  { word: 'ㅢ', meaning: 'ui', pronunciation: 'ui' },
]

/**
 * Mock data cho skill modules
 */
export const SKILL_MODULES = [
  {
    id: 'speaking',
    title: 'NÓI',
    icon: ChatboxIcon,
    items: [
      { label: 'Luyện nói với A.I', icon: AIIcon },
    ],
  },
  {
    id: 'vocabulary',
    title: 'TỪ VỰNG',
    icon: FolderIcon,
    items: [
      { label: 'Chủ đề', icon: FolderIcon },
      { label: 'Minigame', icon: GameIcon },
    ],
  },
]

