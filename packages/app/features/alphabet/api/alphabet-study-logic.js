import { useState, useEffect } from 'react'
import { fetchAlphabet, fetchAlphabetById } from './index'

/**
 * Hook xử lý logic cho AlphabetStudyScreen
 */
export function useAlphabetStudy(mode = 'letters') {
  const [index, setIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [favorites, setFavorites] = useState(new Set())
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [currentDetails, setCurrentDetails] = useState(null)

  // Fetch alphabet list
  useEffect(() => {
    async function loadAlphabet() {
      try {
        setLoading(true)
        const response = await fetchAlphabet({ isActive: true })
        
        // Map API data to component format
        // API returns type 1 for vowel, 2 for consonant (assuming based on mock data ㅓ being type 1)
        const mappedData = (response?.data || response || []).map((item, idx) => {
          const typeStr = item.type === 1 ? 'vowel' : 'consonant'
          
          // Determine row - this is a bit heuristic if the API doesn't provide it
          // Based on mock data: Vowels (10, 11), Consonants (11, 8)
          let row = 1
          const sameTypeItems = (response?.data || response || []).filter(i => i.type === item.type)
          const typeIndex = sameTypeItems.findIndex(i => i.id === item.id)
          
          if (item.type === 1) { // Vowel
             row = typeIndex < 10 ? 1 : 2
          } else { // Consonant
             row = typeIndex < 11 ? 1 : 2
          }

          return {
            ...item,
            word: item.letter,
            type: typeStr,
            row: row,
            audio: item.audioUrl,
            idx: idx // Store the original index in the full list
          }
        })

        // Sort by sortOrder if available
        mappedData.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
        
        setData(mappedData)
      } catch (error) {
        console.error('Failed to fetch alphabet:', error)
      } finally {
        setLoading(false)
      }
    }
    loadAlphabet()
  }, [])

  // Fetch details when current letter changes
  useEffect(() => {
    async function loadDetails() {
      const currentItem = data[index]
      if (!currentItem?.id) return

      try {
        setDetailsLoading(true)
        const details = await fetchAlphabetById(currentItem.id)
        
        if (details) {
          // Parse JSON strings from API
          let displayData = []
          let validationData = []
          try {
            displayData = typeof details.displayDataJson === 'string' 
              ? JSON.parse(details.displayDataJson) 
              : details.displayDataJson || []
            validationData = typeof details.validationDataJson === 'string'
              ? JSON.parse(details.validationDataJson)
              : details.validationDataJson || []
          } catch (e) {
            console.error('Error parsing stroke JSON:', e)
          }

          setCurrentDetails({
            ...currentItem,
            ...details,
            strokes: displayData.map((d, i) => ({
              ...d,
              hangulPoints: d.templatePoints, // Map templatePoints to hangulPoints for compatibility
              validationPoints: validationData.find(v => v.order === d.order)?.validationPoints || d.templatePoints
            }))
          })
        }
      } catch (error) {
        console.error('Failed to fetch alphabet details:', error)
      } finally {
        setDetailsLoading(false)
      }
    }

    if (data.length > 0) {
      loadDetails()
    }
  }, [index, data])

  const current = currentDetails || data[index] || {}
  const isFavorite = favorites.has(index)
  const modeTitle = mode === 'letters' ? 'Học Chữ Cái' : 'Học Ghép Âm'

  const handleNext = () => {
    setIsFlipped(false)
    setIndex((prev) => (prev + 1) % data.length)
  }

  const handlePrev = () => {
    setIsFlipped(false)
    setIndex((prev) => (prev - 1 + data.length) % data.length)
  }

  const handleSelectLetter = (newIndex) => {
    setIsFlipped(false)
    setIndex(newIndex)
  }

  const toggleFavorite = () => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  return {
    index,
    isFlipped,
    favorites,
    data,
    current,
    loading,
    detailsLoading,
    isFavorite,
    modeTitle,
    handleNext,
    handlePrev,
    handleSelectLetter,
    toggleFavorite,
    setIsFlipped,
  }
}

