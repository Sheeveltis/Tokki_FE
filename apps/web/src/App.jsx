import './App.css'
import { BrowserRouter, Routes, Route, useNavigate, useSearchParams } from 'react-router-dom'

import { Provider as AppProvider } from '@tokki/app/provider'
import { QueryProvider } from '@tokki/app/provider/query/query-client'

import { HomeScreen } from '@tokki/app/features/home/screen'
import { LoginScreen } from '@tokki/app/features/authentication/login-screen'
import { RegisterScreen } from '@tokki/app/features/authentication/register-screen'
import { ForgotPasswordScreen } from '@tokki/app/features/authentication/forgot-password/forgot-password-screen'

import { StudyScreen } from '@tokki/app/features/study/screen'
import { MenuStudy } from '@tokki/app/features/study/menu-study'
import AlphabetSelectModeScreen from '@tokki/app/features/study/alphabet-select-mode'
import AlphabetStudyScreen from '@tokki/app/features/study/alphabet-study'
import AlphabetLearnScreen from '@tokki/app/features/study/alphabet-learn'
import AlphabetTypingScreen from '@tokki/app/features/study/alphabet-typing'
import AlphabetPronunciationScreen from '@tokki/app/features/study/alphabet-pronunciation'

import FlashcardListScreen from '@tokki/app/features/study/flashcard-list'
import FlashcardStudyScreen from '@tokki/app/features/study/flashcard-study'
import LearnScreen from '@tokki/app/features/study/flashcard-learn'
import TestScreen from '@tokki/app/features/study/flashcard-test'

import { STUDY_PAGE_TITLES, TOPIC_TITLES } from '@tokki/app/features/study/constants'

import { RoadmapInfoScreen } from '@tokki/app/features/roadmap/roadmap-info/roadmap-info-screen'
import { RoadmapTestLayout } from '@tokki/app/features/roadmap/roadmap-test/components/roadmap-test-layout.web'

import { MinigameScreen } from '@tokki/app/features/minigame/minigame-screen'
import MatchingCardLevelScreen from '@tokki/app/features/minigame/matching-card/matching-card-level/matching-card-level-screen'
import MatchingCardTopicScreen from '@tokki/app/features/minigame/matching-card/matching-card-topic/matching-card-topic-screen'
import MatchingCardRuleScreen from '@tokki/app/features/minigame/matching-card/matching-card-rule/matching-card-rule-screen'
import MatchingCardScreen from '@tokki/app/features/minigame/matching-card/matching-card-play/matching-card-screen'
import MatchingCardResultScreen from '@tokki/app/features/minigame/matching-card/matching-card-resulft/matching-card-result-screen'

import { PackageScreen } from '@tokki/app/features/payment/payment-package/package-screen'
import { PremiumScreen } from '@tokki/app/features/payment/premium-package/premium-screen'
import { PaymentScreen } from '@tokki/app/features/payment/payment-detail/payment-screen'
import { PaymentFailedScreen } from '@tokki/app/features/payment/payment-failed/payment-failed-screen'
import { PaymentSuccessScreen } from '@tokki/app/features/payment/payment-success/payment-success-screen'

import { ErrorScreen } from '@tokki/app/features/error/error-screen'

import LeaderboardScreen from '@tokki/app/features/leaderboard/leaderboard-screen'

import { BlogListScreen } from '@tokki/app/features/blog/list-blog'
import { BlogDetailScreen } from '@tokki/app/features/blog/detail-blog'

import { UserProfileScreen } from '@tokki/app/features/user/profile/user-profile-screen'

