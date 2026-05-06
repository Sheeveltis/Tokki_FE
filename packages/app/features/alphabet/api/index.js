import { apiClient } from '../../../provider/api/client'
import { ENDPOINTS } from '../../../provider/api/endpoints'

/**
 * Fetch all alphabet records (for grid view)
 */
export async function fetchAlphabet(params = {}) {
  const res = await apiClient.get(ENDPOINTS.ALPHABET.GET_ALL, { params })
  return res.data
}

/**
 * Fetch alphabet records with pagination (for table view)
 */
export async function fetchAlphabetPaginated(params = {}) {
  const res = await apiClient.get(ENDPOINTS.ALPHABET.PAGINATED, { params })
  return res.data?.data || res.data || {}
}

/**
 * Fetch a single alphabet record by ID
 */
export async function fetchAlphabetById(id) {
  const res = await apiClient.get(ENDPOINTS.ALPHABET.GET_BY_ID(id))
  return res.data?.data || res.data || null
}

/**
 * Update an alphabet record
 */
export async function updateAlphabet(payload) {
  const res = await apiClient.put(ENDPOINTS.ALPHABET.UPDATE, payload)
  return res.data
}

/**
 * Delete an alphabet record
 */
export async function deleteAlphabet(id) {
  const res = await apiClient.delete(ENDPOINTS.ALPHABET.DELETE(id))
  return res.data
}

/**
 * Create a new alphabet record
 */
export async function createAlphabet(payload) {
  const res = await apiClient.post(ENDPOINTS.ALPHABET.CREATE, payload)
  return res.data
}

/**
 * Toggle alphabet active status
 */
export async function toggleAlphabetStatus(id) {
  const res = await apiClient.patch(ENDPOINTS.ALPHABET.TOGGLE_STATUS(id))
  return res.data
}

/**
 * Import alphabet from Excel
 */
export async function importAlphabetFromExcel(file) {
  const formData = new FormData()
  formData.append('file', file)
  const res = await apiClient.post(ENDPOINTS.ALPHABET.IMPORT, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return res.data
}
