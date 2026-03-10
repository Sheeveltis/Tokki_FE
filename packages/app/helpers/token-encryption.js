import { Platform } from 'react-native'

const SECRET_KEY = 
  (Platform.OS === 'web' ? import.meta.env.VITE_JWT_KEY : process.env.EXPO_PUBLIC_VITE_JWT_KEY) || 
  'tokki_default_fallback_key_2024';


const base64Encode = (str) => {
  try {
    if (Platform.OS === 'web' && typeof btoa !== 'undefined') {
      return btoa(str)
    }
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(str, 'utf-8').toString('base64')
    }
    try {
      const base64js = require('base64-js')
      const bytes = new TextEncoder().encode(str)
      return base64js.fromByteArray(bytes)
    } catch {
      return str
    }
  } catch (error) {
    console.error('Error in base64Encode:', error)
    return str
  }
}

const base64Decode = (str) => {
  try {
    if (Platform.OS === 'web' && typeof atob !== 'undefined') {
      return atob(str)
    }
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(str, 'base64').toString('utf-8')
    }
    try {
      const base64js = require('base64-js')
      const bytes = base64js.toByteArray(str)
      return new TextDecoder().decode(bytes)
    } catch {
      return str
    }
  } catch (error) {
    console.error('Error in base64Decode:', error)
    return str
  }
}

export const encryptToken = (token) => {
  if (!token) return null
  try {
    const combined = `${SECRET_KEY}${token}${SECRET_KEY}`
    return base64Encode(combined)
  } catch (error) {
    console.error('Error encrypting token:', error)
    return token
  }
}

export const decryptToken = (encryptedToken) => {
  if (!encryptedToken) return null
  try {
    const decoded = base64Decode(encryptedToken)
    
    if (decoded && typeof decoded === 'string' && decoded.startsWith(SECRET_KEY) && decoded.endsWith(SECRET_KEY)) {
      const token = decoded.slice(
        SECRET_KEY.length,
        decoded.length - SECRET_KEY.length
      )
      return token
    }
    
    return encryptedToken
  } catch (error) {
    console.error('Error decrypting token:', error)
    return encryptedToken
  }
}