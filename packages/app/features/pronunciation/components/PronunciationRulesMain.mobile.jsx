import React from 'react'
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Pressable } from 'react-native'
import { LoadingWithContainer } from '../../../../components/Loading'
import { PronunciationRuleList } from './PronunciationRuleList'
import SearchIcon from '../../../../assets/icon/navigate-app/search.svg'

export function PronunciationRulesMain({
  rules,
  loading,
  error,
  searchTerm,
  onSearchChange,
  filteredRules,
  onRulePress,
  onRetry,
}) {
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <SearchIcon width={20} height={20} fill="#7A7A7A" style={styles.searchIcon} />
        <TextInput
          value={searchTerm}
          placeholder="Tìm kiếm quy tắc phát âm..."
          placeholderTextColor="#a0a0a0ff"
          onChangeText={onSearchChange}
          style={styles.searchInput}
          editable={!loading}
        />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Danh sách bài học</Text>
        <View style={styles.sectionLine} />
      </View>

      {loading && (
        <LoadingWithContainer size={48} color="#F1BE4B" text="Đang tải quy tắc..." style={styles.centered} />
      )}

      {!loading && error && rules.length === 0 && (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={onRetry}>
            <Text style={styles.retryText}>Thử lại</Text>
          </Pressable>
        </View>
      )}

      {!loading && !error && filteredRules.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>Không tìm thấy quy tắc nào</Text>
        </View>
      ) : (
        !loading && !error && (
          <PronunciationRuleList rules={filteredRules} onSelectRule={onRulePress} />
        )
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'flex-start',
    paddingHorizontal: 4,
    backgroundColor: '#FFF8E7',
  },
  titleContainer: { width: '100%', alignItems: 'center', marginTop: 12 },
  title: { fontSize: 36, fontWeight: '900', color: '#1F1F1F', fontFamily: 'Epilogue, sans-serif', textAlign: 'center' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 13,
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
    marginBottom: 20,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
  },
  sectionLine: {
    flex: 1,
    height: 3,
    backgroundColor: '#D8C39A',
    borderRadius: 2,
  },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, minHeight: 220 },
  errorText: { fontSize: 14, color: '#ff4d4f', marginBottom: 12, textAlign: 'center' },
  retryButton: { backgroundColor: '#F1BE4B', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  retryText: { fontSize: 14, fontWeight: '700', color: '#1F1F1F' },
  emptyText: { fontSize: 14, color: '#666' },
})
