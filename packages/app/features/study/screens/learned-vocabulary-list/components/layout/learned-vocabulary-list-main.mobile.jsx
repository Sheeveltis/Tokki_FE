import React, { useState } from 'react'
import { View, StyleSheet, Text, TouchableOpacity, TextInput, Platform, Image, ScrollView, ActivityIndicator } from 'react-native'
import { NavigationPill } from 'components/navigation-pill'
import ArrowIcon from 'assets/icon/icon-mainflow/arrow.svg'
import { studyStyles } from '@tokki/app/features/study/styles'
import { LoadingWithContainer } from 'components/Loading'
import RabbitWaitingImage from 'assets/bunny/2.png'

// Icon components for mobile

const MasteryLevel = ({ level = 1 }) => {
  return (
    <View style={styles.masteryContainer}>
      <View style={styles.masteryBar}>
        {[...Array(5)].map((_, i) => (
          <View 
            key={i} 
            style={[
              styles.masterySegment, 
              i < level ? styles.masteryActive : styles.masteryInactive
            ]} 
          />
        ))}
      </View>
      <Text style={styles.masteryText}>Cấp {level}</Text>
    </View>
  )
}

/**
 * LearnedVocabularyListMain (Mobile): Nội dung chính của trang danh sách từ vựng đã học trên mobile
 */
export function LearnedVocabularyListMain({
  title = 'Từ vựng đã học',
  vocabularies = [],
  loading,
  error,
  searchTerm,
  onSearchChange,
  onSearchSubmit,
  onBackPress,
  onRetry,
  pageNumber,
  totalPages,
  canNextPage,
  canPrevPage,
  onPrevPage,
  onNextPage,
  reviewCount = 0,
  practiceCount = 20,
  onPracticeCountChange,
  maxPracticeCount = 0,
  onStartPractice,
}) {
  if (loading && vocabularies.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingWithContainer
          size={48}
          color="#F1BE4B"
          text="Đang tải danh sách..."
        />
      </View>
    )
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={onBackPress} style={styles.backBtn}>
          <ArrowIcon width={24} height={24} style={{ transform: [{ scaleX: -1 }] }} />
        </TouchableOpacity>
        <Text style={styles.title}>{title}</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Practice Hero Card */}
      {vocabularies.length > 0 && (
        <View style={styles.practiceHero}>
          <Text style={styles.heroTitle}>
            {reviewCount > 0 ? `Bạn có ${reviewCount} từ cần ôn` : 'Hôm nay bạn học rất tốt!'}
          </Text>
          <Text style={styles.heroSubtitle}>Luyện tập thường xuyên để ghi nhớ lâu hơn</Text>
          
          <View style={styles.practiceControls}>
            <View style={styles.countPicker}>
              <TextInput
                style={styles.countInput}
                value={practiceCount.toString()}
                onChangeText={(text) => {
                  if (text === '') return onPracticeCountChange(1)
                  const num = parseInt(text)
                  if (!isNaN(num)) onPracticeCountChange(Math.min(num, maxPracticeCount))
                }}
                keyboardType="numeric"
              />
              <Text style={styles.maxText}>/ {maxPracticeCount}</Text>
            </View>
            
            <TouchableOpacity style={styles.startBtn} onPress={onStartPractice}>
              <Text style={styles.startBtnText}>Ôn tập ngay</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}


      {vocabularies.length > 0 ? (
        <View style={styles.listContainer}>
          {vocabularies.map((vocab) => (
            <View key={vocab.id} style={styles.vocabCard}>
              <Image 
                source={vocab.imageUrl ? { uri: vocab.imageUrl } : RabbitWaitingImage} 
                style={styles.vocabImage} 
                resizeMode="cover"
              />
              <View style={styles.vocabInfo}>
                <View style={styles.vocabHeader}>
                  <Text style={styles.vocabWord}>{vocab.word}</Text>
                  {vocab.streak > 0 && <Text style={styles.streakText}>🔥 {vocab.streak}</Text>}
                </View>
                <Text style={styles.vocabMeaning} numberOfLines={2}>{vocab.meaning}</Text>
                <MasteryLevel level={vocab.boxLevel} />
              </View>
            </View>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <View style={styles.pagination}>
              <TouchableOpacity 
                disabled={!canPrevPage}
                onPress={onPrevPage}
                style={[styles.pageBtn, !canPrevPage && styles.pageBtnDisabled]}
              >
                <Text style={styles.pageBtnText}>Trước</Text>
              </TouchableOpacity>
              <Text style={styles.pageInfo}>{pageNumber} / {totalPages}</Text>
              <TouchableOpacity 
                disabled={!canNextPage}
                onPress={onNextPage}
                style={[styles.pageBtn, !canNextPage && styles.pageBtnDisabled]}
              >
                <Text style={styles.pageBtnText}>Tiếp</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : (
        !loading && (
          <View style={styles.emptyContainer}>
            <Image source={RabbitWaitingImage} style={styles.emptyImage} resizeMode="contain" />
            <Text style={styles.emptyTitle}>Chưa có từ vựng đã học</Text>
            <Text style={styles.emptySubtitle}>Quay lại trang học và bắt đầu bài mới nhé!</Text>
          </View>
        )
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  contentContainer: {
    padding: 16,
    gap: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#FFF',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F1F1F',
  },
  practiceHero: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F1F1F',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 16,
  },
  practiceControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  countPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  countInput: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F1BE4B',
    minWidth: 30,
    textAlign: 'center',
  },
  maxText: {
    fontSize: 13,
    color: '#999',
    fontWeight: '600',
  },
  startBtn: {
    flex: 1,
    backgroundColor: '#F1BE4B',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  startBtnText: {
    color: '#1F1F1F',
    fontWeight: '800',
    fontSize: 15,
  },
  listContainer: {
    gap: 12,
  },
  vocabCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  vocabImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
  },
  vocabInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  vocabHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vocabWord: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F1F1F',
  },
  streakText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF4D2D',
  },
  vocabMeaning: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    marginVertical: 2,
  },
  masteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  masteryBar: {
    flex: 1,
    flexDirection: 'row',
    gap: 3,
    maxWidth: 100,
  },
  masterySegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  masteryActive: {
    backgroundColor: '#4CAF50',
  },
  masteryInactive: {
    backgroundColor: '#E9ECEF',
  },
  masteryText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4CAF50',
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginTop: 12,
    marginBottom: 20,
  },
  pageBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  pageBtnDisabled: {
    opacity: 0.5,
  },
  pageBtnText: {
    fontWeight: '700',
    fontSize: 13,
  },
  pageInfo: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
    gap: 8,
  },
  emptyImage: {
    width: 150,
    height: 150,
    opacity: 0.6,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F1F1F',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
})
