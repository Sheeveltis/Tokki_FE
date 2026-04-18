import ChatboxIcon from 'assets/icon/icon-mainflow/chatbox.svg'
import AIIcon from 'assets/icon/icon-mainflow/ai.svg'
import FolderIcon from 'assets/icon/icon-mainflow/folder.svg'
import GameIcon from 'assets/icon/icon-mainflow/game.svg'
import MicroIcon from 'assets/icon/icon-mainflow/micro.svg'
import BulbIcon from 'assets/icon/icon-mainflow/bulb.svg'
import BookIcon from 'assets/icon/icon-mainflow/bookandsky.svg'
import GrammarIcon from 'assets/icon/icon-mainflow/grammar.svg'
import WriteIcon from 'assets/icon/icon-mainflow/write.svg'
import LocateIcon from 'assets/icon/icon-mainflow/locate.svg'
import StarIcon from 'assets/icon/icon-mainflow/star.svg'
import AppFolderIcon from 'assets/icon/navigate-app/folder.svg'
import GameCardIcon from 'assets/icon/icon-mainflow/game-card.svg'
import NotebookIcon from 'assets/icon/icon-roadmap/notebook-1-svgrepo-com.svg'
import Mic2Icon from 'assets/icon/icon-mainflow/microphone-2-svgrepo-com.svg'
import LightbulbIcon from 'assets/icon/icon-roadmap/lightbulb-minimalistic-svgrepo-com.svg'
import RoadmapIcon from 'assets/icon/navigate-app/roadmap.svg'
import { ReadOutlined, FormOutlined } from '@ant-design/icons'

export { FLASHCARD_TOPICS, FLASHCARDS } from '../vocabulary/mockData'

/**
 * Mock data cho chữ cái Hàn Quốc (Hangul)
 */
export const ALPHABET_LETTERS = [
  // NGUYÊN ÂM (Vowels)
  // Row 1
  { word: 'ㅏ', meaning: 'a', pronunciation: 'a', type: 'vowel', row: 1 },
  { word: 'ㅑ', meaning: 'ya', pronunciation: 'ya', type: 'vowel', row: 1 },
  { word: 'ㅓ', meaning: 'eo', pronunciation: 'o', type: 'vowel', row: 1 },
  { word: 'ㅕ', meaning: 'yeo', pronunciation: 'yo', type: 'vowel', row: 1 },
  { word: 'ㅗ', meaning: 'o', pronunciation: 'ô', type: 'vowel', row: 1 },
  { word: 'ㅛ', meaning: 'yo', pronunciation: 'yô', type: 'vowel', row: 1 },
  { word: 'ㅜ', meaning: 'u', pronunciation: 'u', type: 'vowel', row: 1 },
  { word: 'ㅠ', meaning: 'yu', pronunciation: 'yu', type: 'vowel', row: 1 },
  { word: 'ㅡ', meaning: 'eu', pronunciation: 'ư', type: 'vowel', row: 1 },
  { word: 'ㅣ', meaning: 'i', pronunciation: 'i', type: 'vowel', row: 1 },
  // Row 2
  { word: 'ㅐ', meaning: 'ae', pronunciation: 'e', type: 'vowel', row: 2 },
  { word: 'ㅒ', meaning: 'yae', pronunciation: 'ye', type: 'vowel', row: 2 },
  { word: 'ㅔ', meaning: 'e', pronunciation: 'ê', type: 'vowel', row: 2 },
  { word: 'ㅖ', pronunciation: 'yê', meaning: 'ye', type: 'vowel', row: 2 },
  { word: 'ㅘ', pronunciation: 'oa', meaning: 'wa', type: 'vowel', row: 2 },
  { word: 'ㅙ', pronunciation: 'oe', meaning: 'wae', type: 'vowel', row: 2 },
  { word: 'ㅚ', pronunciation: 'uê', meaning: 'oe', type: 'vowel', row: 2 },
  { word: 'ㅝ', pronunciation: 'uơ', meaning: 'wo', type: 'vowel', row: 2 },
  { word: 'ㅞ', pronunciation: 'uê', meaning: 'we', type: 'vowel', row: 2 },
  { word: 'ㅟ', pronunciation: 'uy', meaning: 'wi', type: 'vowel', row: 2 },
  { word: 'ㅢ', pronunciation: 'ưi', meaning: 'ui', type: 'vowel', row: 2 },

  // PHỤ ÂM (Consonants)
  // Row 1
  { word: 'ㄱ', pronunciation: 'k/g', meaning: 'giyeok (g/k)', type: 'consonant', row: 1 },
  { word: 'ㄴ', pronunciation: 'n', meaning: 'nieun (n)', type: 'consonant', row: 1 },
  { word: 'ㄷ', pronunciation: 't/d', meaning: 'digeut (d/t)', type: 'consonant', row: 1 },
  { word: 'ㄹ', pronunciation: 'r/l', meaning: 'rieul (r/l)', type: 'consonant', row: 1 },
  { word: 'ㅁ', pronunciation: 'm', meaning: 'mieum (m)', type: 'consonant', row: 1 },
  { word: 'ㅂ', pronunciation: 'b', meaning: 'bieup (b/p)', type: 'consonant', row: 1 },
  { word: 'ㅅ', pronunciation: 's', meaning: 'siot (s)', type: 'consonant', row: 1 },
  { word: 'ㅇ', pronunciation: 'ng', meaning: 'ieung (ng)', type: 'consonant', row: 1 },
  { word: 'ㅈ', pronunciation: 'j', meaning: 'jieut (j/ch)', type: 'consonant', row: 1 },
  { word: 'ㅊ', pronunciation: 'ch', meaning: 'chieut (ch)', type: 'consonant', row: 1 },
  { word: 'ㅋ', pronunciation: 'kh', meaning: 'kieuk (k)', type: 'consonant', row: 1 },
  // Row 2
  { word: 'ㅌ', pronunciation: 'th', meaning: 'tieut (t)', type: 'consonant', row: 2 },
  { word: 'ㅍ', pronunciation: 'p\'', meaning: 'pieup (p)', type: 'consonant', row: 2 },
  { word: 'ㅎ', pronunciation: 'h', meaning: 'hieut (h)', type: 'consonant', row: 2 },
  { word: 'ㄲ', pronunciation: 'kk', meaning: 'ssang-giyeok (kk)', type: 'consonant', row: 2 },
  { word: 'ㄸ', pronunciation: 'tt', meaning: 'ssang-digeut (tt)', type: 'consonant', row: 2 },
  { word: 'ㅃ', pronunciation: 'pp', meaning: 'ssang-bieup (pp)', type: 'consonant', row: 2 },
  { word: 'ㅆ', pronunciation: 'ss', meaning: 'ssang-siot (ss)', type: 'consonant', row: 2 },
  { word: 'ㅉ', pronunciation: 'ch', meaning: 'ssang-jieut (jj)', type: 'consonant', row: 2 },
]

