import '@/styles/globals.css'
import '@/styles/home.css'
import '@/styles/style.css'
import '@/styles/LoadingSpinner.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Suspense } from 'react'
import LoadingSpinner from '@/components/LoadingSpinner'
import Providers from '@/components/SessionProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MCU Redefined',
  description: 'MCU Fan Community',
  openGraph: {
    title: 'Character NFT template',
  },
  twitter: {
    card: 'summary_large_image'
  }
}

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <Providers>
            <Suspense fallback={<LoadingSpinner/>}>{children}</Suspense>
        </Providers>
      </body>
    </html>
  )
}