import { AdminScreen } from '@tokki/app/features/admin/screen'
import { CreateLessonScreen } from '@tokki/app/features/admin/screens/CreateLesson'
import { LessonDetailScreen } from '@tokki/app/features/admin/screens/LessonDetail'
import { CreateBlogScreen } from '@tokki/app/features/blog/admin-create-blog'
import { BlogDetailScreen as AdminBlogDetailScreen } from '@tokki/app/features/admin/screens/BlogDetail'
import { UserDetailScreen } from '@tokki/app/features/admin/screens/UserDetail'
import { CreateUserScreen } from '@tokki/app/features/admin/screens/CreateUser'
import { CreateAdminStaffScreen } from '@tokki/app/features/admin/screens/CreateAdminStaff'
import { FlashcardTopicDetailScreen } from '@tokki/app/features/vocabulary/screens/FlashcardTopicDetail'
import { VocabularyDetailScreen } from '@tokki/app/features/vocabulary/screens/VocabularyDetail'
import { CreateVocabularyScreen } from '@tokki/app/features/vocabulary/screens/CreateVocabulary'

import { StaffScreen } from '@tokki/app/features/staff/screen'

import { TestLayout } from './test-layout'

// -------- AUTH --------
function LoginRoute() {
  const navigate = useNavigate()

  return (
    <LoginScreen
      onPressSignUp={() => navigate('/register')}
    />
  )
}

function RegisterRoute() {
  const navigate = useNavigate()

  return (
    <RegisterScreen
      onPressLogin={() => navigate('/login')}
    />
  )
}

function ForgotPasswordRoute() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') || ''

  const handleSubmit = async ({ email: formEmail, newPassword, confirmPassword }) => {
    // Giữ nguyên behaviour phần gọi API như bên Next bằng cách reuse helpers trong screen
    // Ở đây ta chỉ điều hướng sau khi submit thành công
    // ForgotPasswordScreen tự handle gọi API qua props onSubmit
    const finalEmail = formEmail || email
    await ForgotPasswordScreen.defaultProps?.onSubmit?.({
      email: finalEmail,
      newPassword,
      confirmPassword,
    })
    navigate('/login')
  }

  return <ForgotPasswordScreen email={email} onSubmit={handleSubmit} />
}

// -------- STUDY / MENU / FLASHCARD / ALPHABET --------
function StudyRoute() {
  const navigate = useNavigate()

  return (
    <StudyScreen
      title={STUDY_PAGE_TITLES.STUDY}
      onSelectLevel={(levelId) => {
        navigate(`/menu-study?level=${levelId}`)
      }}
      onQuickTestPress={() => {
        navigate('/test')
      }}
      lessonsLearned={30}
      streakDays={30}
    />
  )
}

function MenuStudyRoute() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const levelId = parseInt(searchParams.get('level') || '1', 10)

  return (
    <MenuStudy
      levelId={levelId}
      onBackPress={() => navigate('/study')}
      onQuickTestPress={() => navigate('/test')}
      lessonsLearned={30}
      streakDays={30}
    />
  )
}

function AlphabetRoute() {
  const navigate = useNavigate()

  return (
    <AlphabetSelectModeScreen
      onBackPress={() => navigate('/menu-study?level=1')}
      onLettersPress={() => navigate('/alphabet/letters')}
      onSyllablesPress={() => navigate('/alphabet/syllables')}
    />
  )
}

function AlphabetLettersRoute() {
  const navigate = useNavigate()

  return (
    <AlphabetStudyScreen
      mode="letters"
      onBackPress={() => navigate('/alphabet')}
      onLearnPress={() => navigate('/alphabet/letters/learn')}
      onPronunciationPress={() => navigate('/alphabet/letters/pronunciation')}
      onTypingPress={() => navigate('/alphabet/letters/typing')}
      onTestPress={() => navigate('/alphabet/letters/test')}
    />
  )
}

function AlphabetLettersLearnRoute() {
  const navigate = useNavigate()

  return (
    <AlphabetLearnScreen
      onBackPress={() => navigate('/alphabet/letters')}
    />
  )
}

function AlphabetLettersPronunciationRoute() {
  const navigate = useNavigate()

  return (
    <AlphabetPronunciationScreen
      onBackPress={() => navigate('/alphabet/letters')}
    />
  )
}