/**
 * Mock data cho skill modules
 */
/**
 * Mock data cho skill modules
 */
export const SKILL_MODULES = [
  {
    id: 'vocabulary',
    title: 'HÀNH TRÌNH TỪ VỰNG',
    backgroundColor: '#FFF5EB',
    primaryColor: '#FF9F43', // Cam đào
    borderColor: '#FFE8D1',
    icon: FolderIcon,
    items: [
      { label: 'Học từ vựng theo chủ đề', icon: AppFolderIcon, route: 'topics' },
      { label: 'Minigame từ vựng', icon: GameCardIcon, route: 'minigame' },
      { label: 'Ôn tập từ vựng đã học', icon: NotebookIcon, route: 'learned' },
    ],
  },
  {
    id: 'skills',
    title: 'RÈN LUYỆN KỸ NĂNG',
    backgroundColor: '#F0EFFF',
    primaryColor: '#4834D4', // Xanh tím nhẹ
    borderColor: '#E1DFFF',
    icon: ChatboxIcon,
    items: [
      { label: 'Luyện phát âm với AI', icon: Mic2Icon, route: 'pronunciation' },
      { label: 'Học bảng chữ cái cho người mới', icon: LightbulbIcon, route: 'alphabet' },
      { label: 'Học lộ trình (Roadmap)', icon: RoadmapIcon, route: 'roadmap' },
    ],
  },
  {
    id: 'topik',
    title: 'LUYỆN THI TOPIK',
    backgroundColor: '#EBFAEF',
    primaryColor: '#20BF6B', // Xanh lá ngọc
    borderColor: '#D4F5DE',
    icon: BookIcon,
    items: [
      { label: 'Học TOPIK theo dạng', icon: ReadOutlined, route: 'topik-type' },
      { label: 'Giải đề TOPIK', icon: FormOutlined, route: 'topik-exam' },
    ],
  }
]

