// packages/app/navigation/native/index.jsx
// packages/app/navigation/native/index.jsx
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { View, StyleSheet } from 'react-native'

import { HomeScreen } from 'app/features/general/screens/homepage-screen'
import { DetailScreen } from 'app/features/user/screens/mobile/user-detail-screen'
import { BlogDetailScreen } from 'app/features/blog/screens/client/blog-detail-screen'
import { LoginScreen } from 'app/features/authentication/screens/login-screen.native'
import { RegisterScreen } from 'app/features/authentication/screens/register-screen.native'
import { ForgotPasswordScreen } from 'app/features/authentication/screens/forgot-password-screen'
import { PremiumScreen } from 'app/features/payment/screens/premium-screen'
import { PackageScreen } from 'app/features/payment/screens/package-screen'
import { PaymentScreen } from 'app/features/payment/screens/payment-screen'
import { PaymentSuccessScreen } from 'app/features/payment/screens/payment-success-screen'
import { PaymentFailedScreen } from 'app/features/payment/screens/payment-failed-screen'
import { RoadmapInfoScreen } from 'app/features/roadmap/screens/roadmap-info-screen'
import { RoadmapTestScreen } from 'app/features/roadmap/screens/roadmap-test-screen'
import { ProfileScreen } from 'app/features/user/screens/client/profile-screen'
import { MenuMobileScreenWrapper } from 'app/features/user/screens/mobile'
import { ErrorScreen } from 'app/features/general/screens/error-screen'
import { FlashcardListScreen } from 'app/features/study/flashcard-list'
import { LearnScreen } from 'app/features/study/flashcard-learn'
import { FlashcardStudyScreen } from 'app/features/study/flashcard-study'
import { FlashcardTestScreen } from 'app/features/study/flashcard-test'
import { FlashcardFirstLearnScreen } from 'app/features/study/flashcard-first-learn'
import { MenuStudyScreen } from 'app/features/study/menu-study/menu-study-screen.native'
import { LearnedVocabularyListScreen } from 'app/features/study/learned-vocabulary-list'

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
        name="user-detail"
        component={DetailScreen}
      />
      <Stack.Screen
        name="blog-detail"
        component={BlogDetailScreen}
      />
       {/* <Stack.Screen
        name="payment-package"
        component={PackageScreen}
      />
      <Stack.Screen
        name="premium-package"
        component={PremiumScreen}
      />
      <Stack.Screen
        name="payment-detail"
        component={PaymentScreen}
      />
      <Stack.Screen
        name="payment-success"
        component={PaymentSuccessScreen}
      />
      <Stack.Screen
        name="payment-failed"
        component={PaymentFailedScreen}
      /> */}
      <Stack.Screen
        name="roadmap-info"
        component={RoadmapInfoScreen}
      />
      <Stack.Screen
        name="roadmap-test"
        component={RoadmapTestScreen}
      />
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
      </Stack.Navigator>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})