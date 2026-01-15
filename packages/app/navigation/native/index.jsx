// packages/app/navigation/native/index.jsx
// packages/app/navigation/native/index.jsx
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { View, StyleSheet } from 'react-native'

import { HomeScreen } from 'app/features/home/screen'
import { DetailScreen } from 'app/features/user/screens/Detail'
import { BlogDetailScreen } from 'app/features/blog/screens/client/blog-detail-screen'
import { LoginScreen } from 'app/features/authentication/screens/login-screen.native'
import { RegisterScreen } from 'app/features/authentication/screens/register-screen.native'
import { ForgotPasswordScreen } from 'app/features/authentication/screens/forgot-password-screen'
import { PremiumScreen } from 'app/features/payment/screens/premium-screen'
import { PackageScreen } from 'app/features/payment/payment-package/package-screen'
import { PaymentScreen } from 'app/features/payment/screens/payment-screen'
import { PaymentSuccessScreen } from 'app/features/payment/payment-success/payment-success-screen'
import { PaymentFailedScreen } from 'app/features/payment/screens/payment-failed-screen'
import { RoadmapInfoScreen } from 'app/features/roadmap/roadmap-info/roadmap-info-screen'
import { RoadmapTestScreen } from 'app/features/roadmap/roadmap-test/roadmap-test-screen'
import { ProfileScreen } from 'app/features/user/screens/Profile'
import { MenuMobileScreenWrapper } from 'app/features/user/screens/menu-mobile'
import { ErrorScreen } from 'app/features/error/error-screen'
import { FlashcardListScreen } from 'app/features/study/flashcard-list'
import { LearnScreen } from 'app/features/study/flashcard-learn'
import { FlashcardStudyScreen } from 'app/features/study/flashcard-study'
import { FlashcardTestScreen } from 'app/features/study/flashcard-test'

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
       <Stack.Screen
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
      />
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
      {/* <Stack.Screen
        name="flashcard-learn"
        component={LearnScreen}
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
      /> */}
      </Stack.Navigator>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})