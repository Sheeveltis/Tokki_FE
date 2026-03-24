import React, { useEffect, useState, Suspense, lazy } from 'react'
import { Route, useParams } from 'react-router-dom'
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
import FlashcardFirstLearnScreen from '@tokki/app/features/study/flashcard-first-learn'
import FlashcardStudyScreen from '@tokki/app/features/study/flashcard-study'
import LearnScreen from '@tokki/app/features/study/flashcard-learn'
import LearnedVocabularyListScreen from '@tokki/app/features/study/learned-vocabulary-list'
import { PronunciationRulesScreen } from '@tokki/app/features/pronunciation/screens/pronunciation-rules-screen'
import { PronunciationExamplesScreen } from '@tokki/app/features/pronunciation/screens/pronunciation-examples-screen'
import { PronunciationExampleDetailScreen } from '@tokki/app/features/pronunciation/screens/pronunciation-example-detail-screen'

import { STUDY_PAGE_TITLES, TOPIC_TITLES } from '@tokki/app/features/study/constants'
import { RoadmapInfoScreen } from '@tokki/app/features/roadmap/screens/roadmap-info-screen'
import { RoadmapTestScreen } from '@tokki/app/features/roadmap/screens/roadmap-test-screen'
import { RoadmapTestResultScreen } from '@tokki/app/features/roadmap/screens/roadmap-test-result-screen'
import { RoadmapTestResultDetailScreen } from '@tokki/app/features/roadmap/screens/roadmap-test-result-detail-screen'
import { RoadmapLearningScreen } from '@tokki/app/features/roadmap/screens/roadmap-learning-screen'
import { RoadmapTipsScreen } from '@tokki/app/features/roadmap/screens/roadmap-tips-screen'
import { RoadmapPracticeScreen } from '@tokki/app/features/roadmap/screens/roadmap-practice-screen'
import { RoadmapPracticeTestScreen } from '@tokki/app/features/roadmap/screens/roadmap-practice-test-screen'
import { RoadmapGenerateScreen } from '@tokki/app/features/roadmap/screens/roadmap-generate-screen'
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
      onTopicPress={(topic) => {
        const topicId = topic?.id || topic?.topicId
        if (!topicId) return
        const progress = topic?.progress ?? 0
        const isProgressComplete = progress >= 100
        
        // Nếu progress === 100%, điều hướng đến trang study (FlashcardStudyScreen)
        if (isProgressComplete || topic?.isProgressComplete) {
          navigate(`/flashcard/study?topic=${topicId}`)
          return
        }
        // Ngược lại, điều hướng đến học lần đầu (FlashcardFirstLearnScreen)
        navigate(`/flashcard/learn?topic=${topicId}`)
      }}
      onBackPress={() => navigate(`/menu-study?level=${levelId}`)}
      onFavoritesPress={() => navigate('/flashcard/favorites')}
      onLearnedPress={() => navigate('/flashcard/learned')}
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
      onTestPress={() => navigate(`/flashcard/test?topic=${topicId}&noSubmit=1`)}
      onFavoritesPress={() => navigate('/flashcard/favorites')}
    />
  )
}

function FlashcardLearnRoute() {
  const { navigate, getQueryParam } = useRouteNavigation()
  const topicId = getQueryParam('topic')
  const topicTitle = topicId ? TOPIC_TITLES[topicId] || STUDY_PAGE_TITLES.FLASHCARD_STUDY : STUDY_PAGE_TITLES.FLASHCARD_STUDY

  return (
    <FlashcardFirstLearnScreen
      topicId={topicId}
      title={`Học ${topicTitle}`}
      onBackPress={() => navigate('/flashcard')}
    />
  )
}

