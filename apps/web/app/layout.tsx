import { StylesProvider } from './styles-provider'
import './globals.css'
import { StyledComponentsRegistry } from '../lib/antd-registry.jsx'
export const metadata = {
  title: 'Tooki',
  description: 'Tooki is a platform for learning Korean',
  icons: {
    icon: '/icon.ico',
    shortcut: '/icon.ico',
    apple: '/icon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Next.js tự động inject icon từ metadata, không cần link tag thủ công */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Lexend:wght@400;500;600;700&family=Epilogue:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
      <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
      </body>
    </html>
  )
}
