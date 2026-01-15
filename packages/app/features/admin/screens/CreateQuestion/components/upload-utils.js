// Helpers for local preview (no upload)

export function isAudioUrl(url = '') {
  return String(url).match(/\.(mp3|wav|ogg)(\?|#|$)/i)
}

// IMPORTANT:
// - Some environments (or bundlers) might not behave well when repeatedly calling URL.createObjectURL
//   inside render.
// - Prefer creating object URL once and reuse.
export function createObjectUrl(file) {
  if (!file) return ''
  try {
    return URL.createObjectURL(file)
  } catch {
    return ''
  }
}

export function revokeObjectUrl(url) {
  if (!url) return
  try {
    URL.revokeObjectURL(url)
  } catch {
    // ignore
  }
}
