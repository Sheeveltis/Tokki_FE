import React, { useEffect, useMemo, useState } from 'react'
import Joyride, { ACTIONS, EVENTS, STATUS } from 'react-joyride'

export const SOLITAIRE_TOUR_STORAGE_KEY = 'tokki_solitaire_how_to_play_seen_v1'

export function hasSeenSolitaireTour() {
  if (typeof window === 'undefined') return true
  try {
    return window.localStorage.getItem(SOLITAIRE_TOUR_STORAGE_KEY) === 'true'
  } catch (e) {
    return true
  }
}

export function markSolitaireTourSeen() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(SOLITAIRE_TOUR_STORAGE_KEY, 'true')
  } catch (e) {
    // ignore
  }
}

export function resetSolitaireTourSeen() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(SOLITAIRE_TOUR_STORAGE_KEY)
  } catch (e) {
    // ignore
  }
}

export function SolitarePlayWebTour({ run, setRun, onEnded }) {
  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    if (run) setStepIndex(0)
  }, [run])

  const steps = useMemo(
    () => [
      {
        target: '[data-tour="solitaire-level"]',
        content: 'Đây là level hiện tại của màn chơi Solitaire.',
        placement: 'bottom',
        disableBeacon: true,
      },
      {
        target: '[data-tour="solitaire-timer"]',
        content: 'Đây là thời gian còn lại. Hết giờ thì game sẽ kết thúc.',
        placement: 'bottom',
        disableBeacon: true,
      },
      {
        target: '[data-tour="solitaire-score"]',
        content: 'Đây là điểm hiện tại. Bạn sẽ được cộng điểm khi hoàn thành đúng một cột chủ đề.',
        placement: 'bottom',
        disableBeacon: true,
      },
      {
        target: '[data-tour="solitaire-draw"]',
        content: 'Đây là khu vực bài hỗ trợ ở phía trên.',
        placement: 'bottom',
        disableBeacon: true,
      },
      {
        target: '[data-tour="solitaire-temp-slots"]',
        content: 'Đây là 4 ô tạm. Bạn có thể kéo bài vào đây để sắp xếp chiến thuật.',
        placement: 'bottom',
        disableBeacon: true,
      },
      {
        target: '[data-tour="solitaire-columns"]',
        content: (
          <div style={{ lineHeight: 1.5 }}>
            <div style={{ marginBottom: 10 }}>
              Đây là khu vực các cột bài.
            </div>
            <ul style={{ paddingLeft: 20, margin: 0 }}>
              <li style={{ marginBottom: 6 }}>
                Bạn có thể kéo thả bài giữa các cột nếu đúng điều kiện.
              </li>
              <li style={{ marginBottom: 6 }}>
                Mục tiêu là gom các lá cùng chủ đề về đúng cột.
              </li>
              <li>
                Khi một cột hoàn chỉnh đúng chủ đề, bạn sẽ được cộng điểm.
              </li>
            </ul>
          </div>
        ),
        placement: 'top',
        disableBeacon: true,
      },
      {
        target: '[data-tour="solitaire-menu"]',
        content: 'Đây là nút menu. Bạn có thể thoát game từ đây.',
        placement: 'left',
        disableBeacon: true,
      },
      {
        target: '[data-tour="solitaire-columns"]',
        content: 'Ok, giờ bạn có thể bắt đầu chơi thử rồi.',
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
          markSolitaireTourSeen()
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

export default SolitarePlayWebTour