function AlphabetLettersTypingRoute() {
  const navigate = useNavigate()

  return (
    <AlphabetTypingScreen
      onBackPress={() => navigate('/alphabet/letters')}
    />
  )
}

function AlphabetLettersTestRoute() {
  const navigate = useNavigate()

  return (
    <AlphabetTestScreen
      onBackPress={() => navigate('/alphabet/letters')}
      onClose={() => navigate('/alphabet/letters')}
    />
  )
}

function AlphabetSyllablesRoute() {
  const navigate = useNavigate()

  return (
    <AlphabetStudyScreen
      mode="syllables"
      onBackPress={() => navigate('/alphabet')}
      onLearnPress={() => navigate('/alphabet/syllables/learn')}
      onPronunciationPress={() => navigate('/alphabet/syllables/pronunciation')}
      onTypingPress={() => navigate('/alphabet/syllables/typing')}
      onTestPress={() => navigate('/alphabet/syllables/test')}
    />
  )
}

function AlphabetSyllablesLearnRoute() {
  const navigate = useNavigate()

  return (
    <AlphabetLearnScreen
      onBackPress={() => navigate('/alphabet/syllables')}
    />
  )
}

function AlphabetSyllablesPronunciationRoute() {
  const navigate = useNavigate()

  return (
    <AlphabetPronunciationScreen
      onBackPress={() => navigate('/alphabet/syllables')}
    />
  )
}

function AlphabetSyllablesTypingRoute() {
  const navigate = useNavigate()

  return (
    <AlphabetTypingScreen
      onBackPress={() => navigate('/alphabet/syllables')}
    />
  )
}

function AlphabetSyllablesTestRoute() {
  const navigate = useNavigate()

  return (
    <AlphabetTestScreen
      onBackPress={() => navigate('/alphabet/syllables')}
      onClose={() => navigate('/alphabet/syllables')}
    />
  )
}

// -------- FLASHCARD --------
function FlashcardRoute() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const levelId = parseInt(searchParams.get('level') || '1', 10)

  return (
    <FlashcardListScreen
      levelId={levelId}
      onTopicPress={(topicId) => {
        navigate(`/flashcard/study?topic=${topicId}`)
      }}
      onBackPress={() => navigate(`/menu-study?level=${levelId}`)}
      onFavoritesPress={() => {
        navigate('/flashcard/favorites')
      }}
      title={STUDY_PAGE_TITLES.FLASHCARD_LIST}
    />
  )
}

function FlashcardStudyRoute() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const topicId = searchParams.get('topic') || ''
  const topicTitle = topicId ? TOPIC_TITLES[topicId] || STUDY_PAGE_TITLES.FLASHCARD_STUDY : STUDY_PAGE_TITLES.FLASHCARD_STUDY

  return (
    <FlashcardStudyScreen
      title={topicTitle}
      topicId={topicId}
      onBackPress={() => navigate('/flashcard')}
      onLearnPress={() => {
        navigate(`/flashcard/learn?topic=${topicId}`)
      }}
      onQuizPress={() => {
        navigate(`/flashcard/quiz?topic=${topicId}`)
      }}
      onTestPress={() => {
        navigate(`/flashcard/test?topic=${topicId}`)
      }}
      onFavoritesPress={() => {
        navigate('/flashcard/favorites')
      }}
    />
  )
}

function FlashcardLearnRoute() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const topicId = searchParams.get('topic') || ''
  const topicTitle = topicId ? TOPIC_TITLES[topicId] || STUDY_PAGE_TITLES.FLASHCARD_STUDY : STUDY_PAGE_TITLES.FLASHCARD_STUDY

  return (
    <LearnScreen
      topicId={topicId}
      title={`Học ${topicTitle}`}
      onBackPress={() => navigate(`/flashcard/study?topic=${topicId}`)}
    />
  )
}

