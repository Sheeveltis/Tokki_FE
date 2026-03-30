import React, { useEffect, useMemo, useState } from 'react'
import Joyride, { ACTIONS, EVENTS, STATUS } from 'react-joyride'

const getTourStorageKey = (userKey = 'guest') =>
  `tokki_matching_card_how_to_play_seen_v1_${userKey}`

export function hasSeenMatchingCardTour(userKey = 'guest') {
  if (typeof window === 'undefined') return true
  try {
    return window.localStorage.getItem(getTourStorageKey(userKey)) === 'true'
  } catch (e) {
    return true
  }
}

export function markMatchingCardTourSeen(userKey = 'guest') {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(getTourStorageKey(userKey), 'true')
  } catch (e) {
    // ignore
  }
}

export function resetMatchingCardTourSeen(userKey = 'guest') {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(getTourStorageKey(userKey))
  } catch (e) {
    // ignore
  }
}

export function MatchingCardTour({ run, setRun, onEnded, userKey = 'guest' }) {
  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    if (run) setStepIndex(0)
  }, [run])

  const steps = useMemo(
    () => [
      {
        target: '#matching-card-timer',
        content: 'Đây là thời gian còn lại. Hết giờ thì bạn sẽ kết thúc lượt chơi.',
        placement: 'bottom',
        disableBeacon: true,
      },
      {
        target: '#matching-card-topic',
        content: 'Đây là chủ đề hiện tại của bộ thẻ.',
        placement: 'bottom',
        disableBeacon: true,
      },
      {
        target: '#matching-card-score',
        content: 'Điểm sẽ được cộng khi bạn tìm đúng một cặp thẻ.',
        placement: 'bottom',
        disableBeacon: true,
      },
      {
        target: '#matching-card-grid',
        content: (
          <div style={{ lineHeight: 1.5 }}>
            <div style={{ marginBottom: 10 }}>Đây là khu vực thẻ.</div>
            <ul style={{ paddingLeft: 20, margin: 0 }}>
              <li style={{ marginBottom: 6 }}>Chạm để lật 2 thẻ và tìm cặp trùng nhau.</li>
              <li style={{ marginBottom: 6 }}>Hai thẻ trùng sẽ được giữ lại.</li>
              <li>Hoàn thành tất cả cặp trước khi hết giờ để thắng.</li>
            </ul>
          </div>
        ),
        placement: 'bottom',
        disableBeacon: true,
      },
      {
        target: '#matching-card-menu',
        content: 'Đây là menu. Bạn có thể thoát game hoặc xem lại cách chơi.',
        placement: 'left',
        disableBeacon: true,
      },
      {
        target: '#matching-card-grid',
        content: 'Ok, bắt đầu chơi thôi!',
        placement: 'center',
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
          maxWidth: 360,
          width: '90vw',
        },
      }}
      callback={(data) => {
        console.log('JOYRIDEEEEE', data)
        const { action, index, status, type } = data

        if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
          markMatchingCardTourSeen(userKey)
          setStepIndex(0)
          if (typeof setRun === 'function') setRun(false)
          if (typeof onEnded === 'function') onEnded(status, data)
          return
        }

        if (type === EVENTS.TARGET_NOT_FOUND) {
          console.warn('Joyride target not found at step:', index)
        }

        if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
          const nextIndex = action === ACTIONS.PREV ? index - 1 : index + 1
          setStepIndex(nextIndex)
        }
      }}
    />
  )
}