import React from 'react'
import { Svg, Polyline, Circle, Text, Defs, Marker, Path } from 'react-native-svg'
import { View, StyleSheet } from 'react-native'

/**
 * GuideStrokes (Mobile): Hiển thị vùng tolerance + đường guide (đỏ) sử dụng react-native-svg
 */
export function GuideStrokes({ strokes, guides, width, height, show }) {
  if (!show || !strokes || !width || !height) return null

  const toleranceZoneWidth = 10

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
          const points = stroke
            .map(([x, y]) => `${x * width},${y * height}`)
            .join(' ')
          
          return (
            <React.Fragment key={`main-${index}`}>
              {/* Tolerance zone */}
              <Polyline
                points={points}
                fill="none"
                stroke="#E8F5E9"
                strokeWidth={toleranceZoneWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.25}
              />
              {/* Guide stroke chính */}
              <Polyline
                points={points}
                fill="none"
                stroke="#E0E0E0"
                strokeWidth={24}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.5}
              />
            </React.Fragment>
          )
        })}

        {/* Render guide lines (arrows and numbers) */}
        {guides.map((g, index) => {
          if (!g || !g.arrowPath || g.arrowPath.length === 0) return null

          const arrowPoints = g.arrowPath
            .map(([x, y]) => `${x * width},${y * height}`)
            .join(' ')

          const labelPos = g.numberLabel?.position || g.arrowPath[0]
          const [nx, ny] = labelPos
          const labelValue = g.numberLabel?.value ?? ''

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
                cx={nx * width}
                cy={ny * height}
                r="8"
                fill="#FFFFFF"
                stroke="#D4060A"
                strokeWidth="1.5"
              />
              <Text
                x={nx * width}
                y={ny * height + 4}
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
