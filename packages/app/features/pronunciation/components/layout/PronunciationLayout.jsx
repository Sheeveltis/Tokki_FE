// components/pronunciation-layout.jsx
import React from 'react'
import { View, Platform, StyleSheet } from 'react-native'
import { Navbar } from '../../../../../components/navbar'
import { NavigationPill } from '../../../../../components/navigation-pill'
import ArrowIcon from '../../../../../assets/icon/icon-mainflow/arrow.svg'

export function PronunciationLayout({ children, onBackPress, title }) {
  const content = (
    <>
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
    </>
  )

  if (Platform.OS === 'web') {
    return (
      <View style={styles.webRoot}>
        <Navbar />
        <View style={styles.webContentWrapper}>{content}</View>
      </View>
    )
  }

  return <View style={styles.mobileRoot}>{content}</View>
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
    mobileRoot: {
      flex: 1,
      backgroundColor: '#F5F0DD',
      paddingVertical: 24,
      paddingHorizontal: 16,
      gap: 16,
    },
    headerTop: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    backBtn: {
      flexShrink: 0,
    },
    titleContainer: {
      width: '100%',
      alignItems: 'center',
      marginTop: 12,
    },
    title: {
      fontSize: 44,
      fontWeight: '700',
      color: '#1F1F1F',
      fontFamily: 'Epilogue, sans-serif',
      textAlign: 'center',
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      width: '90%',
      maxWidth: 900,
      marginTop: 8,
      marginBottom: 16,
    },
    searchInputWrapper: {
      flex: 1,
    },
    searchInput: {
      width: '100%',
      height: 40,
      paddingHorizontal: 12,
      borderRadius: 100,
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#E0E0E0',
      fontSize: 14,
      fontFamily: 'Epilogue, sans-serif',
    },
    searchButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      backgroundColor: '#F1BE4B',
    },
    searchButtonText: {
      fontSize: 14,
      fontWeight: '700',
      color: '#1F1F1F',
      fontFamily: 'Epilogue, sans-serif',
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 220,
    },
    errorContainer: {
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
      minHeight: 200,
    },
    errorText: {
      fontSize: 16,
      color: '#ff4d4f',
      textAlign: 'center',
      marginBottom: 16,
      fontFamily: 'Epilogue, sans-serif',
    },
    retryButton: {
      backgroundColor: '#F1BE4B',
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
    },
    retryButtonText: {
      color: '#1F1F1F',
      fontSize: 14,
      fontWeight: '700',
      fontFamily: 'Epilogue, sans-serif',
    },
    emptyContainer: {
      padding: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyText: {
      fontSize: 16,
      color: '#666',
      textAlign: 'center',
      fontFamily: 'Epilogue, sans-serif',
    },
  })