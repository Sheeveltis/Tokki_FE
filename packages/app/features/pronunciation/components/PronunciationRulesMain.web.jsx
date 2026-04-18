import React from 'react'
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Pressable } from 'react-native'
import { LoadingWithContainer } from '../../../../components/Loading'
import { PronunciationRuleList } from './PronunciationRuleList'

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
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Hướng dẫn phát âm</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <TextInput
            value={searchTerm}
            placeholder="Tìm kiếm quy tắc phát âm..."
            onChangeText={onSearchChange}
            style={styles.searchInput}
            editable={!loading}
          />
        </View>
        <TouchableOpacity style={styles.searchButton}>
          <Text style={styles.searchButtonText}>Tìm</Text>
        </TouchableOpacity>
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
    alignItems: 'center',
  },
  titleContainer: { width: '100%', alignItems: 'center', marginTop: 12 },
  title: { fontSize: 44, fontWeight: '900', color: '#1F1F1F', fontFamily: 'Epilogue, sans-serif', textAlign: 'center' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, width: '90%', maxWidth: 900, marginTop: 8, marginBottom: 16 },
  searchInputWrapper: { flex: 1 },
  searchInput: { width: '100%', height: 40, paddingHorizontal: 12, borderRadius: 100, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E0E0E0' },
  searchButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: '#F1BE4B' },
  searchButtonText: { fontSize: 14, fontWeight: '700', color: '#1F1F1F' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, minHeight: 220 },
  errorText: { fontSize: 14, color: '#ff4d4f', marginBottom: 12, textAlign: 'center' },
  retryButton: { backgroundColor: '#F1BE4B', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  retryText: { fontSize: 14, fontWeight: '700', color: '#1F1F1F' },
  emptyText: { fontSize: 14, color: '#666' },
})
