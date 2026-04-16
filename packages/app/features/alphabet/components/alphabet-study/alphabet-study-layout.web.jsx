import React from 'react'
import { View, StyleSheet, ScrollView, Platform } from 'react-native'

export function AlphabetStudyLayout({ children }) {
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
    backgroundColor: '#FAFAFA',
  },
  mainContainer: {
    alignItems: 'center',
  },
  mainWrapper: {
    width: '100%',
    maxWidth: 1400,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignSelf: 'center',
  },
  dashboardContainer: {
  },
  contentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    overflow: 'hidden',
    ...(Platform.OS === 'web' && { boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }),
  },
  contentCardScroll: {
  },
  contentCardInner: {
    padding: 32,
    gap: 24,
  },
})
