import React from 'react'
import { Route, Outlet, useLocation } from 'react-router-dom'
import { useRouteNavigation } from './utils/navigation-helpers'

import { HomeScreen } from '@tokki/app/features/general/screens/homepage-screen'
import { PackageScreen } from '@tokki/app/features/payment/screens/package-screen'
import { PremiumScreen } from '@tokki/app/features/payment/screens/premium-screen'
import { PaymentScreen } from '@tokki/app/features/payment/screens/payment-screen'
import { PaymentFailedScreen } from '@tokki/app/features/payment/screens/payment-failed-screen'
import { PaymentSuccessScreen } from '@tokki/app/features/payment/screens/payment-success-screen'
import { ErrorScreen } from '@tokki/app/features/general/screens/error-screen'
import LeaderboardScreen from '@tokki/app/features/general/screens/leaderboard-screen'
import { BlogListScreen } from '@tokki/app/features/blog/screens/client/blog-list-screen'
import { BlogDetailScreen } from '@tokki/app/features/blog/screens/client/blog-detail-screen'
import { BlogManagementScreen } from '@tokki/app/features/blog/screens/client/blog-management-screen'
import { BlogEditorScreen } from '@tokki/app/features/blog/screens/client/blog-editor-screen'
import { BlogPreviewScreen } from '@tokki/app/features/blog/screens/client/blog-preview-screen'
import UserScreen from '@tokki/app/features/user/screens/client/user-profile-screen'
import { MinigameScreen } from '@tokki/app/features/minigame/screens/minigame-screen'
import MatchingCardLevelScreen from '@tokki/app/features/minigame/screens/matching-card/matching-card-level-screen'
import MatchingCardTopicScreen from '@tokki/app/features/minigame/screens/matching-card/matching-card-topic-screen'
import MatchingCardRuleScreen from '@tokki/app/features/minigame/screens/matching-card/matching-card-rule-screen'
import MatchingCardScreen from '@tokki/app/features/minigame/screens/matching-card/matching-card-screen'
import MatchingCardResultScreen from '@tokki/app/features/minigame/screens/matching-card/matching-card-result-screen'
import { SolitareRuleScreen } from '@tokki/app/features/minigame/screens/solitare/solitare-rule-screen'
import SolitarePlayScreen from '@tokki/app/features/minigame/screens/solitare/solitare-play-screen'
import { SolitarePlayWeb } from '@tokki/app/features/minigame/components/solitare/solitare-play/solitare-play-web/solitare-play-web'
import { SolitareResultScreen } from '@tokki/app/features/minigame/screens/solitare/solitare-result-screen'
import { WordleRuleScreen } from '@tokki/app/features/minigame/screens/wordle/wordle-rule-screen'
import { WordlePlayScreen } from '@tokki/app/features/minigame/screens/wordle/wordle-play-screen'
import { WordleBoardScreen } from '@tokki/app/features/minigame/screens/wordle/wordle-board-screen'
import { DictionarySearchScreen } from '@tokki/app/features/vocabulary/screens/client/dictionary-search-screen'
import { DictionaryVocabularyDetailScreen } from '@tokki/app/features/vocabulary/screens/client/dictionary-detail-screen'
import { Navbar } from 'components/navbar'
import { Footer } from 'components/footer'
import { AppShow } from 'components/appShow'
import BubbleChat from '@tokki/app/features/general/api/bubble-chat-index'
import { View, Platform, ScrollView } from 'react-native'
import { useParams } from 'react-router-dom'
import { getCurrentUserId } from '@tokki/app/provider/api/client'

/**
 * Public Routes - Container Components
 */
function RootHomeRoute() {
  const { navigate } = useRouteNavigation()

  const handleFlashcardPress = () => {
    const userId = getCurrentUserId()
    if (!userId) {
      navigate('/login?redirect=/flashcard')
    } else {
      navigate('/flashcard')
    }
  }

  const handleProfilePress = () => {
    const userId = getCurrentUserId()
    if (!userId) {
      navigate('/login?redirect=/profile')
    } else {
      navigate('/profile')
    }
  }

  return (
    <HomeScreen
      onHomePress={() => navigate('/')}
      onRoadmapPress={() => navigate('/roadmap/info')}
      onFlashcardPress={handleFlashcardPress}
      onBlogPress={() => navigate('/blog')}
      onProfilePress={handleProfilePress}
    />
  )
}

