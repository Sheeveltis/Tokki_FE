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
  // Thêm từ vựng mẫu cho chủ đề 취미 (Sở thích)
  {
    vocabularyId: 'v-hobby-1',
    text: '독서',
    pronunciation: 'dokseo',
    definition: 'Đọc sách',
    exampleSentence: '저는 주말에 독서를 좋아해요. (Tôi thích đọc sách vào cuối tuần.)',
    imgURL: null,
  },
  {
    vocabularyId: 'v-hobby-2',
    text: '음악',
    pronunciation: 'eumak',
    definition: 'Âm nhạc',
    exampleSentence: '음악을 들으면 기분이 좋아져요. (Nghe nhạc làm tôi cảm thấy vui.)',
    imgURL: null,
  },
  {
    vocabularyId: 'v-hobby-3',
    text: '영화',
    pronunciation: 'yeonghwa',
    definition: 'Phim',
    exampleSentence: '오늘 밤에 영화를 볼 거예요. (Tối nay tôi sẽ xem phim.)',
    imgURL: null,
  },
  {
    vocabularyId: 'v-hobby-4',
    text: '여행',
    pronunciation: 'yeohaeng',
    definition: 'Du lịch',
    exampleSentence: '다음 달에 제주도로 여행을 갈 예정이에요. (Tháng sau tôi dự định đi du lịch đảo Jeju.)',
    imgURL: null,
  },
  {
    vocabularyId: 'v-hobby-5',
    text: '요리',
    pronunciation: 'yori',
    definition: 'Nấu ăn',
    exampleSentence: '주말에 집에서 요리를 해요. (Cuối tuần tôi nấu ăn ở nhà.)',
    imgURL: null,
  },
  // Thêm từ vựng mẫu cho chủ đề 가족 (Gia đình)
  {
    vocabularyId: 'v-family-2',
    text: '아버지',
    pronunciation: 'abeoji',
    definition: 'Bố',
    exampleSentence: '아버지는 회사에 다녀요. (Bố đi làm ở công ty.)',
    imgURL: null,
  },
  {
    vocabularyId: 'v-family-3',
    text: '어머니',
    pronunciation: 'eomeoni',
    definition: 'Mẹ',
    exampleSentence: '어머니는 요리를 잘하세요. (Mẹ nấu ăn rất giỏi.)',
    imgURL: null,
  },
  {
    vocabularyId: 'v-family-4',
    text: '형',
    pronunciation: 'hyeong',
    definition: 'Anh trai (người nói là em trai)',
    exampleSentence: '형은 대학생이에요. (Anh trai là sinh viên đại học.)',
    imgURL: null,
  },
  {
    vocabularyId: 'v-family-5',
    text: '누나',
    pronunciation: 'nuna',
    definition: 'Chị gái (người nói là em trai)',
    exampleSentence: '누나와 함께 쇼핑을 했어요. (Tôi đã đi mua sắm cùng chị gái.)',
    imgURL: null,
  },
  // Thêm từ vựng mẫu cho chủ đề 직업 (Công việc)
  {
    vocabularyId: 'v-job-1',
    text: '의사',
    pronunciation: 'uisa',
    definition: 'Bác sĩ',
    exampleSentence: '의사가 환자를 치료해요. (Bác sĩ chữa bệnh cho bệnh nhân.)',
    imgURL: null,
  },
  {
    vocabularyId: 'v-job-2',
    text: '선생님',
    pronunciation: 'seonsaengnim',
    definition: 'Giáo viên',
    exampleSentence: '선생님이 학생들에게 한국어를 가르쳐요. (Giáo viên dạy tiếng Hàn cho học sinh.)',
    imgURL: null,
  },
  {
    vocabularyId: 'v-job-3',
    text: '간호사',
    pronunciation: 'ganhosa',
    definition: 'Y tá',
    exampleSentence: '간호사가 병원에서 일해요. (Y tá làm việc ở bệnh viện.)',
    imgURL: null,
  },
  {
    vocabularyId: 'v-job-4',
    text: '요리사',
    pronunciation: 'yorisa',
    definition: 'Đầu bếp',
    exampleSentence: '요리사가 맛있는 음식을 만들어요. (Đầu bếp làm món ăn ngon.)',
    imgURL: null,
  },
  // Thêm từ vựng mẫu cho chủ đề 학교 (Trường học)
  {
    vocabularyId: 'v-school-2',
    text: '학생',
    pronunciation: 'haksaeng',
    definition: 'Học sinh',
    exampleSentence: '학생들이 교실에서 공부해요. (Học sinh học trong lớp.)',
    imgURL: null,
  },
  {
    vocabularyId: 'v-school-3',
    text: '책',
    pronunciation: 'chaek',
    definition: 'Sách',
    exampleSentence: '도서관에서 책을 빌렸어요. (Tôi đã mượn sách ở thư viện.)',
    imgURL: null,
  },
  {
    vocabularyId: 'v-school-4',
    text: '공부하다',
    pronunciation: 'gongbuhada',
    definition: 'Học tập',
    exampleSentence: '저는 매일 한국어를 공부해요. (Tôi học tiếng Hàn mỗi ngày.)',
    imgURL: null,
  },
  {
    vocabularyId: 'v-school-5',
    text: '시험',
    pronunciation: 'siheom',
    definition: 'Kỳ thi',
    exampleSentence: '다음 주에 시험이 있어요. (Tuần sau có kỳ thi.)',
    imgURL: null,
  },
  // Thêm từ vựng mẫu cho chủ đề 생활 (Đời sống sinh hoạt)
  {
    vocabularyId: 'v-life-1',
    text: '아침',
    pronunciation: 'achim',
    definition: 'Buổi sáng',
    exampleSentence: '아침에 일찍 일어나요. (Tôi dậy sớm vào buổi sáng.)',
    imgURL: null,
  },
  {
    vocabularyId: 'v-life-2',
    text: '점심',
    pronunciation: 'jeomsim',
    definition: 'Bữa trưa',
    exampleSentence: '점심을 먹었어요. (Tôi đã ăn trưa.)',
    imgURL: null,
  },
  {
    vocabularyId: 'v-life-3',
    text: '저녁',
    pronunciation: 'jeonyeok',
    definition: 'Buổi tối',
    exampleSentence: '저녁에 친구를 만나요. (Tôi gặp bạn vào buổi tối.)',
    imgURL: null,
  },
  {
    vocabularyId: 'v-life-4',
    text: '잠',
    pronunciation: 'jam',
    definition: 'Giấc ngủ',
    exampleSentence: '잠을 충분히 자요. (Tôi ngủ đủ giấc.)',
    imgURL: null,
  },
]

