import { StylesProvider } from './styles-provider'
import './globals.css'

export const metadata = {
  title: 'Tooki',
  description: 'Tooki is a platform for learning Korean',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Lexend:wght@400;500;600;700&family=Epilogue:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <StylesProvider>{children}</StylesProvider>
      </body>
    </html>
  )
}
