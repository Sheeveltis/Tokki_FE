import React from 'react'
import { Route } from 'react-router-dom'
import { useRouteNavigation } from './utils/navigation-helpers'
import { getCurrentUserId, getCurrentUserRole } from '@tokki/app/provider/api/client'
import { LoginScreen } from '@tokki/app/features/authentication/screens/login-screen.web'
import { RegisterScreen } from '@tokki/app/features/authentication/screens/register-screen.web'
import { ForgotPasswordScreen } from '@tokki/app/features/authentication/screens/forgot-password-screen'
import { AdminLoginScreen } from '@tokki/app/features/authentication/screens/admin-login-screen'

/**
 * Authentication Routes Container
 */
function LoginRoute() {
  const { navigate } = useRouteNavigation()

  React.useEffect(() => {
    const userId = getCurrentUserId()
    const role = getCurrentUserRole()
    
    if (userId) {
      if (role === 'Admin') {
        navigate('/admin', { replace: true })
      } else if (role === 'Staff') {
        navigate('/staff', { replace: true })
      } else if (role === 'Moderator') {
        navigate('/moderator', { replace: true })
      } else {
        navigate('/study', { replace: true })
      }
    }
  }, [navigate])

  return (
    <LoginScreen
      onPressSignUp={() => navigate('/register')}
    />
  )
}

function RegisterRoute() {
  const { navigate } = useRouteNavigation()

  React.useEffect(() => {
    const userId = getCurrentUserId()
    if (userId) {
      navigate('/study', { replace: true })
    }
  }, [navigate])

  return (
    <RegisterScreen
      onPressLogin={() => navigate('/login')}
    />
  )
}

function ForgotPasswordRoute() {
  const { navigate, getQueryParam } = useRouteNavigation()
  const email = getQueryParam('email')

  React.useEffect(() => {
    const userId = getCurrentUserId()
    if (userId) {
      navigate('/study', { replace: true })
    }
  }, [navigate])

  const handleSubmit = async ({ email: formEmail, newPassword, confirmPassword }) => {
    const finalEmail = formEmail || email
    await ForgotPasswordScreen.defaultProps?.onSubmit?.({
      email: finalEmail,
      newPassword,
      confirmPassword,
    })
    navigate('/login')
  }

  return <ForgotPasswordScreen email={email} onSubmit={handleSubmit} />
}

/**
 * Authentication Routes Configuration
 */
export const authRoutes = [
  {
    path: '/login',
    element: <LoginRoute />,
  },
  {
    path: '/register',
    element: <RegisterRoute />,
  },
  {
    path: '/authentication/forgot-password',
    element: <ForgotPasswordRoute />,
  },
  {
    path: '/admin-login',
    element: <AdminLoginScreen />,
  },
]

/**
 * Render Auth Routes
 */
export function renderAuthRoutes() {
  return authRoutes.map((route) => (
    <Route key={route.path} path={route.path} element={route.element} />
  ))
}