function ProfileRoute() {
  const { navigate } = useRouteNavigation()

  React.useEffect(() => {
    const userId = getCurrentUserId()
    if (!userId) {
      navigate('/login?redirect=/profile', { replace: true })
    }
  }, [navigate])

  const userId = getCurrentUserId()
  if (!userId) return null

  return <UserScreen />
}

function LeaderboardRoute() {
  return <LeaderboardScreen />
}

function BlogListRoute() {
  const { navigate } = useRouteNavigation()

  return (
    <BlogListScreen
      onBlogPress={(blog) => navigate(`/blog/${blog?.slug || blog?.id}`)}
      onCategoryPress={(category) => console.log('Category press', category)}
    />
  )
}

function BlogDetailRoute() {
  return <BlogDetailScreen />
}

function BlogManagementRoute() {
  const { navigate } = useRouteNavigation()

  React.useEffect(() => {
    const userId = getCurrentUserId()
    if (!userId) {
      navigate('/login?redirect=/blog/management', { replace: true })
    }
  }, [navigate])

  return <BlogManagementScreen />
}

function BlogEditorRoute() {
  const { navigate } = useRouteNavigation()

  React.useEffect(() => {
    const userId = getCurrentUserId()
    if (!userId) {
      const currentPath = window.location.pathname
      navigate(`/login?redirect=${currentPath}`, { replace: true })
    }
  }, [navigate])

  return <BlogEditorScreen />
}

function BlogPreviewRoute() {
  return <BlogPreviewScreen />
}

function PaymentDetailRoute() {
  const { navigate } = useRouteNavigation()
  return <PaymentScreen onBackPress={() => navigate('/')} onPaymentSuccess={() => navigate('/payment-success')} />
}

function PaymentPackageRoute() {
  const { navigate } = useRouteNavigation()
  return <PackageScreen onBackPress={() => navigate('/')} />
}

function PaymentPremiumRoute() {
  const { navigate } = useRouteNavigation()
  return <PremiumScreen onBackPress={() => navigate('/')} />
}

function PaymentFailedRoute() {
  const { navigate } = useRouteNavigation()
  return <PaymentFailedScreen onHomePress={() => navigate('/')} />
}

function PaymentSuccessRoute() {
  const { navigate } = useRouteNavigation()
  return <PaymentSuccessScreen onHomePress={() => navigate('/')} />
}

// Minigame Routes
function MatchingCardPlayRoute() {
  const { getQueryParam, navigate } = useRouteNavigation()
  const topicId = getQueryParam('topic')
  const topicName = getQueryParam('topicName') || undefined
  const levelId = getQueryParam('level') || 'medium'
  const quantityParam = getQueryParam('quantity')
  const quantity = quantityParam ? Number(quantityParam) : null

  if (!topicId) {
    return (
      <View style={{ padding: 20, alignItems: 'center' }}>
        <p>Vui lòng chọn chủ đề trước khi chơi</p>
      </View>
    )
  }

  return (
    <MatchingCardScreen
      topicId={topicId}
      topicName={topicName}
      levelId={levelId}
      quantity={quantity}
      onBack={() => navigate('/minigame')}
    />
  )
}

function MatchingCardResultRoute() {
  const { navigate, getQueryParam } = useRouteNavigation()

  const gameId = getQueryParam('gameId')
  const topicId = getQueryParam('topic') || 'life'
  const topicName = getQueryParam('topicName') || undefined
  const levelId = getQueryParam('level') || 'medium'
  const score = Number(getQueryParam('score') || '0')
  const topPercent = Number(getQueryParam('top') || '5')
  const timeLeft = Number(getQueryParam('time') || '0')
  const hasPlayed = getQueryParam('hasPlayed') === 'true'

  const handleReplay = () => {
    navigate('/minigame')
  }

  return (
    <MatchingCardResultScreen
      gameId={gameId}
      topicId={topicId}
      topicName={topicName}
      levelId={levelId}
      score={score}
      topPercent={topPercent}
      timeLeft={timeLeft}
      hasPlayed={hasPlayed}
      onBack={handleReplay}
    />
  )
}

