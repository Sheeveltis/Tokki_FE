/**
 * Xử lý HTML content để thống nhất size images
 * Thêm style max-width, max-height vào tất cả thẻ <img>
 */
export const processBlogContent = (html) => {
  if (!html) return html

  // Thay thế tất cả thẻ <img> để thêm style
  return html.replace(
    /<img([^>]*)>/gi,
    (match, attributes) => {
      // Kiểm tra xem đã có style chưa
      if (attributes.includes('style=')) {
        // Nếu có style rồi, thêm max-width và max-height vào
        return match.replace(
          /style="([^"]*)"/i,
          (styleMatch, styleContent) => {
            // Thêm max-width và max-height nếu chưa có
            let newStyle = styleContent.trim()
            
            // Loại bỏ dấu chấm phẩy cuối nếu có
            if (newStyle.endsWith(';')) {
              newStyle = newStyle.slice(0, -1)
            }
            
            // Thêm các style mới nếu chưa có
            if (!newStyle.includes('max-width')) {
              newStyle += '; max-width: 100%'
            }
            if (!newStyle.includes('max-height')) {
              newStyle += '; max-height: 500px'
            }
            if (!newStyle.includes('object-fit')) {
              newStyle += '; object-fit: contain'
            }
            if (!newStyle.includes('border-radius')) {
              newStyle += '; border-radius: 8px'
            }
            if (!newStyle.includes('display')) {
              newStyle += '; display: block'
            }
            if (!newStyle.includes('margin')) {
              newStyle += '; margin: 16px auto'
            }
            
            return `style="${newStyle}"`
          }
        )
      } else {
        // Nếu chưa có style, thêm mới
        const style = 'max-width: 100%; max-height: 500px; object-fit: contain; border-radius: 8px; display: block; margin: 16px auto;'
        return `<img${attributes} style="${style}">`
      }
    }
  )
}

