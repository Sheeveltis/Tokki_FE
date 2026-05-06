import React from 'react'
import { View, Text, StyleSheet, Image, Pressable, Platform, ScrollView } from 'react-native'
import DefaultAvatar from '../../../../../../../assets/user.png'

/**
 * Component hiển thị một item trong bảng xếp hạng
 */
function WordleBoardItem({ item, index, onLike }) {
  const handleLike = () => {
    if (item.isLiked) return
    if (onLike) {
      onLike(item.submissionId, true)
    }
  }

  const hasAvatar = item.avatarUrl && item.avatarUrl.trim() !== ''
  const avatarSource = hasAvatar ? { uri: item.avatarUrl } : DefaultAvatar

  const rawTitleName = item.titleName || ''
  const hasTitle = !!rawTitleName
  const titleText = hasTitle ? rawTitleName : 'Không có danh hiệu'
  const titleColor = hasTitle ? item.titleColorHex || '#4E342E' : '#9E9E9E'
  const titleIconSource = item.titleIconUrl ? { uri: item.titleIconUrl } : null

  // Top 3 specific styles
  const isTop1 = index === 0
  const isTop2 = index === 1
  const isTop3 = index === 2

  const itemStyle = [
    styles.item,
    isTop1 && styles.itemTop1,
    isTop2 && styles.itemTop2,
    isTop3 && styles.itemTop3,
  ]

  const rankContainerStyle = [
    styles.rankContainer,
    isTop1 && styles.rankContainerTop1,
    isTop2 && styles.rankContainerTop2,
    isTop3 && styles.rankContainerTop3,
  ]

  const rankTextStyle = [
    styles.rankText,
    isTop1 && styles.rankTextTop1,
    isTop2 && styles.rankTextTop2,
    isTop3 && styles.rankTextTop3,
  ]

  return (
    <View style={itemStyle}>
      <View style={styles.itemLeft}>
        {/* Rank number */}
        <View style={rankContainerStyle}>
          <Text style={rankTextStyle}>
            {isTop1 ? '👑' : index + 1}
          </Text>
        </View>

        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <Image
            source={avatarSource}
            style={styles.avatar}
          />
        </View>

        {/* User info + Title */}
        <View style={styles.userInfo}>
          <View style={styles.nameTitleRow}>
            <Text style={styles.userName} numberOfLines={1}>
              {item.userName || 'Anonymous'}
            </Text>
            <Text style={styles.titleSeparator}> | </Text>
            {hasTitle ? (
              <View style={styles.userTitleContainer}>
                {titleIconSource && (
                  <Image source={titleIconSource} style={styles.userTitleIcon} />
                )}
                <Text
                  style={[styles.userTitleText, { color: titleColor }]}
                  numberOfLines={1}
                >
                  {titleText}
                </Text>
              </View>
            ) : (
              <Text style={styles.userTitleEmpty} numberOfLines={1}>
                Không có danh hiệu
              </Text>
            )}
          </View>

          <Text style={styles.sentenceContent} numberOfLines={2}>
            {item.sentenceContent}
          </Text>
        </View>
      </View>

      <View style={styles.itemRight}>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>Điểm</Text>
          <Text style={styles.scoreValue}>{item.aiScore || 0}</Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.likeButton,
            item.isLiked && styles.likeButtonActive,
            pressed && styles.likeButtonPressed,
          ]}
          onPress={handleLike}
        >
          <Text style={styles.likeIcon}>{item.isLiked ? '❤️' : '🤍'}</Text>
          {item.likeCount > 0 && (
            <Text style={styles.likeCount}>{item.likeCount}</Text>
          )}
        </Pressable>
      </View>
    </View>
  )
}

/**
 * Component chính hiển thị bảng xếp hạng
 */
