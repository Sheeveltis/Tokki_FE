'use client'

import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView, ActivityIndicator, Platform } from 'react-native'
import { useRouter } from 'solito/navigation'
import { NavigationPill } from 'components/navigation-pill'
import ArrowIcon from '../../../../../assets/icon/icon-mainflow/arrow.svg'
import { fetchVocabularyDetail, fetchUserVocabularyExamples } from '../../api'

/**
 * Màn chi tiết từ vựng cho Dictionary (user):
 * - Chỉ hiển thị thông tin, không có chức năng admin (edit/delete)
 *
 * @param {{ vocabularyId: string }} props
 */
export function DictionaryVocabularyDetailScreen({ vocabularyId }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [detail, setDetail] = useState(null)
  const [examples, setExamples] = useState([])

  useEffect(() => {
    if (!vocabularyId) {
      setError('Không tìm thấy ID từ vựng')
      setLoading(false)
      return
    }

    let mounted = true
    const loadDetail = async () => {
      try {
        setLoading(true)
        setError('')
        const [data, exampleList] = await Promise.all([
          fetchVocabularyDetail(vocabularyId),
          fetchUserVocabularyExamples(vocabularyId),
        ])
        if (mounted) {
          setDetail(data)
          setExamples(Array.isArray(exampleList) ? exampleList : [])
        }
      } catch (e) {
        console.error('Error loading vocabulary detail (dictionary):', e)
        if (mounted) {
          setError(e?.message || 'Không thể tải chi tiết từ vựng.')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadDetail()

    return () => {
      mounted = false
    }
  }, [vocabularyId])

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
        <View style={{ alignSelf: 'flex-start', marginBottom: 0 }}>
          <NavigationPill
            label="Quay lại"
            to={undefined}
            icon={ArrowIcon}
            onPress={() => router.push('/dictionary')}
            textStyle={{ fontWeight: '700' }}
            iconStyle={{ transform: [{ scaleX: -1 }] }}
          />
        </View>

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
          Chi tiết từ vựng
        </Text>

        {loading && (
          <View
            style={{
              width: '100%',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 0,
              gap: 8,
            }}
          >
            <ActivityIndicator color="#6366F1" />
            <Text style={{ color: '#4B5563', fontSize: 13 }}>Đang tải chi tiết từ vựng...</Text>
          </View>
        )}

        {!loading && !!error && (
          <View
            style={{
              width: '100%',
              marginTop: 0,
              padding: 12,
              borderRadius: 8,
              backgroundColor: '#FEE2E2',
              borderWidth: 1,
              borderColor: '#FCA5A5',
            }}
          >
            <Text
              style={{
                color: '#B91C1C',
                fontSize: 13,
              }}
            >
              {error}
            </Text>
          </View>
        )}

        {!loading && !error && !detail && (
          <Text
            style={{
              width: '100%',
              marginTop: 0,
              color: '#6B7280',
              fontSize: 13,
            }}
          >
            Không tìm thấy dữ liệu từ vựng.
          </Text>
        )}

        {!loading && !!detail && (
          <ScrollView
            style={{ width: '100%' }}
            contentContainerStyle={{
              width: '100%',
              paddingVertical: 12,
              paddingBottom: 40,
              gap: 16,
            }}
          >
            <View
              style={{
                width: '100%',
                padding: 16,
                borderRadius: 12,
                backgroundColor: '#FFFFFF',
                borderWidth: 1,
                borderColor: '#F3F4F6',
                shadowColor: '#000',
                shadowOpacity: 0.04,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 2 },
              }}
            >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                marginBottom: 8,
              }}
            >
              <View style={{ flexShrink: 1, paddingRight: 8 }}>
                <Text
                  style={{
                    fontSize: 50,
                    fontWeight: '800',
                    color: '#111827',
                  }}
                >
                  {detail.text || 'Không có từ'}
                </Text>
                {!!detail.pronunciation && (
                  <Text
                    style={{
                      fontSize: 20,
                      color: '#6B7280',
                      marginTop: 4,
                    }}
                  >
                    /{detail.pronunciation}/
                  </Text>
                )}
              </View>

              {!!detail.vocabularyId && (
                <Text
                  style={{
                    fontSize: 11,
                    color: '#9CA3AF',
                  }}
                >
                  ID: {detail.vocabularyId}
                </Text>
              )}
            </View>

            {!!detail.definition && (
              <View
                style={{
                  marginTop: 8,
                  padding: 10,
                  borderRadius: 10,
                  backgroundColor: '#FEF3C7',
                }}
              >
                <Text
                  style={{
                    fontSize: 15,
                    color: '#92400E',
                  }}
                >
                  {detail.definition}
                </Text>
              </View>
            )}
          </View>

            {examples.length > 0 && (
              <View
                style={{
                  width: '100%',
                  padding: 16,
                  borderRadius: 12,
                  backgroundColor: '#FFFFFF',
                  borderWidth: 1,
                  borderColor: '#F3F4F6',
                }}
              >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '700',
                  marginBottom: 8,
                  color: '#111827',
                }}
              >
                Ví dụ
              </Text>

              {examples.map((ex, index) => (
                <View
                  key={ex.exampleId || index}
                  style={{
                    paddingVertical: 6,
                    borderBottomWidth: index === examples.length - 1 ? 0 : 1,
                    borderBottomColor: '#E5E7EB',
                  }}
                >
                  {!!ex.sentence && (
                    <Text
                      style={{
                        fontSize: 18,
                        color: '#111827',
                        fontWeight: '700',
                      }}
                    >
                      {ex.sentence}
                    </Text>
                  )}
                  {!!ex.translation && (
                    <Text
                      style={{
                        fontSize: 13,
                        color: '#6B7280',
                        marginTop: 2,
                      }}
                    >
                      {ex.translation}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}

            {examples.length === 0 && (
              <Text
                style={{
                  width: '100%',
                  fontSize: 16,
                  color: '#6B7280',
                }}
              >
                Chưa có câu ví dụ cho từ vựng này.
              </Text>
            )}
        </ScrollView>
      )}
      </View>
    </View>
  )
}

export default DictionaryVocabularyDetailScreen