function MatchingCardLevelRoute() {
  const { getQueryParam } = useRouteNavigation()
  const levelId = getQueryParam('level')
  return <MatchingCardLevelScreen levelId={levelId} />
}

function MatchingCardTopicRoute() {
  return <MatchingCardTopicScreen />
}

function MatchingCardRuleRoute() {
  const { getQueryParam } = useRouteNavigation()
  const levelId = getQueryParam('level')
  return <MatchingCardRuleScreen levelId={levelId} />
}

// Solitare Routes
function SolitareRuleRoute() {
  const { getQueryParam } = useRouteNavigation()
  const levelId = getQueryParam('level')
  return <SolitareRuleScreen levelId={levelId} />
}

function SolitarePlayRoute() {
  const { navigate } = useRouteNavigation()

  const handleFinish = (score, timeLeft) => {
    navigate(`/minigame/solitare/solitare-result?score=${score}&time=${timeLeft}`)
  }

  return <SolitarePlayScreen onFinish={handleFinish} />
}

function SolitareResultRoute() {
  const { navigate, getQueryParam } = useRouteNavigation()

  const score = Number(getQueryParam('score') || '0')
  const timeLeft = Number(getQueryParam('time') || '0')

  const handleReplay = () => {
    navigate('/minigame')
  }

  return <SolitareResultScreen score={score} timeLeft={timeLeft} onReplay={handleReplay} />
}

// Wordle Routes
function WordleRuleRoute() {
  const { getQueryParam, navigate } = useRouteNavigation()
  const levelId = getQueryParam('level')
  const gameId = getQueryParam('gameId')

  const handleStart = () => {
    navigate(`/minigame/wordle/wordle-play?level=${levelId || ''}&gameId=${gameId || ''}`)
  }

  return <WordleRuleScreen onStart={handleStart} />
}

function WordlePlayRoute() {
  return <WordlePlayScreen />
}

function WordleBoardRoute() {
  return <WordleBoardScreen />
}

// Dictionary Routes
function DictionaryRoute() {
  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <DictionarySearchScreen />
    </View>
  )
}

function DictionaryDetailRoute() {
  const { id } = useParams()

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <DictionaryVocabularyDetailScreen vocabularyId={id} />
    </View>
  )
}

/**
 * Public Routes Configuration
 */
export const publicRoutes = [
  // Home
  { path: '/', element: <RootHomeRoute /> },
  { path: '/homepage', element: <HomeScreen /> },

  // User Profile
  { path: '/profile', element: <ProfileRoute /> },
  { path: '/user-profile', element: <ProfileRoute /> },
  { path: '/user-profile/:tab', element: <ProfileRoute /> },
  { path: '/users/:userId', element: <ProfileRoute /> },

  // Blog
  { path: '/blog', element: <BlogListRoute /> },
  { path: '/blog/management', element: <BlogManagementRoute /> },
  { path: '/blog/management/preview/:id', element: <BlogPreviewRoute /> },
  { path: '/blog/create', element: <BlogEditorRoute /> },
  { path: '/blog/edit/:id', element: <BlogEditorRoute /> },
  { path: '/blog/:slug', element: <BlogDetailRoute /> },

  // Payment
  { path: '/payment-detail', element: <PaymentDetailRoute /> },
  { path: '/payment-package', element: <PaymentPackageRoute /> },
  { path: '/premium-package', element: <PaymentPremiumRoute /> },
  { path: '/payment-failed', element: <PaymentFailedRoute /> },
  { path: '/payment-success', element: <PaymentSuccessRoute /> },

  // Leaderboard
  { path: '/leaderboard', element: <LeaderboardRoute /> },

  // Minigame
  { path: '/minigame', element: <MinigameScreen /> },
  { path: '/minigame/matching-card/matching-card-level', element: <MatchingCardLevelRoute /> },
  { path: '/minigame/matching-card/matching-card-topic', element: <MatchingCardTopicRoute /> },
  { path: '/minigame/matching-card/matching-card-rule', element: <MatchingCardRuleRoute /> },
  { path: '/minigame/matching-card/matching-card-play', element: <MatchingCardPlayRoute /> },
  { path: '/minigame/matching-card/matching-card-result', element: <MatchingCardResultRoute /> },
  { path: '/minigame/solitare/solitare-rule', element: <SolitareRuleRoute /> },
  { path: '/minigame/solitare/solitare-play', element: <SolitarePlayRoute /> },
  { path: '/minigame/solitare/solitare-result', element: <SolitareResultRoute /> },

  // Wordle
  { path: '/minigame/wordle/wordle-rule', element: <WordleRuleRoute /> },
  { path: '/minigame/wordle/wordle-play', element: <WordlePlayRoute /> },
  { path: '/minigame/wordle/wordle-board', element: <WordleBoardRoute /> },

  // Dictionary
  { path: '/dictionary', element: <DictionaryRoute /> },
  { path: '/dictionary/:id', element: <DictionaryDetailRoute /> },

  // Error
  { path: '/error', element: <ErrorScreen /> },
]

