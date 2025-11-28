import React, { useEffect, useState } from 'react'
import { Text, ActivityIndicator, View } from 'react-native'
import { useParams } from 'solito/navigation'

import { BlogLayout } from './components/blog-layout'
import { getBlogDetail } from './api' 

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

  if (loading) return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="blue" />
        <Text style={{marginTop: 10}}>Đang tải dữ liệu...</Text>
    </View>
  )

  if (error) return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text style={{color: 'red', fontSize: 18}}>Lỗi: {error}</Text>
    </View>
  )

  if (!data) return null

  return (
    <BlogLayout relatedPosts={data.relatedPosts}>
       <BlogMainContent data={data} />
    </BlogLayout>
  )
}