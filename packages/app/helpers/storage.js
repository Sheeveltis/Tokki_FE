import { Platform } from 'react-native'

let AsyncStorage = null
if (Platform.OS !== 'web') {
  try {
    AsyncStorage = require('@react-native-async-storage/async-storage').default
  } catch (e) {
    console.warn('AsyncStorage not available, using in-memory storage')
  }
}

/**
 * Storage helper để xử lý token và data trên cả web và mobile
 * - Web: sử dụng localStorage
 * - Mobile: sử dụng AsyncStorage
 */

/**
 * Lưu token vào storage
 * @param {string} key - Key để lưu
 * @param {string} value - Value cần lưu
 */
export const setStorageItem = async (key, value) => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value)
    }
  } else {
    if (AsyncStorage) {
      await AsyncStorage.setItem(key, value)
    }
  }
}

/**
 * Lấy token từ storage
 * @param {string} key - Key cần lấy
 * @returns {Promise<string|null>} - Value hoặc null
 */
export const getStorageItem = async (key) => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key)
    }
    return null
  } else {
    if (AsyncStorage) {
      return await AsyncStorage.getItem(key)
    }
    return null
  }
}

/**
 * Xóa token khỏi storage
 * @param {string} key - Key cần xóa
 */
export const removeStorageItem = async (key) => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key)
    }
  } else {
    if (AsyncStorage) {
      await AsyncStorage.removeItem(key)
    }
  }
}

/**
 * Dispatch event cho web (để notify các component khác)
 * @param {string} eventName - Tên event
 */
export const dispatchStorageEvent = (eventName) => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.dispatchEvent(new Event(eventName))
  }
  // Mobile không cần dispatch event, có thể dùng EventEmitter hoặc context
}


