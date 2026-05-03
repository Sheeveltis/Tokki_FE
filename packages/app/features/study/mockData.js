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
  {
    word: 'ㅏ', meaning: 'a', pronunciation: 'a', type: 'vowel', row: 1, audio: 'https://res.cloudinary.com/dxfii0v3c/video/upload/v1776736684/tokki/korean-pronunciation/mbharw5vl3iekmxo8udh.mp3'
  },
  { word: 'ㅑ', meaning: 'ya', pronunciation: 'ya', type: 'vowel', row: 1, audio: 'https://res.cloudinary.com/dxfii0v3c/video/upload/v1776736687/tokki/korean-pronunciation/bbwouwwzygsyyivgugfd.mp3' },
  { word: 'ㅓ', meaning: 'eo', pronunciation: 'o', type: 'vowel', row: 1, audio: 'https://res.cloudinary.com/dxfii0v3c/video/upload/v1776736690/tokki/korean-pronunciation/b9ghhwctzlcuhioshtts.mp3' },
  { word: 'ㅕ', meaning: 'yeo', pronunciation: 'yo', type: 'vowel', row: 1, audio: 'https://res.cloudinary.com/dxfii0v3c/video/upload/v1776736692/tokki/korean-pronunciation/b4jpzcj2ly4gqdyycz7v.mp3' },
  { word: 'ㅗ', meaning: 'o', pronunciation: 'ô', type: 'vowel', row: 1, audio: 'https://res.cloudinary.com/dxfii0v3c/video/upload/v1776736695/tokki/korean-pronunciation/pd6xz2yceqo9rav4rsfe.mp3' },
  { word: 'ㅛ', meaning: 'yo', pronunciation: 'yô', type: 'vowel', row: 1, audio: 'https://res.cloudinary.com/dxfii0v3c/video/upload/v1776736705/tokki/korean-pronunciation/j1wojtupyqjzfm54uq9b.mp3' },
  { word: 'ㅜ', meaning: 'u', pronunciation: 'u', type: 'vowel', row: 1, audio: 'https://res.cloudinary.com/dxfii0v3c/video/upload/v1776736715/tokki/korean-pronunciation/iakje3onhr1xvwzfhunl.mp3' },
  { word: 'ㅠ', meaning: 'yu', pronunciation: 'yu', type: 'vowel', row: 1, audio: 'https://res.cloudinary.com/dxfii0v3c/video/upload/v1776736718/tokki/korean-pronunciation/uciv4iyyxpatpkpls3pt.mp3' },
  { word: 'ㅡ', meaning: 'eu', pronunciation: 'ư', type: 'vowel', row: 1, audio: 'https://res.cloudinary.com/dxfii0v3c/video/upload/v1776736720/tokki/korean-pronunciation/fufjc7osmdb9jduqqian.mp3' },
  { word: 'ㅣ', meaning: 'i', pronunciation: 'i', type: 'vowel', row: 1, audio: 'https://res.cloudinary.com/dxfii0v3c/video/upload/v1776736757/tokki/korean-pronunciation/gqjup2os56vfczn0hi8z.mp3' },
  // Row 2
  { word: 'ㅐ', meaning: 'ae', pronunciation: 'e', type: 'vowel', row: 2, audio: 'https://res.cloudinary.com/dxfii0v3c/video/upload/v1776736760/tokki/korean-pronunciation/nntqmdy373dlclcnsonq.mp3' },
  { word: 'ㅒ', meaning: 'yae', pronunciation: 'ye', type: 'vowel', row: 2, audio: 'https://res.cloudinary.com/dxfii0v3c/video/upload/v1776736762/tokki/korean-pronunciation/ssuhpcyo4quzjlasyww7.mp3' },
  { word: 'ㅔ', meaning: 'e', pronunciation: 'ê', type: 'vowel', row: 2, audio: 'https://res.cloudinary.com/dxfii0v3c/video/upload/v1776736765/tokki/korean-pronunciation/k2kjvepbdnxpzexdmrvz.mp3' },
  { word: 'ㅖ', pronunciation: 'yê', meaning: 'ye', type: 'vowel', row: 2, audio: 'https://res.cloudinary.com/dxfii0v3c/video/upload/v1776736766/tokki/korean-pronunciation/zlcqmhofqjutryddyy1q.mp3' },
  { word: 'ㅘ', pronunciation: 'oa', meaning: 'wa', type: 'vowel', row: 2, audio: 'https://res.cloudinary.com/dxfii0v3c/video/upload/v1776736769/tokki/korean-pronunciation/asqpejstt1cyb7o0jpdt.mp3' },
  { word: 'ㅙ', pronunciation: 'oe', meaning: 'wae', type: 'vowel', row: 2, audio: 'https://res.cloudinary.com/dxfii0v3c/video/upload/v1776736771/tokki/korean-pronunciation/kvwbybkzezijsnbmqsgl.mp3' },
  { word: 'ㅚ', pronunciation: 'uê', meaning: 'oe', type: 'vowel', row: 2, audio: 'https://res.cloudinary.com/dxfii0v3c/video/upload/v1776736774/tokki/korean-pronunciation/fn29g0g99jdsygynqybp.mp3' },
  { word: 'ㅝ', pronunciation: 'uơ', meaning: 'wo', type: 'vowel', row: 2, audio: 'https://res.cloudinary.com/dxfii0v3c/video/upload/v1776736776/tokki/korean-pronunciation/degijjl0s1dsidlqee93.mp3' },
  { word: 'ㅞ', pronunciation: 'uê', meaning: 'we', type: 'vowel', row: 2, audio: 'https://res.cloudinary.com/dxfii0v3c/video/upload/v1776736777/tokki/korean-pronunciation/jcdbdqjp51duf1iaautk.mp3' },
  { word: 'ㅟ', pronunciation: 'uy', meaning: 'wi', type: 'vowel', row: 2, audio: 'https://res.cloudinary.com/dxfii0v3c/video/upload/v1776736780/tokki/korean-pronunciation/lmoqlnoufkwqlwa8shb4.mp3' },
  { word: 'ㅢ', pronunciation: 'ưi', meaning: 'ui', type: 'vowel', row: 2, audio: 'https://res.cloudinary.com/dxfii0v3c/video/upload/v1776736782/tokki/korean-pronunciation/xvflpcp16baegnncrvr2.mp3' },

  // PHỤ ÂM (Consonants)
  // Row 1
  { word: 'ㄱ', pronunciation: 'k/g', meaning: 'giyeok (g/k)', type: 'consonant', row: 1, audio: 'https://res.cloudinary.com/dxfii0v3c/video/upload/v1776736601/tokki/korean-pronunciation/ibgzqykczrvqvyiay6is.mp3' },
  { word: 'ㄴ', pronunciation: 'n', meaning: 'nieun (n)', type: 'consonant', row: 1, audio: 'https://res.cloudinary.com/dxfii0v3c/video/upload/v1776736603/tokki/korean-pronunciation/nuhrvuxfls6xlifwktvs.mp3' },
  { word: 'ㄷ', pronunciation: 't/d', meaning: 'digeut (d/t)', type: 'consonant', row: 1, audio: 'https://res.cloudinary.com/dxfii0v3c/video/upload/v1776736604/tokki/korean-pronunciation/b4gnwewjprd1ctegnt6e.mp3' },
  { word: 'ㄹ', pronunciation: 'r/l', meaning: 'rieul (r/l)', type: 'consonant', row: 1, audio: 'https://res.cloudinary.com/dxfii0v3c/video/upload/v1776736631/tokki/korean-pronunciation/nfpcazxvaxnlxqwu0fiv.mp3' },
  { word: 'ㅁ', pronunciation: 'm', meaning: 'mieum (m)', type: 'consonant', row: 1, audio: 'https://res.cloudinary.com/dxfii0v3c/video/upload/v1776736634/tokki/korean-pronunciation/cutauys1bzutbne5occj.mp3' },
  { word: 'ㅂ', pronunciation: 'b', meaning: 'bieup (b/p)', type: 'consonant', row: 1, audio: 'https://res.cloudinary.com/dxfii0v3c/video/upload/v1776736635/tokki/korean-pronunciation/faidcjhrncd6qzhoealh.mp3' },
  { word: 'ㅅ', pronunciation: 's', meaning: 'siot (s)', type: 'consonant', row: 1, audio: 'https://res.cloudinary.com/dxfii0v3c/video/upload/v1776736637/tokki/korean-pronunciation/yrr9t1amidi6u4hzvdr2.mp3' },
  { word: 'ㅇ', pronunciation: 'ng', meaning: 'ieung (ng)', type: 'consonant', row: 1, audio: 'https://res.cloudinary.com/dxfii0v3c/video/upload/v1776736638/tokki/korean-pronunciation/kgmrvgv9lkk1uwqgpoei.mp3' },
  { word: 'ㅈ', pronunciation: 'j', meaning: 'jieut (j/ch)', type: 'consonant', row: 1, audio: 'https://res.cloudinary.com/dxfii0v3c/video/upload/v1776736655/tokki/korean-pronunciation/wu8tmcvufl3gctxtzmhc.mp3' },
  { word: 'ㅊ', pronunciation: 'ch', meaning: 'chieut (ch)', type: 'consonant', row: 1, audio: 'https://res.cloudinary.com/dxfii0v3c/video/upload/v1776736657/tokki/korean-pronunciation/l0uxp3kdz8izzt46a9oa.mp3' },
  { word: 'ㅋ', pronunciation: 'kh', meaning: 'kieuk (k)', type: 'consonant', row: 1, audio: 'https://res.cloudinary.com/dxfii0v3c/video/upload/v1776736665/tokki/korean-pronunciation/vhj8wblhjjtyfzsrhlix.mp3' },
  // Row 2
  { word: 'ㅌ', pronunciation: 'th', meaning: 'tieut (t)', type: 'consonant', row: 2, audio: 'https://res.cloudinary.com/dxfii0v3c/video/upload/v1776736668/tokki/korean-pronunciation/hqwbv0unmr9grzxjfryy.mp3' },
  { word: 'ㅍ', pronunciation: 'p\'', meaning: 'pieup (p)', type: 'consonant', row: 2, audio: 'https://res.cloudinary.com/dxfii0v3c/video/upload/v1776736670/tokki/korean-pronunciation/xfabud0wvxa1hn1lwupw.mp3' },
  { word: 'ㅎ', pronunciation: 'h', meaning: 'hieut (h)', type: 'consonant', row: 2, audio: 'https://res.cloudinary.com/dxfii0v3c/video/upload/v1776736672/tokki/korean-pronunciation/tha28dp1k01yix5pnknm.mp3' },
  { word: 'ㄲ', pronunciation: 'kk', meaning: 'ssang-giyeok (kk)', type: 'consonant', row: 2, audio: 'https://res.cloudinary.com/dxfii0v3c/video/upload/v1776736674/tokki/korean-pronunciation/fh5ik3qx6uxyi5vhklyj.mp3' },
  { word: 'ㄸ', pronunciation: 'tt', meaning: 'ssang-digeut (tt)', type: 'consonant', row: 2, audio: 'https://res.cloudinary.com/dxfii0v3c/video/upload/v1776736675/tokki/korean-pronunciation/hyr1ctjynnlnnpg2emqr.mp3' },
  { word: 'ㅃ', pronunciation: 'pp', meaning: 'ssang-bieup (pp)', type: 'consonant', row: 2, audio: 'https://res.cloudinary.com/dxfii0v3c/video/upload/v1776736678/tokki/korean-pronunciation/ogdgktkjiqtvlvwf7il3.mp3' },
  { word: 'ㅆ', pronunciation: 'ss', meaning: 'ssang-siot (ss)', type: 'consonant', row: 2, audio: 'https://res.cloudinary.com/dxfii0v3c/video/upload/v1776736680/tokki/korean-pronunciation/y3knn8y2peamwxvoxry1.mp3' },
  { word: 'ㅉ', pronunciation: 'ch', meaning: 'ssang-jieut (jj)', type: 'consonant', row: 2, audio: 'https://res.cloudinary.com/dxfii0v3c/video/upload/v1776736683/tokki/korean-pronunciation/ojfpwc5upa7wctfh2zz2.mp3' },
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
    ],
  }
]

