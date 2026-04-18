import React from 'react'
import { View, StyleSheet, ScrollView, Platform } from 'react-native'

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
    maxWidth: 1200,
    paddingTop: 32,
    paddingBottom: 48,
    paddingHorizontal: 24,
    alignSelf: 'center',
  },
  dashboardContainer: {
    width: '100%',
  },
  contentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
    overflow: 'hidden',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 20px 50px rgba(0,0,0,0.04)',
    }),
  },
  contentCardScroll: {
    width: '100%',
  },
  contentCardInner: {
    padding: 32,
    paddingTop: 24,
    paddingBottom: 64,
    gap: 48,
  },
})

