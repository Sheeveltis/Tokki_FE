import React, { useState } from 'react'
import {
  Typography,
  Card,
  Tag,
  Avatar,
  Button,
  Space,
  Divider,
  List,
  Input,
  message,
  Tooltip,
  Breadcrumb
} from 'antd'
import {
  HeartOutlined,
  HeartFilled,
  MessageOutlined,
  ShareAltOutlined,
  SendOutlined,
  UserOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons'
import { HtmlViewer } from './html-viewer'
import { useRouter } from 'solito/navigation'
import { createComment } from '../../api'

const { Title, Text } = Typography
const { TextArea } = Input

const FALLBACK_AVATAR = 'https://ui-avatars.com/api/?name=Tokki&background=F1BE4B&color=fff&size=64'
const FALLBACK_IMG = 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=1200'

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).replace('lúc', 'Lúc')
}

/**
 * Component hiển thị từng bình luận (hỗ trợ đệ quy cho replies)
 */
const CommentItem = ({ comment, onReply, currentUserAvatar }) => {
  const [showReply, setShowReply] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleReply = async () => {
    if (!replyText.trim()) return
    setSubmitting(true)
    try {
      await onReply(comment.id, replyText)
      setReplyText('')
      setShowReply(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="bld-comment-item"
      style={{
        marginBottom: comment.parentId ? '4px' : '10px',
        padding: comment.parentId ? '0px 12px' : '12px 16px'
      }}
    >
      <div style={{ display: 'flex', gap: '12px' }}>
        <Avatar
          src={comment.authorAvatar || FALLBACK_AVATAR}
          size={comment.parentId ? 32 : 44}
          style={{ flexShrink: 0, objectFit: 'cover' }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <Text strong style={{ fontSize: comment.parentId ? '14px' : '15px' }}>{comment.authorName}</Text>
            <Text type="secondary" style={{ fontSize: '11px' }}>{formatDate(comment.createdAt)}</Text>
          </div>
          <Text style={{ color: '#334155', fontSize: '15px', lineHeight: 1.6 }}>{comment.content}</Text>

          <div style={{ marginTop: '8px' }}>
            <Button
              type="link"
              size="small"
              style={{ padding: 0, height: 'auto', color: '#F1BE4B', fontWeight: 700, fontSize: '12px' }}
              onClick={() => setShowReply(!showReply)}
            >
              Trả lời
            </Button>
          </div>

          {showReply && (
            <div style={{ marginTop: '12px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <Avatar
                src={currentUserAvatar || FALLBACK_AVATAR}
                size={32}
                style={{ flexShrink: 0, objectFit: 'cover' }}
              />
              <TextArea
                placeholder="Viết câu trả lời..."
                autoSize
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                style={{ borderRadius: '12px', background: '#fff', flex: 1 }}
              />
              <Button
                type="primary"
                shape="circle"
                loading={submitting}
                icon={<SendOutlined />}
                onClick={handleReply}
                disabled={!replyText.trim()}
                style={{
                  background: replyText.trim() ? '#F1BE4B' : '#F1BE4B66',
                  borderColor: 'transparent',
                  color: '#fff',
                  boxShadow: replyText.trim() ? '0 4px 10px rgba(241, 190, 75, 0.3)' : 'none'
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Render đệ quy replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div style={{ marginLeft: '16px', marginTop: '6px', borderLeft: '2px solid #F1BE4B15', paddingLeft: '12px' }}>
          {comment.replies.map(reply => (
            <CommentItem key={reply.id} comment={reply} onReply={onReply} />
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * BlogMainContent (Web) — Premium Hero Overlap Style
 */
export function BlogMainContent({ data, comments = [], currentUser, onCommentPosted }) {
  const router = useRouter()
  const { title, categoryName, thumbnailUrl, content, author, createdAt, viewCount, id } = data
  const authorName = author?.fullName || 'Ẩn danh'
  const authorAvatar = author?.avatarUrl || FALLBACK_AVATAR

  const [liked, setLiked] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleLike = () => {
    setLiked(!liked)
    message.success(liked ? 'Đã bỏ thích bài viết' : 'Đã thích bài viết!')
  }

  const handlePostComment = async (parentId = null, text = '') => {
    const contentText = text || commentText
    if (!contentText.trim()) return

    if (!parentId) setSubmitting(true)
    try {
      const res = await createComment({
        blogId: id,
        content: contentText,
        parentId: parentId
      })
      if (res.isSuccess) {
        message.success('Đã gửi bình luận!')
        if (!parentId) setCommentText('')
        onCommentPosted?.()
      } else {
        message.error(res.message || 'Không thể gửi bình luận')
      }
    } catch (err) {
      console.error(err)
      message.error('Lỗi khi gửi bình luận')
    } finally {
      if (!parentId) setSubmitting(false)
    }
  }

  return (
    <div className="bld-main-container">
      <style dangerouslySetInnerHTML={{
        __html: `
        .bld-main-container { position: relative; }
        .bld-hero-banner {
          width: 100%;
          height: 480px;
          border-radius: 40px;
          overflow: hidden;
          position: relative;
          background: #1e293b;
          box-shadow: 0 12px 40px rgba(0,0,0,0.1);
        }
        .bld-hero-img { width: 100%; height: 100%; object-fit: cover; opacity: 0.9; }
        .bld-hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 100%);
        }
        .bld-back-btn { position: absolute; top: 24px; left: 24px; z-index: 10; }
        .bld-content-card {
          margin-top: -160px;
          margin-left: 32px;
          margin-right: 32px;
          border-radius: 40px !important;
          border: none !important;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15) !important;
          background: #fff;
          z-index: 5;
          position: relative;
        }
        .bld-card-body { padding: 60px 48px !important; }
        @media (max-width: 768px) {
          .bld-hero-banner { height: 320px; border-radius: 24px; }
          .bld-content-card { margin-top: -80px; margin-left: 16px; margin-right: 16px; }
          .bld-card-body { padding: 32px 20px !important; }
        }
        .bld-title {
          font-family: 'Epilogue', sans-serif !important;
          font-weight: 900 !important;
          font-size: 42px !important;
          line-height: 1.2 !important;
          color: #1A1A1A !important;
          letter-spacing: -1.5px !important;
          margin-bottom: 24px !important;
        }
        .bld-category-tag {
          background: #FEF7E6 !important;
          color: #D9A635 !important;
          border: 1px solid #F1BE4B33 !important;
          border-radius: 100px !important;
          padding: 4px 16px !important;
          font-weight: 800 !important;
          text-transform: uppercase !important;
          font-size: 11px !important;
          letter-spacing: 0.1em !important;
        }
        .bld-author-box {
          display: flex;
          align-items: center;
          gap: 20px;
          background: #F8FAFC;
          padding: 24px;
          border-radius: 24px;
          margin-bottom: 48px;
        }
        .bld-author-name { font-weight: 800; font-size: 18px; color: #1A1A1A; display: block; margin-bottom: 2px; }
        .bld-author-role { font-size: 14px; color: #64748B; font-weight: 500; }
        .bld-interactions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 60px;
          padding-top: 40px;
          border-top: 1px solid #F1F5F9;
        }
        .bld-int-btn {
          height: 54px !important;
          padding: 0 32px !important;
          border-radius: 16px !important;
          font-weight: 700 !important;
          font-size: 15px !important;
          display: flex !important;
          align-items: center !important;
          gap: 10px !important;
          border: none !important;
          background: #F8FAFC !important;
          transition: all 0.2s ease !important;
        }
        .bld-int-btn.liked { background: #FEF2F2 !important; color: #EF4444 !important; }
        .bld-comment-input {
          background: #FEF7E6 !important;
          border: 1px solid transparent !important;
          border-radius: 20px !important;
          padding: 20px 60px 20px 20px !important;
          font-family: 'Epilogue', sans-serif !important;
          margin-bottom: 0px !important;
          transition: all 0.3s ease !important;
        }
        .bld-comment-input:focus {
          background: #fff !important;
          border-color: #F1BE4B !important;
          box-shadow: 0 0 0 4px rgba(241, 190, 75, 0.1) !important;
        }
        .bld-comment-item {
          background: #FEF7E6;
          padding: 8px 16px;
          border-radius: 20px;
          margin-bottom: 12px;
        }
        .ant-avatar img {
          object-fit: cover !important;
          width: 100% !important;
          height: 100% !important;
        }
        `
      }} />

      <div className="bld-hero-banner">
        <Button
          className="bld-back-btn"
          shape="round"
          icon={<ArrowLeftOutlined style={{ fontSize: 16 }} />}
          onClick={() => router.back()}
          style={{ height: 44, fontWeight: 700, border: 'none', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)' }}
        >
          Trở về
        </Button>
        <img src={thumbnailUrl || FALLBACK_IMG} className="bld-hero-img" alt={title} />
        <div className="bld-hero-overlay" />
      </div>

      <Card className="bld-content-card" styles={{ body: { padding: 0 } }}>
        <div className="bld-card-body">
          <Breadcrumb
            style={{ marginBottom: 24, fontSize: 13, fontWeight: 600, color: '#94A3B8' }}
            items={[
              { title: 'Trang chủ', href: '/' },
              { title: 'Blog', href: '/blog' },
              { title: categoryName || 'Chi tiết' },
            ]}
          />

          <Space orientation="vertical" size={16} style={{ width: '100%', marginBottom: 32 }}>
            <Tag className="bld-category-tag">{categoryName || 'Cộng đồng'}</Tag>
            <Title level={1} className="bld-title">{title}</Title>
            <Text type="secondary" style={{ fontSize: 14, fontWeight: 500 }}>
              {formatDate(createdAt)} • {Math.ceil((content?.length || 0) / 1000) + 2} phút đọc • {viewCount} lượt xem
            </Text>
          </Space>

          <div className="bld-author-box">
            <Avatar
              size={64}
              src={authorAvatar}
              style={{ border: '3px solid #fff', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', flexShrink: 0, objectFit: 'cover' }}
            />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <span className="bld-author-name">{authorName}</span>
              <span className="bld-author-role">Tác giả cộng đồng Tokki</span>
            </div>
            <Button
              type="primary"
              shape="round"
              style={{ background: '#F1BE4B', borderColor: '#F1BE4B', fontWeight: 800, height: 40 }}
            >
              Theo dõi
            </Button>
          </div>

          <div style={{ marginBottom: 60 }}>
            <HtmlViewer html={content} />
          </div>

          {data.tags && data.tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 40 }}>
              {data.tags.map((t, i) => (
                <Tag key={i} style={{ borderRadius: 8, padding: '4px 12px', fontWeight: 600, color: '#64748B' }}>#{t}</Tag>
              ))}
            </div>
          )}

          <div className="bld-interactions">
            <Space size="middle">
              <Button
                className={`bld-int-btn ${liked ? 'liked' : ''}`}
                onClick={handleLike}
                icon={liked ? <HeartFilled /> : <HeartOutlined />}
              >
                {liked ? 'Đã thích' : 'Yêu thích'}
              </Button>
              <Button className="bld-int-btn" icon={<MessageOutlined />}>
                {comments.length} Bình luận
              </Button>
            </Space>
          </div>

          <div style={{ marginTop: 80 }}>
            <Title level={3} style={{ fontWeight: 900, marginBottom: 32 }}>Thảo luận ({comments.length})</Title>

            <div style={{ display: 'flex', gap: 20, marginBottom: 48 }}>
              <Avatar
                size={48}
                src={currentUser?.avatarUrl || FALLBACK_AVATAR}
                icon={!currentUser?.avatarUrl && <UserOutlined />}
                style={{ background: '#FEF7E6', color: '#F1BE4B', flexShrink: 0, objectFit: 'cover' }}
              />
              <div style={{ flex: 1, position: 'relative' }}>
                <TextArea
                  className="bld-comment-input"
                  placeholder="Chia sẻ suy nghĩ của bạn..."
                  autoSize={{ minRows: 3, maxRows: 6 }}
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  style={{ width: '100%', paddingRight: 60 }}
                />
                <Button
                  type="primary"
                  shape="circle"
                  size="large"
                  loading={submitting}
                  disabled={!commentText.trim()}
                  icon={<SendOutlined />}
                  style={{
                    position: 'absolute',
                    bottom: 28,
                    right: 16,
                    background: commentText.trim() ? '#F1BE4B' : '#F1BE4B66',
                    borderColor: 'transparent',
                    color: '#fff',
                    boxShadow: commentText.trim() ? '0 8px 20px rgba(241, 190, 75, 0.25)' : 'none',
                    zIndex: 2
                  }}
                  onClick={() => handlePostComment()}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {comments.map(c => (
                <CommentItem
                  key={c.id}
                  comment={c}
                  currentUserAvatar={currentUser?.avatarUrl}
                  onReply={(parentId, text) => handlePostComment(parentId, text)}
                />
              ))}
              {comments.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 0', background: '#F8FAFC', borderRadius: 24 }}>
                  <Text type="secondary">Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ ý kiến!</Text>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}