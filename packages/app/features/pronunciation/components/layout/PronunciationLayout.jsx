import { Platform } from 'react-native'
import { PronunciationLayout as WebLayout } from './PronunciationLayout.web'
import { PronunciationLayout as MobileLayout } from './PronunciationLayout.mobile'

export const PronunciationLayout = Platform.OS === 'web' ? WebLayout : MobileLayout
export default PronunciationLayout