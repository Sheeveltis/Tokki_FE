'use client'

import React, { useCallback, useEffect, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native'
import { useRouter } from 'solito/navigation'
import { fetchVocabularies } from '../../api'

/**
 * Màn Dictionary dành cho user:
 * - Cho phép tìm kiếm từ vựng theo ID hoặc theo text tiếng Hàn
 * - Hiển thị nhanh nghĩa, phiên âm và ví dụ (nếu có)
 */
export function DictionarySearchScreen() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = useCallback(async () => {
    const trimmed = query.trim()
    setHasSearched(true)
    setError('')

    if (!trimmed) {
      setResults([])
      return
    }

    try {
      setLoading(true)

      // Reuse logic từ VocabularyManagement: phân biệt vocabId và searchText
      let vocabId = null
      let searchText = null

      const hasKorean = /[가-힣]/.test(trimmed)
      const hasSpace = trimmed.includes(' ')
      const isLongId = trimmed.length >= 10 && trimmed.length <= 20

      if (!hasKorean && !hasSpace && isLongId && /^[a-zA-Z0-9_-]+$/.test(trimmed)) {
        vocabId = trimmed
      } else {
        searchText = trimmed
      }

      const res = await fetchVocabularies({
        pageNumber: 1,
        pageSize: 20,
        status: 1,
        vocabId,
        searchText,
      })

      const items = Array.isArray(res?.items) ? res.items : []
      setResults(items)
      if (items.length === 0) {
        setError('Không tìm thấy từ vựng phù hợp.')
      }
    } catch (e) {
      console.error('Error searching vocabularies in dictionary screen:', e)
      setError('Đã xảy ra lỗi khi tìm kiếm. Vui lòng thử lại.')
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [query])

  const handleSubmitEditing = () => {
    if (!loading) {
      handleSearch()
    }
  }

  // Tự động tìm kiếm khi người dùng nhập (debounce)
  useEffect(() => {
    const trimmed = query.trim()

    // Nếu xóa hết input thì clear kết quả, không gọi API
    if (!trimmed) {
      setResults([])
      setError('')
      setHasSearched(false)
      return
    }

    const timer = setTimeout(() => {
      if (!loading) {
        handleSearch()
      }
    }, 500) // debounce 500ms

    return () => clearTimeout(timer)
  }, [query, handleSearch])

  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'web' ? 32 : 24,
        paddingBottom: 32,
      }}
    >
      <View
        style={{
          width: '100%',
          backgroundColor: '#F5F0DD',
          borderRadius: 16,
          paddingVertical: 24,
          paddingHorizontal: 24,
          gap: 24,
        }}
      >
        <Text
          style={{
            fontSize: 24,
            fontWeight: '700',
            marginBottom: 0,
            color: '#111827',
            textAlign: 'center',
            width: '100%',
          }}
        >
          Từ điển Tokki
        </Text>

        <Text
          style={{
            fontSize: 14,
            color: '#4B5563',
            textAlign: 'center',
            marginBottom: 0,
            width: '100%',
          }}
        >
          Nhập từ tiếng Hàn hoặc nghĩa của từ để tra cứu từ vựng nhanh.
        </Text>

        <View
          style={{
            width: '100%',
            flexDirection: Platform.OS === 'web' ? 'row' : 'column',
            alignItems: 'center',
            gap: 12,
            marginBottom: 0,
          }}
        >
        <View
          style={{
            flex: 1,
            minWidth: 0,
          }}
        >
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={loading ? 'Đang tìm kiếm...' : 'Nhập từ tiếng Hàn hoặc nghĩa của từ...'}
            onSubmitEditing={handleSubmitEditing}
            style={{
              width: '100%',
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: loading ? '#6366F1' : '#E5E7EB',
              backgroundColor: loading ? '#EEF2FF' : '#FFFFFF',
              fontSize: 14,
              color: '#111827',
            }}
          />
        </View>

        <TouchableOpacity
          onPress={handleSearch}
          disabled={loading}
          style={{
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 999,
            backgroundColor: loading ? '#A5B4FC' : '#6366F1',
            opacity: loading ? 0.8 : 1,
          }}
        >
          <Text
            style={{
              color: '#FFFFFF',
              fontWeight: '600',
              fontSize: 14,
            }}
          >
            {loading ? 'Đang tìm...' : 'Tìm kiếm'}
          </Text>
        </TouchableOpacity>
      </View>

        {loading && (
          <View
            style={{
              width: '100%',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 0,
              gap: 8,
            }}
          >
            <ActivityIndicator color="#6366F1" />
            <Text style={{ color: '#4B5563', fontSize: 13 }}>Đang tải kết quả...</Text>
          </View>
        )}

        {!!error && !loading && (
          <Text
            style={{
              width: '100%',
              color: '#DC2626',
              fontSize: 13,
              textAlign: 'center',
              marginBottom: 0,
            }}
          >
            {error}
          </Text>
        )}

        {!loading && results.length > 0 && (
          <Text
            style={{
              width: '100%',
              color: '#6B7280',
              fontSize: 13,
              marginBottom: 0,
            }}
          >
            Tìm thấy {results.length} kết quả
          </Text>
        )}

        {!loading && hasSearched && results.length === 0 && !error && (
          <Text
            style={{
              width: '100%',
              color: '#6B7280',
              fontSize: 13,
              textAlign: 'center',
              marginTop: 0,
            }}
          >
            Chưa có kết quả. Hãy thử từ khóa khác nhé.
          </Text>
        )}

        <ScrollView
          style={{ width: '100%' }}
          contentContainerStyle={{
            width: '100%',
            paddingBottom: 40,
            gap: 12,
          }}
        >
        {results.map((item) => (
          <TouchableOpacity
            key={item.vocabularyId || item.id}
            activeOpacity={0.8}
            onPress={() => {
              const id = item.vocabularyId || item.id
              if (id) {
                router.push(`/dictionary/${id}`)
              }
            }}
            style={{
              padding: 14,
              borderRadius: 12,
              backgroundColor: '#FFFFFF',
              shadowColor: '#000',
              shadowOpacity: 0.04,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 2 },
              borderWidth: 1,
              borderColor: '#F3F4F6',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 4,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '700',
                  color: '#111827',
                }}
              >
                {item.text || 'Không có từ'}
              </Text>
              {!!item.pronunciation && (
                <Text
                  style={{
                    fontSize: 13,
                    color: '#6B7280',
                    marginLeft: 8,
                  }}
                >
                  /{item.pronunciation}/
                </Text>
              )}
            </View>

            {!!item.definition && (
              <Text
                style={{
                  fontSize: 14,
                  color: '#374151',
                  marginBottom: 6,
                }}
              >
                {item.definition}
              </Text>
            )}

            {!!item.vocabularyId && (
              <Text
                style={{
                  fontSize: 11,
                  color: '#9CA3AF',
                }}
              >
                ID: {item.vocabularyId}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
      </View>
    </View>
  )
}

export default DictionarySearchScreen


