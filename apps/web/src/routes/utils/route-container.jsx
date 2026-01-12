import React from 'react'

/**
 * Route Container - Wrapper pattern for route components
 * Provides consistent structure and navigation handling
 */
export function createRouteContainer(Component, config = {}) {
  return function RouteContainer(props) {
    return <Component {...props} {...config} />
  }
}

/**
 * Lazy Route Container - For code splitting
 */
export function createLazyRouteContainer(lazyComponent, fallback = null) {
  return function LazyRouteContainer(props) {
    const LazyComponent = React.lazy(lazyComponent)
    return (
      <React.Suspense fallback={fallback || <div>Đang tải...</div>}>
        <LazyComponent {...props} />
      </React.Suspense>
    )
  }
}