function FlashcardTestRoute() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const topicId = searchParams.get('topic') || ''
  const topicTitle = topicId ? TOPIC_TITLES[topicId] || STUDY_PAGE_TITLES.FLASHCARD_STUDY : STUDY_PAGE_TITLES.FLASHCARD_STUDY

  return (
    <TestScreen
      topicId={topicId}
      title={`Kiểm tra ${topicTitle}`}
      forceAnswerMode="mix"
      onBackPress={() => navigate(`/flashcard/study?topic=${topicId}`)}
      onClose={() => navigate(`/flashcard/study?topic=${topicId}`)}
    />
  )
}

function FlashcardQuizRoute() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const topicId = searchParams.get('topic') || ''
  const topicTitle = topicId
    ? TOPIC_TITLES[topicId] || STUDY_PAGE_TITLES.FLASHCARD_STUDY
    : STUDY_PAGE_TITLES.FLASHCARD_STUDY

  return (
    <TestScreen
      topicId={topicId}
      title={`Học trắc nghiệm ${topicTitle}`}
      onBackPress={() => navigate(`/flashcard/study?topic=${topicId}`)}
      onClose={() => navigate(`/flashcard/study?topic=${topicId}`)}
      enableParts={true}
      questionsPerPart={10}
    />
  )
}

function FlashcardFavoritesRoute() {
  const navigate = useNavigate()

  return (
    <FlashcardStudyScreen
      title="Từ vựng yêu thích"
      topicId={null}
      isFavoritesMode
      onBackPress={() => navigate('/flashcard')}
      onLearnPress={() => {
        navigate('/flashcard/favorites/learn')
      }}
      onTestPress={() => {
        navigate('/flashcard/favorites/test')
      }}
      onFavoritesPress={undefined}
    />
  )
}

function FlashcardFavoritesLearnRoute() {
  const navigate = useNavigate()

  return (
    <LearnScreen
      topicId={null}
      isFavoritesMode
      title="Học Từ Vựng Yêu Thích"
      onBackPress={() => navigate('/flashcard/favorites')}
    />
  )
}

function FlashcardFavoritesTestRoute() {
  const navigate = useNavigate()

  return (
    <TestScreen
      topicId={null}
      isFavoritesMode={true}
      title="Kiểm tra Từ Vựng Yêu Thích"
      forceAnswerMode="mix"
      onBackPress={() => navigate('/flashcard/favorites')}
      onClose={() => navigate('/flashcard/favorites')}
    />
  )
}

function LeaderboardRoute() {
  return <LeaderboardScreen />
}

// -------- ROADMAP --------
function RoadmapTestRoute() {
  const [searchParams] = useSearchParams()
  const level = parseInt(searchParams.get('level') || '1', 10)
  return <RoadmapTestLayout level={level} />
}

// -------- MINIGAME --------
function MatchingCardRuleRoute() {
  const [searchParams] = useSearchParams()
  const levelId = searchParams.get('level') || ''
  return <MatchingCardRuleScreen levelId={levelId} />
}

function MatchingCardTopicRoute() {
  return <MatchingCardTopicScreen />
}

function MatchingCardLevelRoute() {
  return <MatchingCardLevelScreen />
}

function MatchingCardPlayRoute() {
  const [searchParams] = useSearchParams()
  const topicId = searchParams.get('topic') || ''
  const topicName = searchParams.get('topicName') || undefined
  const levelId = searchParams.get('level') || 'medium'
  const quantityParam = searchParams.get('quantity')
  const quantity = quantityParam ? Number(quantityParam) : null

  if (!topicId) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <p>Vui lòng chọn chủ đề trước khi chơi</p>
      </div>
    )
  }

  return <MatchingCardScreen topicId={topicId} topicName={topicName} levelId={levelId} quantity={quantity} />
}

