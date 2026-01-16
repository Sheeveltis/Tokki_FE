import React, { useEffect, useState, Suspense, lazy } from 'react'
import { Route } from 'react-router-dom'
import { useRouteNavigation } from './utils/navigation-helpers'
import { createLazyRouteContainer } from './utils/route-container'

import { StudyScreen } from '@tokki/app/features/study/screen'
import { MenuStudy } from '@tokki/app/features/study/menu-study'
import AlphabetSelectModeScreen from '@tokki/app/features/alphabet/screens/client/alphabet-select-mode-screen'
import AlphabetStudyScreen from '@tokki/app/features/alphabet/screens/client/alphabet-study-screen'
import AlphabetLearnScreen from '@tokki/app/features/alphabet/screens/client/alphabet-learn-screen'
import AlphabetTypingScreen from '@tokki/app/features/alphabet/screens/client/alphabet-typing-screen'
import AlphabetPronunciationScreen from '@tokki/app/features/alphabet/screens/client/alphabet-pronunciation-screen'
import { AlphabetTestScreen } from '@tokki/app/features/alphabet/screens/client/alphabet-test-screen'
import TestScreen from '@tokki/app/features/study/flashcard-test'

import FlashcardListScreen from '@tokki/app/features/study/flashcard-list'
import FlashcardStudyScreen from '@tokki/app/features/study/flashcard-study'
import LearnScreen from '@tokki/app/features/study/flashcard-learn'

import { STUDY_PAGE_TITLES, TOPIC_TITLES } from '@tokki/app/features/study/constants'
import { RoadmapInfoScreen } from '@tokki/app/features/roadmap/roadmap-info/roadmap-info-screen'
import { RoadmapTestLayout } from '@tokki/app/features/roadmap/roadmap-test/components/roadmap-test-layout.web'

const AlphabetDrawingScreen = lazy(() => import('@tokki/app/features/alphabet/screens/client/alphabet-drawing-screen'))

/**
 * Study Routes - Container Components
 */
function StudyRoute() {
  const { navigate } = useRouteNavigation()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const storedLevel = typeof window !== 'undefined'
      ? window.localStorage.getItem('userLevel')
      : null

    if (storedLevel) {
      navigate(`/menu-study?level=${storedLevel}`, { replace: true })
    } else {
      setReady(true)
    }
  }, [navigate])

  if (!ready) return null

  return (
    <StudyScreen
      title={STUDY_PAGE_TITLES.STUDY}
      onSelectLevel={(levelId) => navigate(`/menu-study?level=${levelId}`)}
      onQuickTestPress={() => navigate('/test')}
      lessonsLearned={30}
      streakDays={30}
    />
  )
}

