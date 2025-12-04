// Fake login API for demo. Replace with real HTTP call when backend is ready.

// Tài khoản mẫu để test login trên FE
export const MOCK_USER = {
  email: 'user@test.com',
  password: 'test123', // ít nhất 6 ký tự
  id: 'u_demo_001',
  name: 'Người dùng Demo',
}

export const login = async ({ email, password }) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!email || !password) {
        reject(new Error('Email và mật khẩu không được để trống.'))
        return
      }

      if (password.length < 6) {
        reject(new Error('Mật khẩu phải có ít nhất 6 ký tự.'))
        return
      }

      // Chỉ cho phép đăng nhập bằng tài khoản mẫu
      if (email !== MOCK_USER.email || password !== MOCK_USER.password) {
        reject(new Error('Tài khoản hoặc mật khẩu không đúng. Vui lòng dùng tài khoản test.'))
        return
      }

      resolve({
        token: 'mock-token-123',
        user: {
          id: MOCK_USER.id,
          email: MOCK_USER.email,
          name: MOCK_USER.name,
        },
      })
    }, 600)
  })
}