function FlashcardTestRoute() {
  const { navigate, getQueryParam } = useRouteNavigation()
  const topicId = getQueryParam('topic')
  const noSubmit = getQueryParam('noSubmit')
  const topicTitle = topicId ? TOPIC_TITLES[topicId] || STUDY_PAGE_TITLES.FLASHCARD_STUDY : STUDY_PAGE_TITLES.FLASHCARD_STUDY

  return (
    <TestScreen
      topicId={topicId}
      title={`Kiểm tra ${topicTitle}`}
      forceAnswerMode="mix"
      disableSubmit={noSubmit === '1'}
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
      onTestPress={() => navigate('/flashcard/favorites/test?noSubmit=1')}
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
  const { navigate, getQueryParam } = useRouteNavigation()
  const noSubmit = getQueryParam('noSubmit')

  return (
    <TestScreen
      topicId={null}
      isFavoritesMode={true}
      title="Kiểm tra Từ Vựng Yêu Thích"
      forceAnswerMode="mix"
      disableSubmit={noSubmit === '1'}
      onBackPress={() => navigate('/flashcard/favorites')}
      onClose={() => navigate('/flashcard/favorites')}
    />
  )
}

function FlashcardLearnedRoute() {
  const { navigate } = useRouteNavigation()

  return (
    <LearnedVocabularyListScreen
      title="Từ vựng đã học"
      onBackPress={() => navigate('/flashcard')}
    />
  )
}

function PronunciationRulesRoute() {
  const { navigate } = useRouteNavigation()

  return (
    <PronunciationRulesScreen
      onBackPress={() => navigate('/menu-study?level=1')}
      onRulePress={(rule) => navigate(`/pronunciation/examples?ruleId=${rule?.id}`)}
    />
  )
}

function PronunciationExamplesRoute() {
  const { navigate, getQueryParam } = useRouteNavigation()
  const ruleId = getQueryParam('ruleId')
  const ruleTitle = getQueryParam('ruleTitle')

  return (
    <PronunciationExamplesScreen
      ruleId={ruleId}
      ruleTitle={ruleTitle}
      onBackPress={() => navigate('/pronunciation')}
      onExamplePress={(example) => 
        navigate(`/pronunciation/example-detail?exampleId=${example?.id}&ruleId=${ruleId}`)
      }
    />
  )
}

function PronunciationExampleDetailRoute() {
  const { navigate, getQueryParam } = useRouteNavigation()
  const exampleId = getQueryParam('exampleId')
  const ruleId = getQueryParam('ruleId')
  const ruleTitle = getQueryParam('ruleTitle')

  return (
    <PronunciationExampleDetailScreen
      exampleId={exampleId}
      onBackPress={() => 
        navigate(`/pronunciation/examples?ruleId=${ruleId}&ruleTitle=${encodeURIComponent(ruleTitle || '')}`)
      }
    />
  )
}
// Roadmap Routes
function RoadmapTestRoute() {
  const { getIntQueryParam } = useRouteNavigation()
  const level = getIntQueryParam('level', 1)
  return <RoadmapTestScreen level={level} />
}

function RoadmapLearningRoute() {
  const { getIntQueryParam } = useRouteNavigation()
  const level = getIntQueryParam('level', 1)
  return <RoadmapLearningScreen level={level} />
}

function RoadmapTipsRoute() {
  const { id } = useParams()
  return <RoadmapTipsScreen tipId={id} />
}

function RoadmapTipsIndexRoute() {
  return <RoadmapTipsScreen tipId="listen-guide" />
}

function RoadmapPracticeRoute() {
  const { id } = useParams()
  return <RoadmapPracticeScreen practiceId={id} />
}

function RoadmapPracticeTestRoute() {
  const { id } = useParams()
  // "id" here corresponds to questionTypeId
  return <RoadmapPracticeTestScreen questionTypeId={id} />
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
  { path: '/flashcard/learned', element: <FlashcardLearnedRoute /> },

  // Pronunciation
  { path: '/pronunciation', element: <PronunciationRulesRoute /> },
  { path: '/pronunciation/examples', element: <PronunciationExamplesRoute /> },
  { path: '/pronunciation/example-detail', element: <PronunciationExampleDetailRoute /> },

  // Roadmap
  { path: '/roadmap/info', element: <RoadmapInfoScreen /> },
  { path: '/roadmap/test', element: <RoadmapTestRoute /> },
  { path: '/roadmap/test/result', element: <RoadmapTestResultScreen /> },
  { path: '/roadmap/test/result/detail', element: <RoadmapTestResultDetailScreen /> },
  { path: '/roadmap/test/result/generate', element: <RoadmapGenerateScreen /> },
  { path: '/roadmap/learning', element: <RoadmapLearningRoute /> },
  { path: '/roadmap/learning/practice/:id', element: <RoadmapPracticeRoute /> },
  { path: '/roadmap/practice-test/:id', element: <RoadmapPracticeTestRoute /> },
  { path: '/roadmap/learning/tips/:id', element: <RoadmapTipsRoute /> },
  { path: '/roadmap/tips', element: <RoadmapTipsIndexRoute /> },
]

/**
 * Render Study Routes
 */
export function renderStudyRoutes() {
  return studyRoutes.map((route) => (
    <Route key={route.path} path={route.path} element={route.element} />
  ))
}