export const FLASHCARD_TOPICS = [
  {
    id: 'hobby',
    title: '취미',
    subtitle: 'Sở thích',
    level: 1,
    icon: Bunny1,
    vocabIds: ['v-hobby-1', 'v-hobby-2', 'v-hobby-3', 'v-hobby-4', 'v-hobby-5'],
  },
  {
    id: 'family',
    title: '가족',
    subtitle: 'Gia đình',
    level: 1,
    icon: Bunny2,
    vocabIds: ['v-family-1', 'v-family-2', 'v-family-3', 'v-family-4', 'v-family-5'],
  },
  {
    id: 'job',
    title: '직업',
    subtitle: 'Công việc',
    level: 3,
    icon: Bunny3,
    vocabIds: ['v-job-1', 'v-job-2', 'v-job-3', 'v-job-4'],
  },
  {
    id: 'school',
    title: '학교',
    subtitle: 'Trường học',
    level: 2,
    icon: Bunny4,
    vocabIds: ['v-school-1', 'v-school-2', 'v-school-3', 'v-school-4', 'v-school-5'],
  },
  {
    id: 'life',
    title: '생활',
    subtitle: 'Đời sống sinh hoạt',
    level: 4,
    icon: Bunny5,
    vocabIds: ['kAtJcxHHvzRfpT-', 'v-life-1', 'v-life-2', 'v-life-3', 'v-life-4'],
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

// Helper function để lấy từ vựng theo topic ID từ mock data
export const getMockVocabulariesByTopic = (topicId) => {
  const topic = FLASHCARD_TOPICS.find((t) => t.id === topicId)
  if (!topic || !topic.vocabIds || topic.vocabIds.length === 0) {
    return []
  }
  
  return topic.vocabIds
    .map((vocabId) => mockVocabularies.find((v) => v.vocabularyId === vocabId))
    .filter(Boolean)
    .map((vocab) => ({
      id: vocab.vocabularyId,
      word: vocab.text,
      meaning: vocab.definition,
      pronunciation: vocab.pronunciation || null,
      imageUrl: vocab.imgURL || null,
      audioUrl: null,
      _raw: vocab,
    }))
}

// Mock data cho từ vựng yêu thích (một số từ vựng phổ biến)
export const getMockFavoriteVocabularies = () => {
  const favoriteIds = ['v-greetings-1', 'v-thanks-1', 'v-food-1', 'v-family-1', 'v-hobby-1', 'v-hobby-2']
  return favoriteIds
    .map((vocabId) => mockVocabularies.find((v) => v.vocabularyId === vocabId))
    .filter(Boolean)
    .map((vocab) => ({
      id: vocab.vocabularyId,
      word: vocab.text,
      meaning: vocab.definition,
      pronunciation: vocab.pronunciation || null,
      imageUrl: vocab.imgURL || null,
      audioUrl: null,
      _raw: vocab,
    }))
}

// Mock data cho từ vựng đã học (một số từ vựng đã học)
export const getMockLearnedVocabularies = () => {
  const learnedIds = ['v-school-1', 'v-school-2', 'v-family-1', 'v-family-2']
  return learnedIds
    .map((vocabId) => mockVocabularies.find((v) => v.vocabularyId === vocabId))
    .filter(Boolean)
    .map((vocab) => ({
      id: vocab.vocabularyId,
      userVocabProgressId: `progress-${vocab.vocabularyId}`,
      word: vocab.text,
      meaning: vocab.definition,
      pronunciation: vocab.pronunciation || null,
      imageUrl: vocab.imgURL || null,
      audioUrl: null,
      boxLevel: 2,
      streak: 3,
      nextReviewAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      _raw: vocab,
    }))
}

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

