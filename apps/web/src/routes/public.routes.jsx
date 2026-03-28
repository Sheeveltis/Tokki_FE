import React from 'react'
import { Route } from 'react-router-dom'
import { useRouteNavigation } from './utils/navigation-helpers'

import { HomeScreen } from '@tokki/app/features/general/screens/homepage-screen'
import { PackageScreen } from '@tokki/app/features/payment/screens/package-screen'
import { PremiumScreen } from '@tokki/app/features/payment/screens/premium-screen'
import { PaymentScreen } from '@tokki/app/features/payment/screens/payment-screen'
import { PaymentFailedScreen } from '@tokki/app/features/payment/screens/payment-failed-screen'
import { PaymentSuccessScreen } from '@tokki/app/features/payment/screens/payment-success-screen'
import { ErrorScreen } from 'app/features/general/screens/error-screen'
import LeaderboardScreen from '@tokki/app/features/general/screens/leaderboard-screen'
import { BlogListScreen } from '@tokki/app/features/blog/screens/client/blog-list-screen'
import { BlogDetailScreen } from '@tokki/app/features/blog/screens/client/blog-detail-screen'
import { UserScreen } from '@tokki/app/features/user/screens/client/user-profile-screen'
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

/**
 * Public Routes - Container Components
 */
function RootHomeRoute() {
  const { navigate } = useRouteNavigation()

  return (
    <HomeScreen
      onHomePress={() => navigate('/')}
      onRoadmapPress={() => navigate('/menu-study?level=1')}
      onFlashcardPress={() => navigate('/flashcard')}
      onBlogPress={() => navigate('/blog')}
      onProfilePress={() => navigate('/profile')}
    />
  )
}

function ProfileRoute() {
  return <UserScreen />
}

function LeaderboardRoute() {
  return <LeaderboardScreen />
}

function BlogListRoute() {
  return <BlogListScreen />
}

function BlogDetailRoute() {
  return <BlogDetailScreen />
}

// Payment Routes
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

// Minigame Routes
function MatchingCardLevelRoute() {
  return <MatchingCardLevelScreen />
}

function MatchingCardTopicRoute() {
  return <MatchingCardTopicScreen />
}

function MatchingCardRuleRoute() {
  const { getQueryParam } = useRouteNavigation()
  const levelId = getQueryParam('level')
  return <MatchingCardRuleScreen levelId={levelId} />
}

function MatchingCardPlayRoute() {
  const { getQueryParam } = useRouteNavigation()
  const topicId = getQueryParam('topic')
  const topicName = getQueryParam('topicName') || undefined
  const levelId = getQueryParam('level') || 'medium'
  const quantityParam = getQueryParam('quantity')
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
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#FFD7D0',
      }}
    >
      <Navbar />
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: '70%',
            maxWidth: 1200,
            minWidth: 0,
          }}
        >
          <DictionarySearchScreen />
        </div>
      </div>
    </div>
  )
}

function DictionaryDetailRoute() {
  const { params } = useRouteNavigation()
  const id = params.id

  if (!id) {
    return <DictionaryRoute />
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#FFD7D0',
      }}
    >
      <Navbar />
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: '70%',
            maxWidth: 1200,
            minWidth: 0,
          }}
        >
          <DictionaryVocabularyDetailScreen vocabularyId={id} />
        </div>
      </div>
    </div>
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
 * Render Public Routes
 */
export function renderPublicRoutes() {
  return publicRoutes.map((route) => (
    <Route key={route.path} path={route.path} element={route.element} />
  ))
}