function MatchingCardResultRoute() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const topicId = searchParams.get('topic') || 'life'
  const topicName = searchParams.get('topicName') || undefined
  const score = Number(searchParams.get('score') || 0)
  const topPercent = Number(searchParams.get('top') || 5)
  const timeLeft = Number(searchParams.get('time') || 0)

  const handleReplay = () => {
    navigate('/minigame')
  }

  return (
    <MatchingCardResultScreen
      topicId={topicId}
      topicName={topicName}
      score={score}
      topPercent={topPercent}
      timeLeft={timeLeft}
      onBack={handleReplay}
    />
  )
}

// -------- PAYMENT --------
function PaymentDetailRoute() {
  return <PaymentScreen />
}

function PaymentPackageRoute() {
  return <PackageScreen />
}

function PaymentPremiumRoute() {
  return <PremiumScreen />
}

function PaymentFailedRoute() {
  return <PaymentFailedScreen />
}

function PaymentSuccessRoute() {
  return <PaymentSuccessScreen />
}

// -------- BLOG --------
function BlogListRoute() {
  return <BlogListScreen />
}

function BlogDetailRoute() {
  return <BlogDetailScreen />
}

// -------- USER / STAFF --------
function ProfileRoute() {
  return <UserProfileScreen />
}

function StaffRoute() {
  return <StaffScreen />
}

// -------- ADMIN --------
function AdminRoute() {
  return <AdminScreen />
}

function AdminLessonCreateRoute() {
  return <CreateLessonScreen />
}

function AdminLessonDetailRoute() {
  return <LessonDetailScreen />
}

function AdminBlogCreateRoute() {
  return <CreateBlogScreen />
}

function AdminBlogDetailRoute() {
  return <AdminBlogDetailScreen />
}

function AdminUserDetailRoute() {
  return <UserDetailScreen />
}

function AdminUserCreateRoute() {
  return <CreateUserScreen />
}

function AdminCreateAdminStaffRoute() {
  return <CreateAdminStaffScreen />
}

function AdminVocabTopicDetailRoute() {
  return <FlashcardTopicDetailScreen />
}

function AdminVocabDetailRoute() {
  return <VocabularyDetailScreen />
}

function AdminVocabCreateRoute() {
  return <CreateVocabularyScreen />
}

// -------- ROOT HOME (app/page.tsx) --------
function RootHomeRoute() {
  const navigate = useNavigate()

  return (
    <HomeScreen
      onHomePress={() => navigate('/')}
      onRoadmapPress={() => navigate('/roadmap')}
      onFlashcardPress={() => navigate('/flashcard')}
      onBlogPress={() => navigate('/blog')}
      onProfilePress={() => navigate('/profile')}
    />
  )
}