function MenuStudyRoute() {
  const { navigate, getIntQueryParam } = useRouteNavigation()
  const levelId = getIntQueryParam('level', 1)

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

// Alphabet Routes
function AlphabetRoute() {
  const { navigate } = useRouteNavigation()

  return (
    <AlphabetSelectModeScreen
      onBackPress={() => navigate('/menu-study?level=1')}
      onLettersPress={() => navigate('/alphabet/letters')}
      onSyllablesPress={() => navigate('/alphabet/syllables')}
    />
  )
}

function AlphabetLettersRoute() {
  const { navigate } = useRouteNavigation()

  return (
    <AlphabetStudyScreen
      mode="letters"
      onBackPress={() => navigate('/alphabet')}
      onLearnPress={() => navigate('/alphabet/letters/learn')}
      onPronunciationPress={() => navigate('/alphabet/letters/pronunciation')}
      onTypingPress={() => navigate('/alphabet/letters/typing')}
      onDrawingPress={() => navigate('/alphabet/letters/drawing')}
      onTestPress={() => navigate('/alphabet/letters/test')}
    />
  )
}

function AlphabetSyllablesRoute() {
  const { navigate } = useRouteNavigation()

  return (
    <AlphabetStudyScreen
      mode="syllables"
      onBackPress={() => navigate('/alphabet')}
      onLearnPress={() => navigate('/alphabet/syllables/learn')}
      onPronunciationPress={() => navigate('/alphabet/syllables/pronunciation')}
      onTypingPress={() => navigate('/alphabet/syllables/typing')}
      onDrawingPress={() => navigate('/alphabet/syllables/drawing')}
      onTestPress={() => navigate('/alphabet/syllables/test')}
    />
  )
}

function AlphabetLettersLearnRoute() {
  const { navigate } = useRouteNavigation()
  return <AlphabetLearnScreen onBackPress={() => navigate('/alphabet/letters')} />
}

function AlphabetLettersPronunciationRoute() {
  const { navigate } = useRouteNavigation()
  return <AlphabetPronunciationScreen onBackPress={() => navigate('/alphabet/letters')} />
}

function AlphabetLettersTypingRoute() {
  const { navigate } = useRouteNavigation()
  return <AlphabetTypingScreen onBackPress={() => navigate('/alphabet/letters')} />
}

function AlphabetLettersTestRoute() {
  const { navigate } = useRouteNavigation()
  return (
    <AlphabetTestScreen
      onBackPress={() => navigate('/alphabet/letters')}
      onClose={() => navigate('/alphabet/letters')}
    />
  )
}

function AlphabetSyllablesLearnRoute() {
  const { navigate } = useRouteNavigation()
  return <AlphabetLearnScreen onBackPress={() => navigate('/alphabet/syllables')} />
}

function AlphabetSyllablesPronunciationRoute() {
  const { navigate } = useRouteNavigation()
  return <AlphabetPronunciationScreen onBackPress={() => navigate('/alphabet/syllables')} />
}

function AlphabetSyllablesTypingRoute() {
  const { navigate } = useRouteNavigation()
  return <AlphabetTypingScreen onBackPress={() => navigate('/alphabet/syllables')} />
}

function AlphabetSyllablesTestRoute() {
  const { navigate } = useRouteNavigation()
  return (
    <AlphabetTestScreen
      onBackPress={() => navigate('/alphabet/syllables')}
      onClose={() => navigate('/alphabet/syllables')}
    />
  )
}

// Flashcard Routes
function FlashcardRoute() {
  const { navigate, getIntQueryParam } = useRouteNavigation()
  const levelId = getIntQueryParam('level', 1)

  return (
    <FlashcardListScreen
      levelId={levelId}
      onTopicPress={(topicId) => navigate(`/flashcard/study?topic=${topicId}`)}
      onBackPress={() => navigate(`/menu-study?level=${levelId}`)}
      onFavoritesPress={() => navigate('/flashcard/favorites')}
      title={STUDY_PAGE_TITLES.FLASHCARD_LIST}
    />
  )
}

function FlashcardStudyRoute() {
  const { navigate, getQueryParam } = useRouteNavigation()
  const topicId = getQueryParam('topic')
  const topicTitle = topicId ? TOPIC_TITLES[topicId] || STUDY_PAGE_TITLES.FLASHCARD_STUDY : STUDY_PAGE_TITLES.FLASHCARD_STUDY

  return (
    <FlashcardStudyScreen
      title={topicTitle}
      topicId={topicId}
      onBackPress={() => navigate('/flashcard')}
      onLearnPress={() => navigate(`/flashcard/learn?topic=${topicId}`)}
      onQuizPress={() => navigate(`/flashcard/quiz?topic=${topicId}`)}
      onTestPress={() => navigate(`/flashcard/test?topic=${topicId}`)}
      onFavoritesPress={() => navigate('/flashcard/favorites')}
    />
  )
}

function FlashcardLearnRoute() {
  const { navigate, getQueryParam } = useRouteNavigation()
  const topicId = getQueryParam('topic')
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
  const { navigate, getQueryParam } = useRouteNavigation()
  const topicId = getQueryParam('topic')
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
  const { navigate, getQueryParam } = useRouteNavigation()
  const topicId = getQueryParam('topic')
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
  const { navigate } = useRouteNavigation()

  return (
    <FlashcardStudyScreen
      title="Từ vựng yêu thích"
      topicId={null}
      isFavoritesMode
      onBackPress={() => navigate('/flashcard')}
      onLearnPress={() => navigate('/flashcard/favorites/learn')}
      onTestPress={() => navigate('/flashcard/favorites/test')}
      onFavoritesPress={undefined}
    />
  )
}

function FlashcardFavoritesLearnRoute() {
  const { navigate } = useRouteNavigation()

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
  const { navigate } = useRouteNavigation()

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

// Roadmap Routes
function RoadmapTestRoute() {
  const { getIntQueryParam } = useRouteNavigation()
  const level = getIntQueryParam('level', 1)
  return <RoadmapTestLayout level={level} />
}

function AlphabetLettersDrawingRoute() {
  const { navigate } = useRouteNavigation()
  const LazyComponent = lazy(() => import('@tokki/app/features/alphabet/screens/client/alphabet-drawing-screen'))
  
  return (
    <Suspense fallback={<div>Đang tải màn vẽ chữ...</div>}>
      <LazyComponent onBackPress={() => navigate('/alphabet/letters')} />
    </Suspense>
  )
}

function AlphabetSyllablesDrawingRoute() {
  const { navigate } = useRouteNavigation()
  const LazyComponent = lazy(() => import('@tokki/app/features/alphabet/screens/client/alphabet-drawing-screen'))
  
  return (
    <Suspense fallback={<div>Đang tải màn vẽ chữ...</div>}>
      <LazyComponent onBackPress={() => navigate('/alphabet/syllables')} />
    </Suspense>
  )
}

/**
 * Study Routes Configuration
 */
export const studyRoutes = [
  // Study & Menu
  { path: '/study', element: <StudyRoute /> },
  { path: '/menu-study', element: <MenuStudyRoute /> },

  // Alphabet
  { path: '/alphabet', element: <AlphabetRoute /> },
  { path: '/alphabet/letters', element: <AlphabetLettersRoute /> },
  { path: '/alphabet/letters/drawing', element: <AlphabetLettersDrawingRoute /> },
  { path: '/alphabet/letters/learn', element: <AlphabetLettersLearnRoute /> },
  { path: '/alphabet/letters/pronunciation', element: <AlphabetLettersPronunciationRoute /> },
  { path: '/alphabet/letters/typing', element: <AlphabetLettersTypingRoute /> },
  { path: '/alphabet/letters/test', element: <AlphabetLettersTestRoute /> },
  { path: '/alphabet/syllables', element: <AlphabetSyllablesRoute /> },
  { path: '/alphabet/syllables/drawing', element: <AlphabetSyllablesDrawingRoute /> },
  { path: '/alphabet/syllables/learn', element: <AlphabetSyllablesLearnRoute /> },
  { path: '/alphabet/syllables/pronunciation', element: <AlphabetSyllablesPronunciationRoute /> },
  { path: '/alphabet/syllables/typing', element: <AlphabetSyllablesTypingRoute /> },
  { path: '/alphabet/syllables/test', element: <AlphabetSyllablesTestRoute /> },

  // Flashcard
  { path: '/flashcard', element: <FlashcardRoute /> },
  { path: '/flashcard/study', element: <FlashcardStudyRoute /> },
  { path: '/flashcard/learn', element: <FlashcardLearnRoute /> },
  { path: '/flashcard/quiz', element: <FlashcardQuizRoute /> },
  { path: '/flashcard/test', element: <FlashcardTestRoute /> },
  { path: '/flashcard/favorites', element: <FlashcardFavoritesRoute /> },
  { path: '/flashcard/favorites/learn', element: <FlashcardFavoritesLearnRoute /> },
  { path: '/flashcard/favorites/test', element: <FlashcardFavoritesTestRoute /> },

  // Roadmap
  { path: '/roadmap/info', element: <RoadmapInfoScreen /> },
  { path: '/roadmap/test', element: <RoadmapTestRoute /> },
]

/**
 * Render Study Routes
 */
export function renderStudyRoutes() {
  return studyRoutes.map((route) => (
    <Route key={route.path} path={route.path} element={route.element} />
  ))
}
