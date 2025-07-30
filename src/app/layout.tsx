import type { Metadata } from 'next'
import { Geist, Geist_Mono, Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { TRPCReactProvider } from '@/trpc/react'
import { ToastProvider } from '@/components/common/toast-provider'
import { StoreProvider } from '@/components/providers/store-provider'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Watch Tracker',
  description: 'Track your movie and TV show progress with timestamped notes',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.variable} antialiased dark`}>
          <TRPCReactProvider>
            <StoreProvider>
              {children}
              <ToastProvider />
            </StoreProvider>
          </TRPCReactProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
