// packages/app/navigation/native/index.jsx
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import { HomeScreen } from 'app/features/home/screen'
import { UserDetailScreen } from 'app/features/user/detail-screen'
import { BlogDetailScreen } from 'app/features/blog/detail-screen'
import { LoginScreen } from 'app/features/authentication/login-screen'
import { RegisterScreen } from 'app/features/authentication/register-screen'

const Stack = createNativeStackNavigator()

export function NativeNavigation() {
  return (
    <Stack.Navigator 
      initialRouteName="login" 
    >
      <Stack.Screen
        name="homepage"
        component={screen}
        options={{ title: 'Trang Chủ' }}
      />
      <Stack.Screen
        name="login"
        component={LoginScreen}
        options={{ title: 'Đăng nhập' }}
      />
      <Stack.Screen
        name="register"
        component={RegisterScreen}
        options={{ title: 'Đăng ký' }}
      />
      <Stack.Screen
        name="homepage"
        component={HomeScreen}
        options={{ title: 'Trang chủ' }}
      />
      
    </Stack.Navigator>
  )
}