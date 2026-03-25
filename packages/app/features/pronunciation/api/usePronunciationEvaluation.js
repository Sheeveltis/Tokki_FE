import { Platform } from 'react-native'
import { useState, useCallback } from 'react'
import { evaluatePronunciation } from './index'

export const usePronunciationEvaluation = () => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [result, setResult] = useState(null)

    const evaluate = useCallback(async (audioUri, exampleId) => {
        setLoading(true)
        setError(null)
        try {
            const formData = new FormData()
            
            if (Platform.OS === 'web') {
                // assume audioUri is already a file or blob if it's from web recorder or convert it back from URL if needed.
                // However, usually it's better to pass the actual File/Blob.
                // For this example detail screen, we might need some logic to get the Blob.
                formData.append('AudioFile', audioUri) 
            } else {
                formData.append('AudioFile', {
                    uri: audioUri,
                    name: 'audio-record.m4a',
                    type: 'audio/x-m4a',
                })
            }
            formData.append('ExampleId', exampleId)

            const data = await evaluatePronunciation(formData)
            console.log('DEBUG: evaluatePronunciation response:', data)
            setResult(data)
            return data
        } catch (err) {
            setError(err.message || 'Lỗi khi đánh giá phát âm')
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    const resetEvaluation = useCallback(() => {
        setResult(null)
        setError(null)
    }, [])

    return {
        evaluate,
        resetEvaluation,
        loading,
        error,
        result
    }
}
