import '@/styles/globals.css'
import '../styles/blogposts.css'
import '../styles/collaboratePage.css'
import '../styles/createblog.css'
import '../styles/home.css'
import '../styles/projectinfo.css'
import '../styles/style.css'
import '../styles/timeline.css'
import '../styles/LoadingSpinner.css'
import { Inter } from 'next/font/google'
import Layout from '@/components/Layout'
import { Suspense } from 'react'
import LoadingSpinner from '@/components/LoadingSpinner'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'MCU Redefined',
  description: 'MCU Fan Community',
  charSet: 'UTF-8',
  openGraph: {
    title: 'Character NFT template',
  },
  twitter: {
    card: 'summary_large_image'
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <Layout>
            <Suspense fallback={<LoadingSpinner/>}>{children}</Suspense>
          </Layout>
      </body>
    </html>
  )
}