'use client'
import { redirect } from 'next/navigation'

export default function NotFound() {
  // Điều hướng mọi 404 về trang lỗi tùy chỉnh
  redirect('/error')
  return null
}

