// packages/app/navigation/native/index.jsx
// packages/app/navigation/native/index.jsx
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { View, StyleSheet } from 'react-native'

import { HomeScreen } from 'app/features/home/screen'
import { DetailScreen } from 'app/features/user/screens/Detail'
import { BlogDetailScreen } from 'app/features/blog/detail-blog'
import { LoginScreen } from 'app/features/authentication/login-screen'
import { RegisterScreen } from 'app/features/authentication/register-screen'
import { ForgotPasswordScreen } from 'app/features/authentication/forgot-password/forgot-password-screen'
import { PremiumScreen } from 'app/features/payment/premium-package/premium-screen'
import { PackageScreen } from 'app/features/payment/payment-package/package-screen'
import { PaymentScreen } from 'app/features/payment/payment-detail/payment-screen'
import { PaymentSuccessScreen } from 'app/features/payment/payment-success/payment-success-screen'
import { PaymentFailedScreen } from 'app/features/payment/payment-failed/payment-failed-screen'
import { RoadmapInfoScreen } from 'app/features/roadmap/roadmap-info/roadmap-info-screen'
import { RoadmapTestScreen } from 'app/features/roadmap/roadmap-test/roadmap-test-screen'
import { ProfileScreen } from 'app/features/user/screens/Profile'
import { ErrorScreen } from 'app/features/error/error-screen'

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
        name="error"
        component={ErrorScreen}
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