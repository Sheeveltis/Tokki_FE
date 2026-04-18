import { View, StyleSheet, ScrollView, Text, Pressable } from 'react-native'
import ArrowIcon from '../../../../../assets/icon/icon-mainflow/arrow.svg'
import { NavbarMobile } from '../../../../../components/navbar-mobile'

/**
 * PronunciationLayout (Mobile): Bố cục trang Pronunciation cho mobile
 */
export function PronunciationLayout({ children, onBackPress, title }) {
  return (
    <View style={styles.mobileRoot}>
      <View style={styles.headerTop}>
        <Pressable onPress={onBackPress} style={styles.backButton}>
          <ArrowIcon
            width={24}
            height={24}
            fill="#1F1F1F"
            style={{ transform: [{ scaleX: -1 }] }}
          />
        </Pressable>
        {title && <Text style={styles.headerTitle}>{title}</Text>}
      </View>
      <View style={styles.contentContainer}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </View>
      <NavbarMobile />
    </View>
  )
}

export default PronunciationLayout

const styles = StyleSheet.create({
  mobileRoot: {
    flex: 1,
    backgroundColor: '#FFF8E7',
    paddingTop: 12,
  },
  contentContainer: {
    flex: 1,
    paddingBottom: 70, // Create space for NavbarMobile
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    alignItems: 'center',
    gap: 16,
  },
  headerTop: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginVertical: 12,
    gap: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
  },
})
