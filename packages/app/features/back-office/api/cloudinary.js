import { apiClient } from '../../../provider/api/client'
import { ENDPOINTS } from '../../../provider/api/endpoints'

function buildFormData(file) {
  const formData = new FormData()
  formData.append('file', file)
  return formData
}

async function postCloudinary(endpoint, file) {
  if (!file) throw new Error('File is required')

  const res = await apiClient.post(endpoint, buildFormData(file), {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  const payload = res?.data
  if (payload?.isSuccess && payload?.data) return payload.data
  throw new Error(payload?.message || 'Không thể upload file lên Cloudinary')
}

export const uploadQuestionImageToCloudinary = (file) =>
  postCloudinary(ENDPOINTS.CLOUDINARY.UPLOAD_QUESTION_IMAGE, file)

export const uploadOptionImageToCloudinary = (file) =>
  postCloudinary(ENDPOINTS.CLOUDINARY.UPLOAD_OPTION_IMAGE, file)

export const uploadQuestionAudioToCloudinary = (file) =>
  postCloudinary(ENDPOINTS.CLOUDINARY.UPLOAD_QUESTION_AUDIO, file)

export const uploadOptionAudioToCloudinary = (file) =>
  postCloudinary(ENDPOINTS.CLOUDINARY.UPLOAD_OPTION_AUDIO, file)

export const uploadPassageAudioToCloudinary = (file) =>
  postCloudinary(ENDPOINTS.CLOUDINARY.UPLOAD_PASSAGE_AUDIO, file)

export const uploadPassageImageToCloudinary = (file) =>
  postCloudinary(ENDPOINTS.CLOUDINARY.UPLOAD_PASSAGE_IMAGE, file)

