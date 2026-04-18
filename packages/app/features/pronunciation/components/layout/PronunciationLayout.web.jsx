import React from 'react'
import { View, StyleSheet } from 'react-native'
import { NavigationPill } from '../../../../../components/navigation-pill'
import ArrowIcon from '../../../../../assets/icon/icon-mainflow/arrow.svg'

/**
 * PronunciationLayout (Web): Bố cục trang Pronunciation cho web
 */
export function PronunciationLayout({ children, onBackPress }) {
  return (
    <View style={styles.webRoot}>
      <View style={styles.webContentWrapper}>
        <View style={styles.headerTop}>
          <NavigationPill
            label="Quay lại"
            icon={ArrowIcon}
            iconStyle={{ transform: [{ scaleX: -1 }] }}
            onPress={onBackPress}
            textStyle={{ fontWeight: '700' }}
          />
        </View>
        {children}
      </View>
    </View>
  )
}

export default PronunciationLayout

const styles = StyleSheet.create({
  webRoot: {
    flex: 1,
    minHeight: '100%',
    backgroundColor: '#FFD7D0',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 24,
  },
  webContentWrapper: {
    width: '70%',
    maxWidth: '100%',
    minHeight: '90vh',
    alignItems: 'center',
    backgroundColor: '#F5F0DD',
    paddingVertical: 24,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 16,
  },
  headerTop: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
})
