// packages/app/navigation/native/index.jsx
// packages/app/navigation/native/index.jsx
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import { BlogDetailScreen } from 'app/features/blog/detail-blog'
import { LoginScreen } from 'app/features/authentication/login-screen'
import { RegisterScreen } from 'app/features/authentication/register-screen'
import { ForgotPasswordScreen } from 'app/features/authentication/forgot-password/forgot-password-screen'

const Stack = createNativeStackNavigator()

export function NativeNavigation() {

  return (
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
        name="blog-detail"
        component={BlogDetailScreen}
      />
    </Stack.Navigator>
  )
}