/**
 * Public Layout Component
 */
export function PublicLayout() {
  const location = useLocation()
  const isRoadmapRoute = location.pathname.startsWith('/roadmap')
  const isStudyRoute = location.pathname.startsWith('/study')
  const isFlashcardRoute = location.pathname.startsWith('/flashcard')
  const isProfileRoute = location.pathname.startsWith('/user-profile') || location.pathname.startsWith('/profile') || location.pathname.startsWith('/users')
  const isBlogManagementRoute = location.pathname.startsWith('/blog/management') || location.pathname.startsWith('/blog/create') || location.pathname.startsWith('/blog/edit')
  const isPlayScreen =
    location.pathname.startsWith('/minigame/matching-card/matching-card-play') ||
    location.pathname.startsWith('/minigame/solitare/solitare-play') ||
    location.pathname.startsWith('/minigame/wordle/wordle-play')
  const isAlphabetRoute = location.pathname.startsWith('/alphabet')
  const isTopikRoute = location.pathname.startsWith('/topik')
  const isPaymentRoute = location.pathname.startsWith('/payment-package') || location.pathname.startsWith('/premium-package') || location.pathname.startsWith('/payment-detail') || location.pathname.startsWith('/payment-failed') || location.pathname.startsWith('/payment-success')
  const shouldHideFooter = isRoadmapRoute || isStudyRoute || isFlashcardRoute || isProfileRoute || isBlogManagementRoute || isPlayScreen || isAlphabetRoute || isTopikRoute || isPaymentRoute


  // Hide Navbar for specific distraction-free screens
  const query = new URLSearchParams(location.search)
  const hideNavbarParam = query.get('hideNavbar') === 'true'
  const isPracticePage = location.pathname.includes('/roadmap/learning/practice') || location.pathname.includes('/roadmap/practice-test')
  const isTestPage = location.pathname === '/roadmap/test'
  const isFlashcardStudyPage = location.pathname.startsWith('/flashcard/study') || 
                               location.pathname.startsWith('/flashcard/learn') || 
                               location.pathname.startsWith('/flashcard/favorites') || 
                               location.pathname.startsWith('/flashcard/quiz') || 
                               location.pathname.startsWith('/flashcard/test')
  const shouldHideNavbar = isPracticePage || isTestPage || isPlayScreen || hideNavbarParam || isFlashcardStudyPage

  return (
    <View style={{ flex: 1, height: shouldHideFooter ? '100vh' : undefined, minHeight: '100vh', backgroundColor: '#fff', overflow: shouldHideFooter ? 'auto' : 'visible' }}>
      {!shouldHideNavbar && <Navbar />}
      <View style={{ flex: 1, overflow: shouldHideFooter ? 'auto' : 'visible' }}>
        <Outlet />
      </View>
      {!shouldHideFooter && <Footer />}

      {/* Widgets only for Web */}
      {Platform.OS === 'web' && !shouldHideFooter && (
        <>
          <BubbleChat />
        </>
      )}
    </View>
  )
}

/**
 * Render Public Route Items (without layout wrapper)
 */
export function renderPublicRouteItems() {
  return publicRoutes.map((route) => (
    <Route key={route.path} path={route.path} element={route.element} />
  ))
}

/**
 * Render Public Routes (deprecated, use renderPublicRouteItems with a wrapper)
 */
export function renderPublicRoutes() {
  return (
    <Route element={<PublicLayout />}>
      {renderPublicRouteItems()}
    </Route>
  )
}
