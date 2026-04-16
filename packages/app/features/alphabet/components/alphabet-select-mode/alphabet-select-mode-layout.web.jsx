import React from 'react'
import { View, StyleSheet, ScrollView, Platform } from 'react-native'
import { Navbar } from '../../../../../components/navbar'

/**
 * AlphabetSelectModeLayout (Web): Layout cho trang chọn học phần chữ cái Hàn Quốc trên web
 */
export function AlphabetSelectModeLayout({ children }) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.mainContainer}>
        <View style={styles.mainWrapper}>
          <View style={styles.dashboardContainer}>
            <View style={styles.contentCard}>
              <ScrollView
                style={styles.contentCardScroll}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.contentCardInner}
              >
                {children}
              </ScrollView>
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    minHeight: Platform.OS === 'web' ? '100vh' : '100%',
  },
  mainContainer: {
    flex: 1,
    alignItems: 'center',
  },
  mainWrapper: {
    width: '100%',
    maxWidth: 1400,
    flex: 1,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignSelf: 'center',
  },
  dashboardContainer: {
    flex: 1,
  },
  contentCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    overflow: 'hidden',
    ...(Platform.OS === 'web' && { boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }),
  },
  contentCardScroll: {
    flex: 1,
  },
  contentCardInner: {
    padding: 32,
    gap: 24,
  },
})

