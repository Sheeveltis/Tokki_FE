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

