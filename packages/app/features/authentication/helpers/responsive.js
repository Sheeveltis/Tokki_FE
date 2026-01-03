import { Dimensions, Platform } from 'react-native'

/**
 * Helper để tính toán responsive values dựa trên kích thước màn hình
 * Tương tự ConstraintLayout trong Android - scale dựa trên tỷ lệ màn hình
 */

// Base dimensions (iPhone X - 375x812)
const BASE_WIDTH = 375
const BASE_HEIGHT = 812

// Lấy kích thước màn hình hiện tại
export const getScreenDimensions = () => {
  const { width, height } = Dimensions.get('window')
  return { width, height }
}

// Tính scale factor dựa trên width
export const getWidthScale = (baseWidth = BASE_WIDTH) => {
  const { width } = getScreenDimensions()
  return width / baseWidth
}

// Tính scale factor dựa trên height
export const getHeightScale = (baseHeight = BASE_HEIGHT) => {
  const { height } = getScreenDimensions()
  return height / baseHeight
}

// Scale value dựa trên width (cho padding, margin, font size, etc.)
export const scaleWidth = (value, baseWidth = BASE_WIDTH) => {
  return value * getWidthScale(baseWidth)
}

// Scale value dựa trên height (cho height, top, bottom, etc.)
export const scaleHeight = (value, baseHeight = BASE_HEIGHT) => {
  return value * getHeightScale(baseHeight)
}

// Scale font size (thường dùng width scale)
export const scaleFont = (size, baseWidth = BASE_WIDTH) => {
  return scaleWidth(size, baseWidth)
}

// Scale cả width và height (cho images, icons)
export const scaleSize = (size, baseWidth = BASE_WIDTH) => {
  const scale = getWidthScale(baseWidth)
  return size * scale
}

// Percentage width
export const percentWidth = (percent) => {
  const { width } = getScreenDimensions()
  return (width * percent) / 100
}

// Percentage height
export const percentHeight = (percent) => {
  const { height } = getScreenDimensions()
  return (height * percent) / 100
}

// Responsive value - tự động chọn scale phù hợp
export const responsive = (value, type = 'width') => {
  if (type === 'width' || type === 'font') {
    return scaleWidth(value)
  } else if (type === 'height') {
    return scaleHeight(value)
  }
  return scaleSize(value)
}


