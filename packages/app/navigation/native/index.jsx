// packages/app/navigation/native/index.jsx
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import { HomeScreen } from 'app/features/home/screen'
import { UserDetailScreen } from 'app/features/user/detail-screen'
import { BlogDetailScreen } from 'app/features/blog/detail-screen'

const Stack = createNativeStackNavigator()

export function NativeNavigation() {
  return (
    <Stack.Navigator 
      initialRouteName="blog-detail" 
    >
      <Stack.Screen
        name="home"
        component={HomeScreen}
        options={{ title: 'Trang chủ' }}
      />
      <Stack.Screen
        name="user-detail"
        component={UserDetailScreen}
        options={{ title: 'Người dùng' }}
      />
      
      <Stack.Screen
        name="blog-detail"
        component={BlogDetailScreen}
        options={{ title: 'Chi tiết bài viết' }}
        initialParams={{
           slug: 'bat-mi-5-dieu-cam-ky-o-han-quoc' 
        }}
      />
    </Stack.Navigator>
  )
}