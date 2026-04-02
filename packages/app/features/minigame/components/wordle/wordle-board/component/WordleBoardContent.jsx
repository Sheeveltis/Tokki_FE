import React from 'react'
import { View, Text, StyleSheet, Image, Pressable, Platform, ScrollView } from 'react-native'
import DefaultAvatar from '../../../../../../../assets/user.png'

/**
 * Component hiển thị một item trong bảng xếp hạng
 */
function WordleBoardItem({ item, index, onLike }) {
  const handleLike = () => {
    // Đã like rồi thì không cho bấm tắt tim
    if (item.isLiked) return
    if (onLike) {
      onLike(item.submissionId, true)
    }
  }

  // Avatar: nếu avatarUrl rỗng hoặc null thì dùng avatar mặc định
  const hasAvatar = item.avatarUrl && item.avatarUrl.trim() !== ''
  const avatarSource = hasAvatar ? { uri: item.avatarUrl } : DefaultAvatar

  // Title / Danh hiệu
  const rawTitleName = item.titleName || ''
  const hasTitle = !!rawTitleName
  const titleText = hasTitle ? rawTitleName : 'Không có danh hiệu'
  const titleColor = hasTitle ? item.titleColorHex || '#4E342E' : '#9E9E9E'
  const titleIconSource = item.titleIconUrl ? { uri: item.titleIconUrl } : null

  return (
    <View style={styles.item}>
      <View style={styles.itemLeft}>
        {/* Rank number */}
        <View style={styles.rankContainer}>
          <Text style={styles.rankText}>{index + 1}</Text>
        </View>

        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <Image
            source={avatarSource}
            style={styles.avatar}
            onError={() => {
              // Fallback nếu load ảnh lỗi - có thể set lại source ở đây nếu cần
              console.log('[WordleBoardItem] Avatar load error')
            }}
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
        {/* AI Score */}
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>Điểm</Text>
          <Text style={styles.scoreValue}>{item.aiScore || 0}</Text>
        </View>

        {/* Like button */}
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
    padding: 90,
    gap: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 4,
    boxShadow: '0 4px 0 rgba(139, 69, 19, 0.1)', // Subtle wood-like shadow
    borderWidth: 2,
    borderColor: '#EFE0C2',
    overflow: 'hidden',
  },
  itemLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginRight: 12,
  },
  rankContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF1D6',
    borderWidth: 2,
    borderColor: '#E7C8A0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3E2723',
    fontFamily: Platform.select({
      web: 'Epilogue, sans-serif',
      default: undefined,
    }),
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#E0E0E0',
    borderWidth: 2,
    borderColor: '#FFE9C4',
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
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1C',
    fontFamily: Platform.select({
      web: 'Epilogue, sans-serif',
      default: undefined,
    }),
  },
  titleSeparator: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8F8F8F',
  },
  userTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    maxWidth: 160,
  },
  userTitleIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  userTitleText: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: Platform.select({
      web: 'Epilogue, sans-serif',
      default: undefined,
    }),
  },
  userTitleEmpty: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9E9E9E',
    fontFamily: Platform.select({
      web: 'Epilogue, sans-serif',
      default: undefined,
    }),
  },
  sentenceContent: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4E342E',
    lineHeight: 20,
    fontFamily: Platform.select({
      web: 'Epilogue, sans-serif',
      default: undefined,
    }),
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scoreContainer: {
    alignItems: 'center',
    backgroundColor: '#FFF5E6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    minWidth: 70,
  },
  scoreLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8D6E63',
    marginBottom: 2,
    fontFamily: Platform.select({
      web: 'Epilogue, sans-serif',
      default: undefined,
    }),
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#7CB342',
    fontFamily: Platform.select({
      web: 'Epilogue, sans-serif',
      default: undefined,
    }),
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#FAFAFA',
    minWidth: 50,
    gap: 4,
    borderWidth: 1,
    borderColor: '#EEE',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      },
    }),
  },
  likeButtonActive: {
    backgroundColor: '#FFE0E0',
  },
  likeButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  likeIcon: {
    fontSize: 20,
  },
  likeCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
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
    fontWeight: '600',
    color: '#666',
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
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    fontFamily: Platform.select({
      web: 'Epilogue, sans-serif',
      default: undefined,
    }),
  },
})

export default WordleBoardContent

