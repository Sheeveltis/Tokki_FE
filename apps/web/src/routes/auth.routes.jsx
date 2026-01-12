import React from 'react'
import { Route } from 'react-router-dom'
import { useRouteNavigation } from './utils/navigation-helpers'
import { LoginScreen } from '@tokki/app/features/authentication/screens/login-screen.web'
import { RegisterScreen } from '@tokki/app/features/authentication/screens/register-screen.web'
import { ForgotPasswordScreen } from '@tokki/app/features/authentication/screens/forgot-password-screen'

/**
 * Authentication Routes Container
 */
function LoginRoute() {
  const { navigate } = useRouteNavigation()

  return (
    <LoginScreen
      onPressSignUp={() => navigate('/register')}
    />
  )
}

function RegisterRoute() {
  const { navigate } = useRouteNavigation()

  return (
    <RegisterScreen
      onPressLogin={() => navigate('/login')}
    />
  )
}

function ForgotPasswordRoute() {
  const { navigate, getQueryParam } = useRouteNavigation()
  const email = getQueryParam('email')

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
]

/**
 * Render Auth Routes
 */
export function renderAuthRoutes() {
  return authRoutes.map((route) => (
    <Route key={route.path} path={route.path} element={route.element} />
  ))
}
