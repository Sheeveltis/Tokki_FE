// packages/app/navigation/native/index.jsx
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { View, StyleSheet } from 'react-native'

import { HomeScreen } from 'app/features/general/screens/homepage-screen'
import { DetailScreen } from 'app/features/user/screens/mobile/user-detail-screen'
import { BlogDetailScreen } from 'app/features/blog/screens/client/blog-detail-screen'
import { BlogListScreen } from 'app/features/blog/screens/client/blog-list-screen'
import { LoginScreen } from 'app/features/authentication/screens/login-screen.native'
import { RegisterScreen } from 'app/features/authentication/screens/register-screen.native'
import { ForgotPasswordScreen } from 'app/features/authentication/screens/forgot-password-screen'
import { PremiumScreen } from 'app/features/payment/screens/premium-screen'
import { PackageScreen } from 'app/features/payment/screens/package-screen'
import { PaymentScreen } from 'app/features/payment/screens/payment-screen'
import { PaymentSuccessScreen } from 'app/features/payment/screens/payment-success-screen'
import { PaymentFailedScreen } from 'app/features/payment/screens/payment-failed-screen'
// import { RoadmapInfoScreen } from 'app/features/roadmap/screens/roadmap-info-screen'
// import { RoadmapTestScreen } from 'app/features/roadmap/screens/roadmap-test-screen'
// import { RoadmapTestResultScreen } from 'app/features/roadmap/screens/roadmap-test-result-screen'
// import { RoadmapTestResultDetailScreen } from 'app/features/roadmap/screens/roadmap-test-result-detail-screen'
import { ProfileScreen } from 'app/features/user/screens/client/profile-screen'
import { MenuMobileScreenWrapper } from 'app/features/user/screens/mobile'
import { ErrorScreen } from 'app/features/general/screens/error-screen'
import { FlashcardListScreen } from 'app/features/study/screens/flashcard-list'
import { LearnScreen } from 'app/features/study/screens/flashcard-learn'
import { FlashcardStudyScreen } from 'app/features/study/screens/flashcard-study'
import { FlashcardTestScreen } from 'app/features/study/screens/flashcard-test'
import { FlashcardFirstLearnScreen } from 'app/features/study/screens/flashcard-first-learn'
import { MenuStudyScreen } from 'app/features/study/screens/menu-study/menu-study-screen.native'
import { LearnedVocabularyListScreen } from 'app/features/study/screens/learned-vocabulary-list'
import { MinigameScreen } from 'app/features/minigame/screens/minigame-screen'
import { WordleRuleScreen } from 'app/features/minigame/screens/wordle/wordle-rule-screen'
import { WordlePlayScreen } from 'app/features/minigame/screens/wordle/wordle-play-screen'
import { WordleBoardScreen } from 'app/features/minigame/screens/wordle/wordle-board-screen'
import { PronunciationRulesScreen } from 'app/features/pronunciation/screens/PronunciationRulesScreen'
import { PronunciationExamplesScreen } from 'app/features/pronunciation/screens/PronunciationExamplesScreen'
import { PronunciationExampleDetailScreen } from 'app/features/pronunciation/screens/PronunciationExampleDetailScreen'
import MatchingCardLevelScreen from 'app/features/minigame/screens/matching-card/matching-card-level-screen'
import MatchingCardTopicScreen from 'app/features/minigame/screens/matching-card/matching-card-topic-screen'
import MatchingCardRuleScreen from 'app/features/minigame/screens/matching-card/matching-card-rule-screen'
import MatchingCardScreen from 'app/features/minigame/screens/matching-card/matching-card-screen'
import MatchingCardResultScreen from 'app/features/minigame/screens/matching-card/matching-card-result-screen'

const Stack = createNativeStackNavigator()

export function NativeNavigation() {
  return (
    <View style={styles.container}>
      <Stack.Navigator
        initialRouteName="login"
        screenListeners={{
          state: (e) => {
            console.log('Navigation state changed:', e.data?.state)
          },
        }}
      >
        <Stack.Screen
          name="login"
          component={LoginScreen}
          options={{
            headerShown: false, // Ẩn header mặc định
          }}
        />
        <Stack.Screen
          name="register"
          component={RegisterScreen}
          options={{
            headerShown: false, // Ẩn header mặc định
          }}
        />
        <Stack.Screen
          name="forgot-password"
          component={ForgotPasswordScreen}
          options={{
            headerShown: false, // Ẩn header mặc định
          }}
        />
        <Stack.Screen
          name="home"
          component={HomeScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="user-detail"
          component={DetailScreen}
        />
        <Stack.Screen
          name="blog-detail"
          component={BlogDetailScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="blog-list"
          component={BlogListScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="payment-package"
          component={PackageScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="premium-package"
          component={PremiumScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="payment-detail"
          component={PaymentScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="payment-success"
          component={PaymentSuccessScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="payment-failed"
          component={PaymentFailedScreen}
          options={{ headerShown: false }}
        />
        {/* Roadmap screens disabled on native (web-only) */}
        {/* <Stack.Screen
        name="roadmap-info"
        component={RoadmapInfoScreen}
      />
      <Stack.Screen
        name="roadmap-test"
        component={RoadmapTestScreen}
      />
      <Stack.Screen
        name="roadmap-test-result"
        component={RoadmapTestResultScreen}
      />
      <Stack.Screen
        name="roadmap-test-result-detail"
        component={RoadmapTestResultDetailScreen}
      /> */}
        <Stack.Screen
          name="user-profile"
          component={ProfileScreen}
        />
        <Stack.Screen
          name="menu-mobile"
          component={MenuMobileScreenWrapper}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="error"
          component={ErrorScreen}
        />
        <Stack.Screen
          name="flashcard-list"
          component={FlashcardListScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="menu-study"
          component={MenuStudyScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="flashcard-learn"
          component={LearnScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="flashcard-first-learn"
          component={FlashcardFirstLearnScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="flashcard-study"
          component={FlashcardStudyScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="flashcard-test"
          component={FlashcardTestScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="learned-vocabulary-list"
          component={LearnedVocabularyListScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="minigame"
          component={MinigameScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="wordle-rule"
          component={WordleRuleScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="wordle-play"
          component={WordlePlayScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="wordle-board"
          component={WordleBoardScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="pronunciation-rules"
          component={PronunciationRulesScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="pronunciation-examples"
          component={PronunciationExamplesScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="pronunciation-example-detail"
          component={PronunciationExampleDetailScreen}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})