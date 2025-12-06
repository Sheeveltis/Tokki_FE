import React, { useEffect, useState } from 'react'
import { Text, View, StyleSheet } from 'react-native'
import { useParams } from 'solito/navigation'

import { BlogLayout } from './components/blog-layout'
import { getBlogDetail } from '../api/api'
import { Loading } from '../../../../components/Loading' 

import { BlogMainContent } from './components/blog-main'

export function BlogDetailScreen() {
  const params = useParams()
  const slug = params?.slug 

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return
      setLoading(true)
      setError(null)

      try {
        const result = await getBlogDetail(slug)
        setData(result)
      } catch (err) {
        console.error(err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [slug])

  // Render content dựa trên state
  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <Loading
            size={48}
            color="#5E794C"
            shadowColor="#5E794C50"
            text="Đang tải dữ liệu..."
            style={styles.loading}
          />
        </View>
      )
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Lỗi: {error}</Text>
        </View>
      )
    }

    if (!data) {
      return null
    }

    return <BlogMainContent data={data} />
  }

  return (
    <BlogLayout relatedPosts={data?.relatedPosts || []}>
      {renderContent()}
    </BlogLayout>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    minHeight: 400,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    minHeight: 400,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    color: '#ff4d4f',
    fontSize: 18,
    textAlign: 'center',
  },
})