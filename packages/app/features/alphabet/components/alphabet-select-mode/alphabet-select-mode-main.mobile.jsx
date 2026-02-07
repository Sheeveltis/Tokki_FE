import React from 'react'
import { View, Text, StyleSheet, Pressable, Image } from 'react-native'
import { NavigationPill } from '../../../../../components/navigation-pill'
import ArrowIcon from '../../../../../assets/icon/icon-mainflow/arrow.svg'
import { normalizeImageSource } from '../../../study/api'
import { studyStyles } from '../../../study/styles'
import BunnyStudy from '../../../../../assets/bunny/14.png'

/**
 * AlphabetSelectModeMain (Mobile): Nội dung chính của trang chọn học phần chữ cái Hàn Quốc trên mobile
 */
export function AlphabetSelectModeMain({
  onBackPress,
  onLettersPress,
  onSyllablesPress,
}) {
  return (
    <>
      {/* Header */}
      <View style={styles.header}>
        <NavigationPill
          label="Trở lại"
          to={undefined}
          icon={ArrowIcon}
          iconStyle={{ transform: [{ scaleX: -1 }] }}
          onPress={onBackPress}
          textStyle={{ fontWeight: '700' }}
        />
      </View>

      <Text style={styles.title}>Học Chữ Cái Hàn Quốc</Text>
      <Text style={styles.subtitle}>Chọn phần bạn muốn học</Text>

      {/* Mode Selection Cards */}
      <View style={styles.modesContainer}>
        <Pressable
          style={styles.modeCard}
          onPress={onLettersPress}
        >
          <View style={styles.modeIconContainer}>
            <Image
              source={normalizeImageSource(BunnyStudy)}
              style={styles.modeIcon}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.modeTitle}>Học Chữ Cái</Text>
          <Text style={styles.modeDescription}>
            Học các chữ cái đơn lẻ trong bảng chữ cái Hàn Quốc
          </Text>
          <View style={styles.modeBadge}>
            <Text style={styles.modeBadgeText}>Cơ bản</Text>
          </View>
        </Pressable>

        <Pressable
          style={styles.modeCard}
          onPress={onSyllablesPress}
        >
          <View style={styles.modeIconContainer}>
            <Image
              source={normalizeImageSource(BunnyStudy)}
              style={styles.modeIcon}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.modeTitle}>Học Ghép Âm</Text>
          <Text style={styles.modeDescription}>
            Học cách ghép các chữ cái thành âm tiết hoàn chỉnh
          </Text>
          <View style={styles.modeBadge}>
            <Text style={styles.modeBadgeText}>Nâng cao</Text>
          </View>
        </Pressable>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 12,
  },
  title: {
    ...studyStyles.pageTitle,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
    marginTop: -8,
  },
  modesContainer: {
    width: '100%',
    flexDirection: 'column',
    gap: 16,
    justifyContent: 'center',
  },
  modeCard: {
    width: '100%',
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    alignItems: 'center',
    gap: 16,
    borderWidth: 3,
    borderColor: '#79964E',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  modeIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F5F0DD',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#F1BE4B',
  },
  modeIcon: {
    width: 80,
    height: 80,
  },
  modeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
  },
  modeDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
    lineHeight: 20,
  },
  modeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: '#F1BE4B',
    borderRadius: 20,
    marginTop: 4,
  },
  modeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
  },
})

