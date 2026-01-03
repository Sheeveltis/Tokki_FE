# Authentication Helpers

> **Lưu ý**: Các utilities như `token-encryption`, `token-decoder`, và `storage` đã được di chuyển sang `app/helpers/` vì chúng được sử dụng chung trong toàn bộ ứng dụng.

## Token Encryption/Decryption

### `app/helpers/token-encryption.js`
Utility để mã hóa và giải mã token trước khi lưu vào localStorage.

- `encryptToken(token)`: Mã hóa token bằng Base64 + secret key
- `decryptToken(encryptedToken)`: Giải mã token từ localStorage

## Token Decoder

### `app/helpers/token-decoder.js`
Utility để decode JWT token và lấy thông tin user từ payload.

#### Các hàm chính:

1. **`decodeJWT(token)`**: Decode JWT token và trả về payload object
2. **`getUserInfoFromToken(token)`**: Lấy toàn bộ thông tin user từ token
3. **`getUserIdFromToken(token)`**: Lấy userId từ token
4. **`getEmailFromToken(token)`**: Lấy email từ token
5. **`getFullNameFromToken(token)`**: Lấy fullName từ token
6. **`getRoleFromToken(token)`**: Lấy role từ token
7. **`isTokenExpired(token)`**: Kiểm tra token có hết hạn không

## Cách sử dụng

### ⭐ Lấy UserId (Cách đơn giản nhất):

```javascript
import { getCurrentUserId } from 'app/provider/api/client'

// Lấy userId từ token đã lưu
const userId = getCurrentUserId()

if (userId) {
  console.log('User ID:', userId) // "123"
  // Sử dụng userId ở đây
} else {
  console.log('Chưa đăng nhập hoặc token không hợp lệ')
}
```

### Trong `client.js` (đã được tích hợp sẵn):

```javascript
import {
  getCurrentUserInfo,
  getCurrentUserId,
  getCurrentUserEmail,
  getCurrentUserFullName,
  getCurrentUserRole,
  isCurrentTokenExpired,
} from 'app/provider/api/client'

// ⭐ Lấy userId (Cách đơn giản nhất)
const userId = getCurrentUserId()
console.log(userId) // "123" hoặc null

// Lấy toàn bộ thông tin user
const userInfo = getCurrentUserInfo()
console.log(userInfo)
// {
//   userId: "123",
//   email: "user@example.com",
//   fullName: "Nguyễn Văn A",
//   role: "User",
//   avatarUrl: "https://...",
//   ...
// }

// Lấy email
const email = getCurrentUserEmail()
console.log(email) // "user@example.com"

// Lấy fullName
const fullName = getCurrentUserFullName()
console.log(fullName) // "Nguyễn Văn A"

// Lấy role
const role = getCurrentUserRole()
console.log(role) // "User"

// Kiểm tra token hết hạn
const expired = isCurrentTokenExpired()
console.log(expired) // false
```

### Sử dụng trực tiếp từ token-decoder:

```javascript
import { getAuthToken } from 'app/provider/api/client'
import {
  getUserInfoFromToken,
  getUserIdFromToken,
} from 'app/helpers/token-decoder'

// Lấy token đã giải mã
const token = getAuthToken()

// Lấy thông tin user
const userInfo = getUserInfoFromToken(token)
const userId = getUserIdFromToken(token)
```

## Lưu ý

- Token phải là JWT format (header.payload.signature)
- Các hàm tự động xử lý token đã được giải mã từ localStorage
- Nếu token không hợp lệ hoặc không có, các hàm sẽ trả về `null`
- Token decoder không verify signature, chỉ decode payload để lấy thông tin

