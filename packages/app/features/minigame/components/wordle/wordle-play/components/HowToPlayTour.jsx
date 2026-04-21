import React, { useEffect, useMemo, useState } from 'react'
import Joyride, { ACTIONS, EVENTS, STATUS } from 'react-joyride'

export const HOW_TO_PLAY_TOUR_SELECTORS = {
  menu: '#tour-menu',
  grid: '#tour-grid',
  keyboard: '#tour-keyboard',
  feedbackDots: '#tour-feedback-dots',
  controlsPanel: '#tour-controls-panel',
}

export const HOW_TO_PLAY_TOUR_STORAGE_KEY = 'tokki_wordle_how_to_play_seen_v1'

export function hasSeenHowToPlayTour() {
  if (typeof window === 'undefined') return true
  try {
    return window.localStorage.getItem(HOW_TO_PLAY_TOUR_STORAGE_KEY) === 'true'
  } catch (e) {
    return true
  }
}

export function markHowToPlayTourSeen() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(HOW_TO_PLAY_TOUR_STORAGE_KEY, 'true')
  } catch (e) {
    // ignore
  }
}

export function resetHowToPlayTourSeen() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(HOW_TO_PLAY_TOUR_STORAGE_KEY)
  } catch (e) {
    // ignore
  }
}

/**
 * Product tour (spotlight) cho Wordle (web).
 * - Không dùng modal/dialog UI (Joyride overlay + tooltip).
 * - Không scroll trang khi chạy tour.
 * - Chỉ là overlay/highlight, không đụng logic gameplay/IME.
 */
export function HowToPlayTour({ run, setRun, onEnded }) {
  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    if (run) setStepIndex(0)
  }, [run])

  const steps = useMemo(
    () => [
      {
        target: HOW_TO_PLAY_TOUR_SELECTORS.controlsPanel,
        content: 'Bạn có thể điều chỉnh âm thanh và xem lại cách chơi tại đây.',
        placement: 'bottom',
        disableBeacon: true,
      },
      {
        target: HOW_TO_PLAY_TOUR_SELECTORS.grid,
        content: (
          <div style={{ lineHeight: 1.5 }}>
            <div style={{ marginBottom: 10 }}>
              Đây là ô đoán từ. Mỗi ô là 1 block Hangul (1 âm tiết).
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 999,
                    backgroundColor: '#4CAF50',
                    display: 'inline-block',
                    flex: '0 0 auto',
                  }}
                />
                <span>Màu xanh: bạn đã đoán đúng tất cả các kí tự trong ô.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 999,
                    backgroundColor: '#C9B458',
                    display: 'inline-block',
                    flex: '0 0 auto',
                  }}
                />
                <span>Màu vàng: bạn đã đoán đúng một phần (1–2 kí tự) trong ô.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 999,
                    backgroundColor: '#787C7E',
                    display: 'inline-block',
                    flex: '0 0 auto',
                  }}
                />
                <span>Màu xám: bạn đã đoán sai hết tất cả các kí tự trong ô.</span>
              </div>
            </div>
          </div>
        ),
        placement: 'right',
        disableBeacon: true,
      },
      {
        target: HOW_TO_PLAY_TOUR_SELECTORS.keyboard,
        content: 'Đây là bàn phím ảo. Bạn có thể dùng bàn phím ảo hoặc bàn phím thật để nhập.',
        placement: 'top',
        disableBeacon: true,
      },
      {
        target: HOW_TO_PLAY_TOUR_SELECTORS.feedbackDots,
        content: (
          <div style={{ lineHeight: 1.5 }}>
            <div style={{ marginBottom: 10 }}>
              3 dấu chấm phía trên mỗi block là phản hồi theo 3 kí tự liên tiếp trong một ô:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 999,
                    backgroundColor: '#4CAF50',
                    display: 'inline-block',
                    flex: '0 0 auto',
                  }}
                />
                <span>Màu xanh: bạn đã đoán đúng kí tự rồi.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 999,
                    backgroundColor: '#C9B458',
                    display: 'inline-block',
                    flex: '0 0 auto',
                  }}
                />
                <span>Màu vàng: bạn đã đoán đúng được một nửa kí tự rồi.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 999,
                    backgroundColor: '#787C7E',
                    display: 'inline-block',
                    flex: '0 0 auto',
                  }}
                />
                <span>Màu xám: bạn đã đoán sai kí tự này rồi.</span>
              </div>
            </div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Lưu ý:</div>
            <ul style={{ paddingLeft: 20, margin: 0 }}>
              <li style={{ marginBottom: 4 }}>
                Khi xuất hiện chấm màu vàng, điều đó có nghĩa là tại nguyên âm hoặc phụ âm cuối đó có
                2 kí tự (ví dụ ㅘ hoặc ㄶ đều được tính là 1 kí tự)
              </li>
              <li>
                Nếu bạn chỉ nhập 2 kí tự (ví dụ 가) mà dấu chấm số 3 có màu xanh thì có nghĩa là ô đó
                không có phụ âm cuối
              </li>
              <li>
                Nhớ tắt Unikey và hãy dùng bàn phím hangul để nhập từ nhé
              </li>
            </ul>
          </div>
        ),
        placement: 'top',
        disableBeacon: true,
      },
      {
        target: HOW_TO_PLAY_TOUR_SELECTORS.grid,
        content: 'Ok, giờ bạn có thể chơi thử.',
        placement: 'top',
        disableBeacon: true,
      },
    ],
    []
  )

  return (
    <Joyride
      steps={steps}
      run={!!run}
      stepIndex={stepIndex}
      continuous
      showSkipButton
      showProgress
      disableOverlayClose
      disableCloseOnEsc
      disableScrolling
      scrollToFirstStep={false}
      spotlightPadding={10}
      floaterProps={{
        // Giữ tooltip fixed theo viewport, tránh “nhảy” + tránh bị cắt khi sát mép
        options: {
          positionFixed: true,
          modifiers: {
            preventOverflow: {
              enabled: true,
              boundariesElement: 'viewport',
              padding: 12,
            },
            flip: {
              enabled: true,
              padding: 12,
            },
            hide: { enabled: false },
          },
        },
      }}
      locale={{
        back: 'Quay lại',
        close: 'Đóng',
        last: 'Xong',
        next: 'Tiếp',
        skip: 'Bỏ qua',
      }}
      styles={{
        options: {
          zIndex: 10000,
          primaryColor: '#6AAA64',
          textColor: '#1a1a1b',
          arrowColor: '#fff',
          backgroundColor: '#fff',
          overlayColor: 'rgba(0,0,0,0.55)',
        },
        spotlight: {
          borderRadius: 8,
        },
        tooltip: {
          borderRadius: 12,
          maxWidth: '92vw',
          width: 505,
        },
      }}
      callback={(data) => {
        const { action, index, status, type } = data

        if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
          markHowToPlayTourSeen()
          setStepIndex(0)
          if (typeof setRun === 'function') setRun(false)
          if (typeof onEnded === 'function') onEnded(status, data)
          return
        }

        if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
          const nextIndex = action === ACTIONS.PREV ? index - 1 : index + 1
          setStepIndex(nextIndex)
        }
      }}
    />
  )
}

