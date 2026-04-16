import { Platform } from 'react-native'
import { BlogListLayout as WebLayout } from './blog-list-layout.web'
import { BlogListLayout as NativeLayout } from './blog-list-layout.native'

export const BlogListLayout = Platform.select({
  web: WebLayout,
  default: NativeLayout,
})

