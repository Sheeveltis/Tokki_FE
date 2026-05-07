import React from 'react'
import { Svg, Polyline, Circle, Text, Defs, Marker, Path } from 'react-native-svg'
import { View, StyleSheet } from 'react-native'

/**
 * Tính offset vuông góc ra phía ngoài cho đường guide arrow
 * để mũi tên nằm sát bên ngoài đường guide xám mà không đè lên
 */
function offsetPolyline(points, offsetDist) {
  if (!points || points.length < 2) return points
  
  const result = []
  for (let i = 0; i < points.length; i++) {
    let nx = 0, ny = 0
    
    if (i === 0) {
      // Điểm đầu: dùng normal của segment đầu tiên
      const dx = points[1][0] - points[0][0]
      const dy = points[1][1] - points[0][1]
      const len = Math.hypot(dx, dy) || 1
      nx = -dy / len
      ny = dx / len
    } else if (i === points.length - 1) {
      // Điểm cuối: dùng normal của segment cuối
      const dx = points[i][0] - points[i - 1][0]
      const dy = points[i][1] - points[i - 1][1]
      const len = Math.hypot(dx, dy) || 1
      nx = -dy / len
      ny = dx / len
    } else {
      // Điểm giữa: trung bình normal 2 segment
      const dx1 = points[i][0] - points[i - 1][0]
      const dy1 = points[i][1] - points[i - 1][1]
      const len1 = Math.hypot(dx1, dy1) || 1
      const dx2 = points[i + 1][0] - points[i][0]
      const dy2 = points[i + 1][1] - points[i][1]
      const len2 = Math.hypot(dx2, dy2) || 1
      nx = (-dy1 / len1 + -dy2 / len2) / 2
      ny = (dx1 / len1 + dx2 / len2) / 2
      const nlen = Math.hypot(nx, ny) || 1
      nx /= nlen
      ny /= nlen
    }
    
    result.push([points[i][0] + nx * offsetDist, points[i][1] + ny * offsetDist])
  }
  return result
}

/**
 * GuideStrokes (Mobile): Hiển thị vùng tolerance + đường guide (đỏ) sử dụng react-native-svg
 * 
 * Mũi tên chỉ hướng được vẽ DỌC THEO đường guide chính (hangulPoints),
 * offset nhẹ ra ngoài để không đè lên vùng vẽ.
 * Điều này đảm bảo user nhìn mũi tên và vẽ đúng trên đường guide → điểm cao.
 */
export function GuideStrokes({ strokes, guides, width, height, show, activeStrokeIndex = 0 }) {
  if (!show || !strokes || !width || !height) return null

  const toleranceZoneWidth = 10
  // Offset mũi tên ra ngoài đường guide (normalized, ~3% canvas)
  const arrowOffset = 0.04

  return (
    <View style={[StyleSheet.absoluteFill, { pointerEvents: 'none', zIndex: 1 }]}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <Marker
            id="arrow-red"
            markerWidth="6"
            markerHeight="6"
            refX="3"
            refY="3"
            orient="auto"
          >
            <Path d="M0,0 L6,3 L0,6 z" fill="#D4060A" />
          </Marker>
        </Defs>

        {/* Render main strokes (background traces) */}
        {strokes.map((stroke, index) => {
          if (!stroke || stroke.length === 0) return null
          const isActive = index === activeStrokeIndex
          const isDone = index < activeStrokeIndex
          
          const points = stroke
            .map(([x, y]) => `${x * width},${y * height}`)
            .join(' ')
          
          return (
            <React.Fragment key={`main-${index}`}>
              {/* Tolerance zone */}
              <Polyline
                points={points}
                fill="none"
                stroke={isActive ? "#E8F5E9" : "#F5F5F5"}
                strokeWidth={toleranceZoneWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={isActive ? 0.4 : 0.1}
              />
              {/* Guide stroke chính */}
              <Polyline
                points={points}
                fill="none"
                stroke={isActive ? "#E0E0E0" : "#F0F0F0"}
                strokeWidth={24}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={isActive ? 0.6 : 0.2}
              />
              
              {/* Đường nét đứt trung tâm - chỉ rõ nơi cần vẽ */}
              {isActive && (
                <Polyline
                  points={points}
                  fill="none"
                  stroke="#BDBDBD"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={0.6}
                />
              )}
              
              {/* Điểm bắt đầu cho nét hiện tại */}
              {isActive && stroke.length > 0 && (
                <Circle
                  cx={stroke[0][0] * width}
                  cy={stroke[0][1] * height}
                  r="12"
                  fill="#4CAF50"
                  stroke="#fff"
                  strokeWidth="2"
                />
              )}
            </React.Fragment>
          )
        })}

        {/* Render guide arrows - vẽ mũi tên DỌC THEO đường stroke chính, offset ra ngoài */}
        {strokes.map((stroke, index) => {
          if (!stroke || stroke.length < 2) return null
          
          const guide = guides?.[index]
          const labelValue = guide?.numberLabel?.value ?? (index + 1)
          
          // Offset đường stroke ra ngoài để tạo đường mũi tên không đè lên vùng vẽ
          const offsetStroke = offsetPolyline(stroke, arrowOffset)
          
          const arrowPoints = offsetStroke
            .map(([x, y]) => `${x * width},${y * height}`)
            .join(' ')
          
          // Vị trí số thứ tự: đặt gần điểm đầu, offset ra ngoài
          const labelPos = offsetPolyline([stroke[0]], arrowOffset)[0] || stroke[0]

          return (
            <React.Fragment key={`guide-${index}`}>
              <Polyline
                points={arrowPoints}
                fill="none"
                stroke="#D4060A"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                strokeLinecap="round"
                strokeLinejoin="round"
                markerEnd="url(#arrow-red)"
              />
              <Circle
                cx={labelPos[0] * width}
                cy={labelPos[1] * height}
                r="8"
                fill="#FFFFFF"
                stroke="#D4060A"
                strokeWidth="1.5"
              />
              <Text
                x={labelPos[0] * width}
                y={labelPos[1] * height + 4}
                textAnchor="middle"
                fontSize="10"
                fontWeight="700"
                fill="#D4060A"
                alignmentBaseline="middle"
              >
                {labelValue}
              </Text>
            </React.Fragment>
          )
        })}
      </Svg>
    </View>
  )
}