function App() {
  return (
    <QueryProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            {/* Root & homepage */}
            <Route path="/" element={<RootHomeRoute />} />
            <Route path="/homepage" element={<HomeScreen />} />

            {/* Auth */}
            <Route path="/login" element={<LoginRoute />} />
            <Route path="/register" element={<RegisterRoute />} />
            <Route path="/authentication/forgot-password" element={<ForgotPasswordRoute />} />

            {/* Study & menu */}
            <Route path="/study" element={<StudyRoute />} />
            <Route path="/menu-study" element={<MenuStudyRoute />} />

            {/* Alphabet */}
            <Route path="/alphabet" element={<AlphabetRoute />} />
            <Route path="/alphabet/letters" element={<AlphabetLettersRoute />} />
            <Route path="/alphabet/letters/learn" element={<AlphabetLettersLearnRoute />} />
            <Route path="/alphabet/letters/pronunciation" element={<AlphabetLettersPronunciationRoute />} />
            <Route path="/alphabet/letters/typing" element={<AlphabetLettersTypingRoute />} />
            <Route path="/alphabet/letters/test" element={<AlphabetLettersTestRoute />} />
            <Route path="/alphabet/syllables" element={<AlphabetSyllablesRoute />} />
            <Route path="/alphabet/syllables/learn" element={<AlphabetSyllablesLearnRoute />} />
            <Route path="/alphabet/syllables/pronunciation" element={<AlphabetSyllablesPronunciationRoute />} />
            <Route path="/alphabet/syllables/typing" element={<AlphabetSyllablesTypingRoute />} />
            <Route path="/alphabet/syllables/test" element={<AlphabetSyllablesTestRoute />} />

            {/* Flashcard */}
            <Route path="/flashcard" element={<FlashcardRoute />} />
            <Route path="/flashcard/study" element={<FlashcardStudyRoute />} />
            <Route path="/flashcard/learn" element={<FlashcardLearnRoute />} />
            <Route path="/flashcard/quiz" element={<FlashcardQuizRoute />} />
            <Route path="/flashcard/test" element={<FlashcardTestRoute />} />
            <Route path="/flashcard/favorites" element={<FlashcardFavoritesRoute />} />
            <Route path="/flashcard/favorites/learn" element={<FlashcardFavoritesLearnRoute />} />
            <Route path="/flashcard/favorites/test" element={<FlashcardFavoritesTestRoute />} />

            {/* Roadmap */}
            <Route path="/roadmap/info" element={<RoadmapInfoScreen />} />
            <Route path="/roadmap/test" element={<RoadmapTestRoute />} />

            {/* Minigame */}
            <Route path="/minigame" element={<MinigameScreen />} />
            <Route path="/minigame/matching-card/matching-card-level" element={<MatchingCardLevelRoute />} />
            <Route path="/minigame/matching-card/matching-card-topic" element={<MatchingCardTopicRoute />} />
            <Route path="/minigame/matching-card/matching-card-rule" element={<MatchingCardRuleRoute />} />
            <Route path="/minigame/matching-card/matching-card-play" element={<MatchingCardPlayRoute />} />
            <Route path="/minigame/matching-card/matching-card-result" element={<MatchingCardResultRoute />} />

            {/* Payment */}
            <Route path="/payment/detail" element={<PaymentDetailRoute />} />
            <Route path="/payment/package" element={<PaymentPackageRoute />} />
            <Route path="/payment/premium" element={<PaymentPremiumRoute />} />
            <Route path="/payment/failed" element={<PaymentFailedRoute />} />
            <Route path="/payment/success" element={<PaymentSuccessRoute />} />

            {/* Leaderboard */}
            <Route path="/leaderboard" element={<LeaderboardRoute />} />

            {/* Blog */}
            <Route path="/blog" element={<BlogListRoute />} />
            <Route path="/blog/:slug" element={<BlogDetailRoute />} />

            {/* User / staff */}
            <Route path="/profile" element={<ProfileRoute />} />
            <Route path="/staff" element={<StaffRoute />} />
            <Route path="/users/:userId" element={<ProfileRoute />} />

            {/* Admin */}
            <Route path="/admin" element={<AdminRoute />} />
            <Route path="/admin/lessons/create" element={<AdminLessonCreateRoute />} />
            <Route path="/admin/lessons/:id" element={<AdminLessonDetailRoute />} />
            <Route path="/admin/blog/create" element={<AdminBlogCreateRoute />} />
            <Route path="/admin/blog/:id" element={<AdminBlogDetailRoute />} />
            <Route path="/admin/users/create" element={<AdminUserCreateRoute />} />
            <Route path="/admin/users/create-admin-staff" element={<AdminCreateAdminStaffRoute />} />
            <Route path="/admin/users/:id" element={<AdminUserDetailRoute />} />
            <Route path="/admin/vocab-topic/:id" element={<AdminVocabTopicDetailRoute />} />
            <Route path="/admin/vocab/create" element={<AdminVocabCreateRoute />} />
            <Route path="/admin/vocab/:id" element={<AdminVocabDetailRoute />} />

            {/* Error / test */}
            <Route path="/error" element={<ErrorScreen />} />
            <Route path="/test-layout" element={<TestLayout />} />
            {/* test page dev: giữ nguyên UI demo, nếu cần bạn có thể thêm route riêng ở đây */}
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </QueryProvider>
  )
}

export default App
