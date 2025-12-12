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

