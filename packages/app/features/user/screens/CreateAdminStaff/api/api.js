import { apiClient } from '../../../../../provider/api/client'
import { ENDPOINTS } from '../../../../../provider/api/endpoints'

/**
 * Tạo tài khoản Admin/Staff
 * Body: { email, fullName, phoneNumber, dateOfBirth, role }
 */
export const createAdminStaff = async ({ email, fullName, phoneNumber, dateOfBirth, role }) => {
  const payload = { email, fullName, phoneNumber, dateOfBirth, role }
  const res = await apiClient.post(ENDPOINTS.ACCOUNT.CREATE_ACCOUNT, payload)
  return res?.data
}

