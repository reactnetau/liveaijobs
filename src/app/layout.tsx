import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Providers from '@/components/Providers'
import { getAppUrl } from '@/lib/app-url'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

const APP_URL = getAppUrl()
const SITE_NAME = 'Live AI Jobs'
const DEFAULT_TITLE = 'Live AI Jobs — Find AI Engineering Roles'
const DEFAULT_DESCRIPTION = 'The job board built for AI engineers. Browse curated roles in machine learning, LLMs, and AI infrastructure. Employers post, seekers apply — simple.'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: DEFAULT_TITLE,
    template: `%s — ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: [
    'AI jobs',
    'AI engineer jobs',
    'machine learning jobs',
    'LLM engineer',
    'AI infrastructure',
    'ML engineer',
    'deep learning jobs',
    'NLP jobs',
    'data scientist',
    'AI startup jobs',
    'remote AI jobs',
  ],
  authors: [{ name: 'Live AI Jobs' }],
  creator: 'Live AI Jobs',
  publisher: 'Live AI Jobs',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: APP_URL,
    siteName: SITE_NAME,
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  alternates: {
    canonical: APP_URL,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${inter.className} bg-[var(--app-bg)] text-[var(--ink-strong)] antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
