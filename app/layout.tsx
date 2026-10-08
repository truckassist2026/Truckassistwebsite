import type { Metadata } from 'next'
import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Truck Assist Admin',
  description: 'Truck Assist operations and administration portal',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={inter.variable}>{children}</body></html>
}
