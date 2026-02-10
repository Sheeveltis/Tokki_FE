import React from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { NavbarMobile } from '../../../../../../components/navbar-mobile'
import { NavigationPill } from '../../../../../../components/navigation-pill'
import { studyStyles } from '../../../styles'
import ArrowIcon from '../../../../../../assets/icon/icon-mainflow/arrow.svg'

/**
 * MenuStudyLayout (Mobile): Bố cục trang menu học tập cho mobile
 */
export function MenuStudyLayout({
  children,
  levelId,
  onBackPress,
  onQuickTestPress,
  lessonsLearned,
  streakDays,
}) {
  return (
    <View style={styles.root}>
      <NavbarMobile />
      
      {/* Content chính trong ScrollView */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}
      >
        <View style={styles.contentWrapper}>
          {/* Nút Trở lại */}
          <View style={styles.backButtonContainer}>
            <NavigationPill
              label="Quay lại"
              to={undefined}
              icon={ArrowIcon}
              onPress={onBackPress}
              textStyle={{ fontWeight: '700' }}
              iconStyle={{ transform: [{ scaleX: -1 }] }}
            />
          </View>

          {/* Title LEVEL */}
          <View style={styles.titleContainer}>
            <View style={styles.titleBox}>
              <Text style={styles.titleText}>LEVEL {levelId}</Text>
            </View>
          </View>

          {/* Nội dung chính */}
          {children}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FDF8EE',
    position: 'relative',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    width: '100%',
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 100, // Thêm padding bottom để tránh bị che bởi navbar
    paddingHorizontal: 12,
  },
  contentWrapper: {
    width: '100%',
    maxWidth: '100%',
    alignItems: 'center',
    gap: 20,
    paddingVertical: 20,
    paddingHorizontal: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  backButtonContainer: {
    alignSelf: 'flex-start',
    marginBottom: 4,
    width: '100%',
  },
  titleContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 4,
  },
  titleBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderWidth: 3,
    borderColor: '#F4B8AF',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4, // Cho Android
    minWidth: 120,
  },
  titleText: {
    ...studyStyles.pageTitle,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1,
  },
})

