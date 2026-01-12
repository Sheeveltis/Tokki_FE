import React, { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native'
import { getCommentsByBlog, createComment } from '../../api/api'

/**
 * BlogComments: Component hiển thị và quản lý comments
 * @param {Object} props
 * @param {string} props.blogId - ID của blog
 */
export function BlogComments({ blogId }) {
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyContent, setReplyContent] = useState('')

  // Load comments khi blogId thay đổi
  useEffect(() => {
    const loadComments = async () => {
      if (!blogId) return
      try {
        setLoading(true)
        // API đã trả về comments với replies sẵn trong mỗi comment
        const data = await getCommentsByBlog(blogId)
        setComments(data)
      } catch (err) {
        console.error('Error loading comments:', err)
      } finally {
        setLoading(false)
      }
    }
    loadComments()
  }, [blogId])

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !blogId) return

    setIsSubmitting(true)
    try {
      const response = await createComment({
        blogId,
        content: newComment,
        parentId: null,
      })
      
      if (response.isSuccess) {
        // Reload comments sau khi tạo thành công
        const data = await getCommentsByBlog(blogId)
        setComments(data)
        setNewComment('')
      }
    } catch (err) {
      console.error('Error submitting comment:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitReply = async (parentId) => {
    if (!replyContent.trim() || !blogId || !parentId) return

    setIsSubmitting(true)
    try {
      const response = await createComment({
        blogId,
        content: replyContent,
        parentId,
      })
      
      if (response.isSuccess) {
        // Reload comments sau khi reply thành công
        const data = await getCommentsByBlog(blogId)
        setComments(data)
        setReplyContent('')
        setReplyingTo(null)
      }
    } catch (err) {
      console.error('Error submitting reply:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Vừa xong'
    if (diffMins < 60) return `${diffMins} phút trước`
    if (diffHours < 24) return `${diffHours} giờ trước`
    if (diffDays < 7) return `${diffDays} ngày trước`
    return date.toLocaleDateString('vi-VN')
  }

  const totalComments = comments.reduce((sum, c) => sum + 1 + (c.replies?.length || 0), 0)

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bình luận ({totalComments})</Text>

      {/* Form thêm comment mới */}
      <View style={styles.commentForm}>
        <TextInput
          style={styles.input}
          placeholder="Viết bình luận..."
          value={newComment}
          onChangeText={setNewComment}
          multiline
          numberOfLines={3}
        />
        <TouchableOpacity
          style={[styles.submitButton, (!newComment.trim() || isSubmitting) && styles.submitButtonDisabled]}
          onPress={handleSubmitComment}
          disabled={!newComment.trim() || isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Đang gửi...' : 'Gửi bình luận'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Danh sách comments */}
      {loading ? (
        <Text style={styles.loadingText}>Đang tải bình luận...</Text>
      ) : (
        <ScrollView style={styles.commentsList}>
          {comments.length === 0 ? (
            <Text style={styles.emptyText}>Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</Text>
          ) : (
            comments.map((comment) => (
              <View key={comment.id}>
                <View style={styles.commentItem}>
                  <Image 
                    source={{ uri: comment.authorAvatar || 'https://i.pravatar.cc/150?img=33' }} 
                    style={styles.commentAvatar}
                  />
                  <View style={styles.commentContent}>
                    <View style={styles.commentHeader}>
                      <Text style={styles.commentAuthor}>{comment.authorName || 'Người dùng'}</Text>
                      <Text style={styles.commentDate}>{formatDate(comment.createdAt)}</Text>
                    </View>
                    <Text style={styles.commentText}>{comment.content}</Text>
                    <View style={styles.commentActions}>
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                      >
                        <Text style={styles.actionText}>Trả lời</Text>
                      </TouchableOpacity>
                    </View>
                    
                    {/* Form reply */}
                    {replyingTo === comment.id && (
                      <View style={styles.replyForm}>
                        <TextInput
                          style={styles.replyInput}
                          placeholder="Viết phản hồi..."
                          value={replyContent}
                          onChangeText={setReplyContent}
                          multiline
                          numberOfLines={2}
                        />
                        <View style={styles.replyActions}>
                          <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => {
                              setReplyingTo(null)
                              setReplyContent('')
                            }}
                          >
                            <Text style={styles.cancelButtonText}>Hủy</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.replyButton, (!replyContent.trim() || isSubmitting) && styles.submitButtonDisabled]}
                            onPress={() => handleSubmitReply(comment.id)}
                            disabled={!replyContent.trim() || isSubmitting}
                          >
                            <Text style={styles.replyButtonText}>
                              {isSubmitting ? 'Đang gửi...' : 'Gửi'}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}

                    {/* Hiển thị replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <View style={styles.repliesContainer}>
                        {comment.replies.map((reply) => (
                          <View key={reply.id} style={styles.replyItem}>
                            <Image 
                              source={{ uri: reply.authorAvatar || 'https://i.pravatar.cc/150?img=33' }} 
                              style={styles.replyAvatar}
                            />
                            <View style={styles.replyContent}>
                              <View style={styles.commentHeader}>
                                <Text style={styles.commentAuthor}>{reply.authorName || 'Người dùng'}</Text>
                                <Text style={styles.commentDate}>{formatDate(reply.createdAt)}</Text>
                              </View>
                              <Text style={styles.commentText}>{reply.content}</Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f1f1f',
    marginBottom: 20,
  },
  commentForm: {
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    marginBottom: 12,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#1890ff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  submitButtonDisabled: {
    backgroundColor: '#d0d0d0',
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  commentsList: {
    maxHeight: 600,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#e0e0e0',
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f1f1f',
    marginRight: 8,
  },
  commentDate: {
    fontSize: 12,
    color: '#999',
  },
  commentText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 8,
  },
  commentActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    paddingVertical: 4,
  },
  actionText: {
    fontSize: 12,
    color: '#666',
  },
  replyForm: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  replyInput: {
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
    minHeight: 60,
    marginBottom: 8,
    textAlignVertical: 'top',
  },
  replyActions: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },
  cancelButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  cancelButtonText: {
    fontSize: 12,
    color: '#666',
  },
  replyButton: {
    backgroundColor: '#1890ff',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  replyButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  repliesContainer: {
    marginTop: 12,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: '#e0e0e0',
  },
  replyItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  replyAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#e0e0e0',
  },
  replyContent: {
    flex: 1,
  },
  loadingText: {
    textAlign: 'center',
    color: '#999',
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    padding: 40,
    fontStyle: 'italic',
  },
})

