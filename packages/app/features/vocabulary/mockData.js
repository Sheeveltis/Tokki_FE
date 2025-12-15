import Bunny1 from '../../../assets/bunny/14.png'
import Bunny2 from '../../../assets/bunny/15.png'
import Bunny3 from '../../../assets/bunny/13.png'
import Bunny4 from '../../../assets/bunny/12.png'
import Bunny5 from '../../../assets/bunny/11.png'
import Bunny6 from '../../../assets/bunny/10.png'

export const mockVocabularies = [
  {
    vocabularyId: 'kAtJcxHHvzRfpT-',
    text: '은행',
    pronunciation: 'eunhaeng',
    definition: 'Ngân hàng',
    exampleSentence: '저는 매주 월요일에 은행에 갑니다. (Tôi đi ngân hàng mỗi thứ Hai hàng tuần.)',
    imgURL: 'https://example.com/images/bank.jpg',
  },
  {
    vocabularyId: 'v-greetings-1',
    text: '안녕하세요',
    pronunciation: 'annyeonghaseyo',
    definition: 'Xin chào (trang trọng)',
    exampleSentence: '안녕하세요! 처음 뵙겠습니다. (Xin chào! Rất vui được gặp bạn.)',
    imgURL: 'https://example.com/images/hello.jpg',
  },
  {
    vocabularyId: 'v-thanks-1',
    text: '감사합니다',
    pronunciation: 'gamsahamnida',
    definition: 'Cảm ơn (trang trọng)',
    exampleSentence: '도와주셔서 감사합니다. (Cảm ơn vì đã giúp tôi.)',
    imgURL: 'https://example.com/images/thanks.jpg',
  },
  {
    vocabularyId: 'v-food-1',
    text: '맛있다',
    pronunciation: 'masitda',
    definition: 'Ngon',
    exampleSentence: '이 음식이 정말 맛있어요. (Món ăn này thật ngon.)',
    imgURL: 'https://example.com/images/delicious.jpg',
  },
  {
    vocabularyId: 'v-school-1',
    text: '학교',
    pronunciation: 'hakgyo',
    definition: 'Trường học',
    exampleSentence: '학생들은 학교에서 공부합니다. (Học sinh học ở trường.)',
    imgURL: 'https://example.com/images/school.jpg',
  },
  {
    vocabularyId: 'v-family-1',
    text: '가족',
    pronunciation: 'gajok',
    definition: 'Gia đình',
    exampleSentence: '주말에 가족과 시간을 보냈어요. (Cuối tuần tôi dành thời gian với gia đình.)',
    imgURL: 'https://example.com/images/family.jpg',
  },
]

export const FLASHCARD_TOPICS = [
  {
    id: 'hobby',
    title: '취미',
    subtitle: 'Sở thích',
    level: 1,
    icon: Bunny1,
    vocabIds: ['v-food-1', 'v-greetings-1'],
  },
  {
    id: 'family',
    title: '가족',
    subtitle: 'Gia đình',
    level: 1,
    icon: Bunny2,
    vocabIds: ['v-family-1'],
  },
  {
    id: 'job',
    title: '직업',
    subtitle: 'Công việc',
    level: 3,
    icon: Bunny3,
    vocabIds: ['v-thanks-1'],
  },
  {
    id: 'school',
    title: '학교',
    subtitle: 'Trường học',
    level: 2,
    icon: Bunny4,
    vocabIds: ['v-school-1'],
  },
  {
    id: 'life',
    title: '생활',
    subtitle: 'Đời sống sinh hoạt',
    level: 4,
    icon: Bunny5,
    vocabIds: ['kAtJcxHHvzRfpT-'],
  },
  {
    id: 'sport',
    title: '스포츠',
    subtitle: 'Thể thao',
    level: 6,
    icon: Bunny6,
    muted: true,
    vocabIds: [],
  },
]

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

export const mockFlashcardTopics = FLASHCARD_TOPICS

