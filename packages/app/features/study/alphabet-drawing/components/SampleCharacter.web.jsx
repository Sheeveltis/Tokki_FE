import React from 'react'

/**
 * SampleCharacter (Web): render chữ mẫu (nét đen) từ danh sách điểm chuẩn hoá
 */
export function SampleCharacter({ strokes, width = 200, height = 200 }) {
  if (!strokes || strokes.length === 0) return null

  const svgContent = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" style="display: block;">
      ${strokes
        .map((stroke) => {
          if (!stroke || stroke.length === 0) return ''
          const points = stroke
            .map(([x, y]) => `${x * width},${y * height}`)
            .join(' ')
          return `
            <polyline
              points="${points}"
              fill="none"
              stroke="#000000"
              stroke-width="18"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          `
        })
        .join('')}
    </svg>
  `

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  )
}

