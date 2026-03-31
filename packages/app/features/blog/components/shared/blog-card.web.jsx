import React from 'react'
import { Card, Typography } from 'antd'
import { motion } from 'framer-motion'

const { Title, Text, Paragraph } = Typography

/**
 * BlogCard (Web): Premium blog card component based on Landing Page design
 * @param {Object} props
 * @param {Object} props.item - Blog data
 * @param {Function} props.onPress - Press handler
 */
export function BlogCard({ item, onPress }) {
  const { thumbnailUrl, title, shortDescription, categoryName } = item

  return (
    <motion.div
      whileHover={{ y: -8 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onClick={onPress}
      className="blog-card-wrapper"
      style={{ cursor: 'pointer', height: '100%', marginBottom: '24px' }}
    >
      <div className="blog-card" style={{ height: '100%' }}>
        <div className="blog-card-img-wrap">
          <img src={thumbnailUrl || 'https://images.unsplash.com/photo-1547036967-23d1199d3b21'} className="blog-card-img" alt={title} />
        </div>
        <div style={{ padding: '0 4px' }}>
          <Text style={{ 
            color: '#F1BE4B', 
            fontSize: '12px', 
            fontWeight: 800, 
            textTransform: 'uppercase', 
            letterSpacing: '0.1em', 
            display: 'block', 
            marginBottom: '12px' 
          }}>
            {categoryName || 'BẢN TIN'}
          </Text>
          <Title level={4} style={{ 
            fontSize: '20px', 
            fontWeight: 800, 
            marginBottom: '12px',
            lineHeight: 1.4,
            height: '2.8em',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            color: '#0f172a'
          }}>
            {title}
          </Title>
          <Paragraph style={{ 
            color: '#64748b', 
            fontSize: '15px', 
            lineHeight: 1.6,
            height: '4.8em',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            marginBottom: 0
          }}>
            {shortDescription}
          </Paragraph>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .blog-card-img-wrap {
          border-radius: 24px;
          overflow: hidden;
          margin-bottom: 24px;
          aspect-ratio: 16/10;
          background-color: #f8fafc;
        }

        .blog-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s ease;
        }

        .blog-card-wrapper:hover .blog-card-img {
          transform: scale(1.08);
        }
        `
      }} />
    </motion.div>
  )
}
