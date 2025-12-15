// packages/app/navigation/native/index.jsx
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import { HomeScreen } from 'app/features/home/screen'
import { UserDetailScreen } from 'app/features/user/detail-screen'
import { BlogDetailScreen } from 'app/features/blog/detail-screen'
import { LoginScreen } from 'app/features/authentication/login-screen'
import { RegisterScreen } from 'app/features/authentication/register-screen'
import { PremiumScreen } from 'app/features/payment/payment-package/premium-screen'

const Stack = createNativeStackNavigator()

export function NativeNavigation() {
  return (
    <Stack.Navigator 
      initialRouteName="login" 
    >
      <Stack.Screen
        name="homepage"
        component={screen}
      />
      <Stack.Screen
        name="login"
        component={LoginScreen}
      />
      <Stack.Screen
        name="register"
        component={RegisterScreen}
      />
      <Stack.Screen
        name="package-premium"
        component={PremiumScreen}
      />
    </Stack.Navigator>
  )
}