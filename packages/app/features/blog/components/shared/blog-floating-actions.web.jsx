'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { FloatButton, Tooltip, message, ConfigProvider } from 'antd'
import {
  PlusOutlined,
  FileTextOutlined,
  ShareAltOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { useRouter } from 'solito/navigation'

/**
 * BlogFloatingActions: Thành phần nút hành động nổi (Floating Action Button) 
 * dùng chung cho các màn hình liên quan đến Blog.
 * 
 * Tính năng:
 * - Dùng riêng cho nền tảng WEB (Sử dụng Ant Design).
 * - Có thể kéo (drag) đến bất kỳ vị trí nào trên màn hình.
 * - Click để hiển thị các thao tác (không hiển thị khi hover).
 * - Tích hợp các thao tác: Tạo mới, Quản lý, Chia sẻ.
 * 
 * @param {boolean} isDetail - Có phải đang ở trang chi tiết blog không (để hiện nút Chia sẻ)
 */
export function BlogFloatingActions({ isDetail = false }) {
  const router = useRouter()
  
  // Quản lý vị trí
  const [pos, setPos] = useState({ x: 32, y: 32 })
  const [dragging, setDragging] = useState(false)
  const [moved, setMoved] = useState(false)
  
  const dragInfo = useRef({ startX: 0, startY: 0, mouseX: 0, mouseY: 0 })

  const startDragging = useCallback((clientX, clientY) => {
    dragInfo.current = {
      startX: pos.x,
      startY: pos.y,
      mouseX: clientX,
      mouseY: clientY
    }
    setDragging(true)
    setMoved(false)
  }, [pos])

  const onMouseDown = (e) => {
    if (e.button !== 0) return 
    startDragging(e.clientX, e.clientY)
  }

  const onTouchStart = (e) => {
    const touch = e.touches[0]
    startDragging(touch.clientX, touch.clientY)
  }

  useEffect(() => {
    const handleMove = (clientX, clientY) => {
      if (!dragging) return
      
      const dx = clientX - dragInfo.current.mouseX
      const dy = dragInfo.current.mouseY - clientY 

      const newX = dragInfo.current.startX + dx
      const newY = dragInfo.current.startY + dy

      const boundedX = Math.max(16, Math.min(window.innerWidth - 70, newX))
      const boundedY = Math.max(16, Math.min(window.innerHeight - 70, newY))

      if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
        setMoved(true)
      }

      setPos({ x: boundedX, y: boundedY })
    }

    const mouseMove = (e) => handleMove(e.clientX, e.clientY)
    const touchMove = (e) => {
      if (dragging) e.preventDefault()
      handleMove(e.touches[0].clientX, e.touches[0].clientY)
    }

    const stopDrag = () => setDragging(false)

    if (dragging) {
      window.addEventListener('mousemove', mouseMove)
      window.addEventListener('mouseup', stopDrag)
      window.addEventListener('touchmove', touchMove, { passive: false })
      window.addEventListener('touchend', stopDrag)
    }

    return () => {
      window.removeEventListener('mousemove', mouseMove)
      window.removeEventListener('mouseup', stopDrag)
      window.removeEventListener('touchmove', touchMove)
      window.removeEventListener('touchend', stopDrag)
    }
  }, [dragging])

  const handleShare = (e) => {
    if (moved) return
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
      message.success('Đã sao chép liên kết bài viết! 🔗')
    }
  }

  const navigate = (path) => {
    if (moved) return
    router.push(path)
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#F1BE4B',
          borderRadius: 20,
        },
      }}
    >
      <div 
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        style={{
          position: 'fixed',
          left: pos.x,
          bottom: pos.y,
          zIndex: 9999,
          cursor: dragging ? 'grabbing' : 'grab',
          touchAction: 'none',
          transition: dragging ? 'none' : 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
        className="blog-floating-container"
      >
        <FloatButton.Group
          trigger="click"
          type="primary"
          icon={<SettingOutlined style={{ fontSize: 22 }} />}
          style={{ 
            position: 'relative', 
            left: 'auto', 
            bottom: 'auto',
          }}
        >
          {isDetail && (
            <Tooltip title="Chia sẻ (Copy link)" placement="right">
              <FloatButton 
                icon={<ShareAltOutlined style={{ color: '#F1BE4B' }} />} 
                onClick={handleShare}
                style={{ 
                  background: 'rgba(255, 255, 255, 0.85)', 
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(241, 190, 75, 0.2)'
                }}
              />
            </Tooltip>
          )}
          
          <Tooltip title="Quản lý bài viết" placement="right">
            <FloatButton 
              icon={<FileTextOutlined style={{ color: '#F1BE4B' }} />} 
              onClick={() => navigate('/blog/management')}
              style={{ 
                background: 'rgba(255, 255, 255, 0.85)', 
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(241, 190, 75, 0.2)'
              }}
            />
          </Tooltip>

          <Tooltip title="Viết bài mới" placement="right">
            <FloatButton 
              icon={<PlusOutlined style={{ color: '#fff' }} />} 
              onClick={() => navigate('/blog/create')}
              style={{ 
                background: 'linear-gradient(135deg, #F1BE4B 0%, #E6A817 100%)',
                boxShadow: '0 4px 12px rgba(241, 190, 75, 0.3)'
              }}
            />
          </Tooltip>
        </FloatButton.Group>

        <style jsx global>{`
          .blog-floating-container .ant-float-btn-body {
            box-shadow: 0 8px 32px rgba(241, 190, 75, 0.15) !important;
          }
        `}</style>
      </div>
    </ConfigProvider>
  )
}
