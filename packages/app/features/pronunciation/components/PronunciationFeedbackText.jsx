import React, { useState } from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'

export const getScoreColor = (score) => {
  if (score >= 80) return '#4CAF50'
  if (score >= 50) return '#FF9800'
  return '#F44336'
}

export const renderHtmlText = (htmlString, defaultStyle, boldStyle) => {
  if (!htmlString) return null
  const cleanStr = htmlString.replace(/<\/?p>/g, '').trim()
  const parts = cleanStr.split(/(<b>|<\/b>)/g)
  let isBold = false
  return parts.map((part, index) => {
    if (part === '<b>') {
      isBold = true
      return null
    }
    if (part === '</b>') {
      isBold = false
      return null
    }
    if (part) {
      return (
        <Text key={index} style={[defaultStyle, isBold && boldStyle]}>
          {part}
        </Text>
      )
    }
    return null
  })
}

export const PronunciationFeedbackText = ({ htmlString, evaluationWords }) => {
  if (!htmlString) return null
  
  const [activeWord, setActiveWord] = useState(null)
  const wrapperRef = React.useRef(null)
  const wordRefs = React.useRef({})
  
  const cleanStr = htmlString.replace(/<\/?p>/g, '').trim()
  const referenceWordsFeedback = (evaluationWords || []).filter(w => w.errorType !== 'Insertion')
  
  const getWordStyle = (feedback) => {
    if (!feedback) return { color: '#FFF' }
    if (feedback.errorType !== 'None' && feedback.accuracyScore < 50) return { color: '#F44336' }
    if (feedback.isFeedback || (feedback.errorType !== 'None' && feedback.accuracyScore < 80)) return { color: '#FFC107' }
    return { color: '#FFF' }
  }

  const handleWordPress = (idx, guide) => {
    if (activeWord?.index === idx) {
      setActiveWord(null)
      return
    }
    
    wordRefs.current[idx]?.measureLayout(
      wrapperRef.current,
      (x, y, width, height) => {
        setActiveWord({ index: idx, guide, x, y, width, height })
      },
      (err) => console.warn('Measure failed', err)
    )
  }

  const parseHtml = () => {
    const segments = cleanStr.split(/(<b>|<\/b>)/g)
    const elements = []
    let isBold = false
    let globalWordIdx = 0

    segments.forEach((segment, segmentIdx) => {
      if (segment === '<b>') isBold = true
      else if (segment === '</b>') isBold = false
      else if (segment) {
        const wordsInSegment = segment.split(/(\s+)/).filter(p => p !== '')
        
        wordsInSegment.forEach((wordPart, wordPartIdx) => {
          if (/\s+/.test(wordPart)) {
            elements.push(<Text key={`space-${segmentIdx}-${wordPartIdx}`}>{wordPart}</Text>)
          } else {
            const feedback = referenceWordsFeedback[globalWordIdx]
            const isActive = activeWord?.index === globalWordIdx
            const currentIdx = globalWordIdx
            
            elements.push(
              <Text 
                key={`word-${currentIdx}`}
                ref={r => wordRefs.current[currentIdx] = r}
                onPress={() => feedback?.repairGuide && handleWordPress(currentIdx, feedback.repairGuide)}
                style={[
                  styles.targetText, 
                  getWordStyle(feedback), 
                  isBold && styles.targetTextBold,
                  isActive && styles.targetTextActive,
                  feedback?.repairGuide && { textDecorationLine: 'underline', textDecorationStyle: 'dotted' }
                ]}
              >
                {wordPart}
              </Text>
            )
            globalWordIdx++
          }
        })
      }
    })
    return elements
  }

  const isBottomLine = activeWord && activeWord.y > 40
  const tooltipWidth = 480

  return (
    <View style={styles.targetScriptWrapper} ref={wrapperRef} collapsable={false}>
      <Text style={styles.targetScriptContainer}>{parseHtml()}</Text>
      
      {activeWord && (
        <View 
          style={[
            styles.smartTooltip, 
            { 
              top: isBottomLine ? activeWord.y - 120 : activeWord.y + activeWord.height + 15,
              left: Math.max(10, activeWord.x + (activeWord.width / 2) - (tooltipWidth / 2)),
              width: tooltipWidth,
            }
          ]}
        >
           <View style={[isBottomLine ? styles.triangleDown : styles.triangleUp]} />
           <View style={styles.tooltipHeader}>
              <Text style={styles.tooltipTitle}>Gợi ý sửa</Text>
              <Pressable onPress={() => setActiveWord(null)}><Text style={styles.tooltipClose}>✕</Text></Pressable>
           </View>
           <Text style={styles.tooltipContentText}>{activeWord.guide}</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  targetScriptWrapper: { width: '100%', alignItems: 'center', position: 'relative' },
  targetScriptContainer: { textAlign: 'center', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  targetText: { 
    fontSize: 26, 
    color: '#FFF', 
    fontFamily: 'Epilogue, sans-serif', 
    lineHeight: 38, 
    fontWeight: '800',
    letterSpacing: 0.5,
    paddingHorizontal: 2,
  },
  targetTextActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 6,
  },
  targetTextBold: { },
  smartTooltip: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFC107',
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 15,
  },
  tooltipHeader: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 6
  },
  tooltipTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#B08E1C',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  tooltipClose: {
    fontSize: 16,
    color: '#ABB2B9',
    fontWeight: 'bold',
    padding: 4,
  },
  tooltipContentText: {
    fontSize: 14,
    color: '#1F1F1F',
    lineHeight: 20,
    fontFamily: 'Epilogue, sans-serif',
    fontWeight: '600',
  },
  triangleUp: {
    position: 'absolute',
    top: -12,
    left: '50%',
    marginLeft: -10,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FFC107',
    zIndex: 10000,
  },
  triangleDown: {
    position: 'absolute',
    bottom: -12,
    left: '50%',
    marginLeft: -10,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FFC107',
    zIndex: 10000,
  },
})