export function WordleBoardContent({ sentences = [], onLike, loading = false }) {
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    )
  }

  if (!sentences || sentences.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Chưa có câu văn nào được đăng</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {sentences.map((item, index) => (
        <WordleBoardItem
          key={item.submissionId || index}
          item={item}
          index={index}
          onLike={onLike}
        />
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  contentContainer: {
    padding: 16,
    gap: 16,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 12,
    marginBottom: 4,
    borderWidth: 3,
    borderColor: '#8D6E63',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    ...(Platform.OS === 'web' && {
      boxShadow: '4px 4px 0px 0px rgba(141, 110, 99, 0.2)',
    }),
  },
  itemTop1: {
    borderColor: '#FBC02D', // Gold
    backgroundColor: '#FFFDE7',
    borderWidth: 4,
  },
  itemTop2: {
    borderColor: '#90A4AE', // Silver
    backgroundColor: '#F4F7F8',
    borderWidth: 4,
  },
  itemTop3: {
    borderColor: '#A1887F', // Bronze
    backgroundColor: '#FAF8F7',
    borderWidth: 4,
  },
  itemLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginRight: 12,
  },
  rankContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFE0C2',
    borderWidth: 2,
    borderColor: '#8D6E63',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankContainerTop1: {
    backgroundColor: '#FFD54F',
    borderColor: '#F57F17',
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  rankContainerTop2: {
    backgroundColor: '#CFD8DC',
    borderColor: '#546E7A',
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  rankContainerTop3: {
    backgroundColor: '#D7CCC8',
    borderColor: '#5D4037',
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  rankText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#5D4037',
    fontFamily: Platform.select({
      web: 'Epilogue, sans-serif',
      default: undefined,
    }),
  },
  rankTextTop1: {
    fontSize: 22,
    color: '#E65100',
  },
  rankTextTop2: {
    fontSize: 18,
    color: '#37474F',
  },
  rankTextTop3: {
    fontSize: 18,
    color: '#3E2723',
  },
  avatarContainer: {
    width: 54,
    height: 54,
    borderRadius: 27,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
    borderWidth: 3,
    borderColor: '#D7CCC8',
  },
  avatar: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  userInfo: {
    flex: 1,
    gap: 4,
  },
  nameTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#3E2723',
    fontFamily: Platform.select({
      web: 'Epilogue, sans-serif',
      default: undefined,
    }),
  },
  titleSeparator: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D7CCC8',
  },
  userTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FBE9E7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFCCBC',
  },
  userTitleIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  userTitleText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: Platform.select({
      web: 'Epilogue, sans-serif',
      default: undefined,
    }),
  },
  userTitleEmpty: {
    fontSize: 12,
    fontWeight: '500',
    color: '#BCAAA4',
    fontFamily: Platform.select({
      web: 'Epilogue, sans-serif',
      default: undefined,
    }),
  },
  sentenceContent: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4E342E',
    lineHeight: 18,
    backgroundColor: '#FAFAFA',
    padding: 8,
    borderRadius: 12,
    marginTop: 2,
    borderLeftWidth: 3,
    borderLeftColor: '#D7CCC8',
    fontFamily: Platform.select({
      web: 'Epilogue, sans-serif',
      default: undefined,
    }),
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  scoreContainer: {
    alignItems: 'center',
    backgroundColor: '#F1F8E9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 60,
    borderWidth: 2,
    borderColor: '#C5E1A5',
  },
  scoreLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#33691E',
    textTransform: 'uppercase',
    fontFamily: Platform.select({
      web: 'Epilogue, sans-serif',
      default: undefined,
    }),
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#558B2F',
    fontFamily: Platform.select({
      web: 'Epilogue, sans-serif',
      default: undefined,
    }),
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#FFF',
    minWidth: 44,
    height: 44,
    gap: 4,
    borderWidth: 2,
    borderColor: '#F5F5F5',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      },
    }),
  },
  likeButtonActive: {
    backgroundColor: '#FFEBEE',
    borderColor: '#FFCDD2',
  },
  likeButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.9 }],
  },
  likeIcon: {
    fontSize: 20,
  },
  likeCount: {
    fontSize: 12,
    fontWeight: '800',
    color: '#D81B60',
    fontFamily: Platform.select({
      web: 'Epilogue, sans-serif',
      default: undefined,
    }),
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#8D6E63',
    fontFamily: Platform.select({
      web: 'Epilogue, sans-serif',
      default: undefined,
    }),
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#BCAAA4',
    fontFamily: Platform.select({
      web: 'Epilogue, sans-serif',
      default: undefined,
    }),
  },
})




export default WordleBoardContent

