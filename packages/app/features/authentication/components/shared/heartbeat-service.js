import { sendHeartbeat } from '../../api'
import { getCurrentUserId } from '../../../../provider/api/client'

/**
 * Heartbeat Service
 * 
 * Quản lý việc gửi heartbeat để track thời gian học tập và tăng XP/Streak
 * - Gửi heartbeat mỗi 300 giây (5 phút)
 * - Backend sẽ tự động cập nhật TotalXP và Streak sau khi nhận đủ số lần heartbeat
 * - Service này sẽ tự động chạy sau khi user đăng nhập thành công
 */
class HeartbeatService {
  constructor() {
    this.intervalRef = null
    this.isRunning = false
    this.callCount = 0 // Đếm số lần đã gọi (để debug)
    this.intervalDuration = 300 * 1000 // 300 giây = 5 phút
  }

  /**
   * Bắt đầu heartbeat interval
   * - Gửi heartbeat ngay lập tức
   * - Sau đó gửi mỗi 300 giây
   */
  start() {
    // Nếu đã chạy rồi thì không chạy lại
    if (this.isRunning) {
      console.warn('[HeartbeatService] Service đã đang chạy, bỏ qua start()')
      return
    }

    // Clear interval cũ nếu có (phòng trường hợp)
    this.stop()

    console.log('[HeartbeatService] Bắt đầu heartbeat service...')
    this.isRunning = true
    this.callCount = 0

    // Gửi heartbeat ngay lập tức
    this.sendHeartbeat()

    // Set interval để gửi heartbeat mỗi 300 giây
    this.intervalRef = setInterval(() => {
      this.sendHeartbeat()
    }, this.intervalDuration)

    console.log(`[HeartbeatService] Heartbeat interval đã được khởi động (mỗi ${this.intervalDuration / 1000} giây)`)
  }

  /**
   * Dừng heartbeat interval
   */
  stop() {
    if (this.intervalRef) {
      clearInterval(this.intervalRef)
      this.intervalRef = null
      this.isRunning = false
      console.log('[HeartbeatService] Heartbeat interval đã dừng')
    }
  }

  /**
   * Gửi heartbeat đến backend
   * - Lấy userId từ token
   * - Gửi durationInSeconds = 300 (5 phút)
   */
  async sendHeartbeat() {
    try {
      const userId = getCurrentUserId()
      if (!userId) {
        console.warn('[HeartbeatService] Không tìm thấy userId, dừng heartbeat')
        this.stop()
        return
      }

      this.callCount++
      console.log(`[HeartbeatService] Gửi heartbeat lần thứ ${this.callCount}...`, { userId })

      const result = await sendHeartbeat(userId, 300)
      
      // Kiểm tra thành công: có isSuccess = true HOẶC có message = "Tracking success" HOẶC có addedSeconds
      const isSuccess = result?.isSuccess === true || 
                       result?.message === 'Tracking success' || 
                       (result?.addedSeconds !== undefined && result?.addedSeconds !== null)
      
      if (isSuccess) {
        console.log(`[HeartbeatService] Heartbeat lần ${this.callCount} thành công`, result)
        // Backend sẽ tự động cập nhật TotalXP và Streak sau khi nhận đủ số lần heartbeat
        // Frontend không cần làm gì thêm ở đây
      } else {
        console.warn(`[HeartbeatService] Heartbeat lần ${this.callCount} thất bại:`, result?.message || 'Unknown error')
      }
    } catch (error) {
      console.error(`[HeartbeatService] Lỗi khi gửi heartbeat lần ${this.callCount}:`, error)
      // Không throw error để tránh làm gián đoạn flow chính
    }
  }

  /**
   * Kiểm tra xem service có đang chạy không
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      callCount: this.callCount,
      intervalDuration: this.intervalDuration,
    }
  }
}

// Export singleton instance
export const heartbeatService = new HeartbeatService()

