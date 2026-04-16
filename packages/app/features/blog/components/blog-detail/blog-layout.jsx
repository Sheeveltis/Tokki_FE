import { Platform } from 'react-native'
import { BlogLayout as WebLayout } from './blog-layout.web'
import { BlogLayout as NativeLayout } from './blog-layout.native'

export const BlogLayout = Platform.select({
  web: WebLayout,
  default: NativeLayout,
})
