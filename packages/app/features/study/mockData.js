import Bunny1 from '../../../assets/bunny/14.png'
import Bunny2 from '../../../assets/bunny/15.png'
import Bunny3 from '../../../assets/bunny/13.png'
import Bunny4 from '../../../assets/bunny/12.png'
import Bunny5 from '../../../assets/bunny/11.png'
import Bunny6 from '../../../assets/bunny/10.png'

import HeadphoneIcon from '../../../assets/icon/icon-mainflow/headphone.svg'
import RadioIcon from '../../../assets/icon/icon-mainflow/radio.svg'
import PodcastIcon from '../../../assets/icon/icon-mainflow/podcast.svg'
import MusicIcon from '../../../assets/icon/icon-mainflow/music.svg'
import EarIcon from '../../../assets/icon/icon-mainflow/ear.svg'
import ChatboxIcon from '../../../assets/icon/icon-mainflow/chatbox.svg'
import AIIcon from '../../../assets/icon/icon-mainflow/ai.svg'
import ReadIcon from '../../../assets/icon/icon-mainflow/read.svg'
import BlogIcon from '../../../assets/icon/icon-mainflow/blog.svg'
import BookIcon from '../../../assets/icon/icon-mainflow/bookandsky.svg'
import NewsIcon from '../../../assets/icon/icon-mainflow/news.svg'
import WriteImage from '../../../assets/icon/icon-mainflow/write_image.jpg'
import KoreanImage from '../../../assets/icon/icon-mainflow/korean.png'
import FolderIcon from '../../../assets/icon/icon-mainflow/folder.svg'
import GameIcon from '../../../assets/icon/icon-mainflow/game.svg'
import WriteIcon from '../../../assets/icon/icon-mainflow/write.svg'

/**
 * Mock data cho flashcard topics
 */
export const FLASHCARD_TOPICS = [
  { id: 'hobby', title: '취미', subtitle: 'Sở thích', icon: Bunny1 },
  { id: 'family', title: '가족', subtitle: 'Gia đình', icon: Bunny2 },
  { id: 'job', title: '직업', subtitle: 'Công việc', icon: Bunny3 },
  { id: 'school', title: '학교', subtitle: 'Trường học', icon: Bunny4 },
  { id: 'life', title: '생활', subtitle: 'Đời sống sinh hoạt', icon: Bunny5 },
  { id: 'sport', title: '스포츠', subtitle: 'Thể thao', icon: Bunny6, muted: true },
]

/**
 * Mock data cho flashcards
 */
export const FLASHCARDS = [
  { word: '한국어', meaning: 'Tiếng Hàn' },
  { word: '학교', meaning: 'Trường học' },
  { word: '친구', meaning: 'Bạn bè' },
  { word: '가족', meaning: 'Gia đình' },
  { word: '음식', meaning: 'Đồ ăn' },
  { word: '회사', meaning: 'Công ty' },
  { word: '선생님', meaning: 'Giáo viên' },
  { word: '학생', meaning: 'Học sinh' },
  { word: '책', meaning: 'Sách' },
  { word: '시간', meaning: 'Thời gian' },
  { word: '도서관', meaning: 'Thư viện' },
  { word: '운동', meaning: 'Thể dục' },
  { word: '집', meaning: 'Nhà' },
  { word: '물', meaning: 'Nước' },
  { word: '돈', meaning: 'Tiền' },
]

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
    id: 'listening',
    title: 'NGHE',
    icon: HeadphoneIcon,
    items: [
      { label: 'Radio', icon: RadioIcon },
      { label: 'Podcast', icon: PodcastIcon },
      { label: 'Nhạc', icon: MusicIcon },
      { label: 'Nghe chép chính tả', icon: EarIcon },
    ],
  },
  {
    id: 'speaking',
    title: 'NÓI',
    icon: ChatboxIcon,
    items: [
      { label: 'Nghe chép chính tả', icon: ChatboxIcon },
      { label: 'Luyện nói với A.I', icon: AIIcon },
    ],
  },
  {
    id: 'reading',
    title: 'ĐỌC',
    icon: ReadIcon,
    items: [
      { label: 'Blog', icon: BlogIcon },
      { label: 'Truyện', icon: BookIcon },
      { label: 'Báo', icon: NewsIcon },
      { label: 'Đọc văn bản', icon: ReadIcon },
    ],
  },
  {
    id: 'writing',
    title: 'VIẾT',
    icon: WriteImage,
    isImageModule: true,
    items: [],
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
  {
    id: 'grammar',
    title: 'NGỮ PHÁP',
    icon: KoreanImage,
    isImageModule: true,
    items: [],
  },
]

