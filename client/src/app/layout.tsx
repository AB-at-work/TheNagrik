import type { Metadata } from 'next';
import { dmSans, dmSerif } from '@/lib/fonts';
import '@/styles/reset.css';
import '@/styles/tokens.css';
import '@/styles/typography.css';
import '@/styles/animations.css';
import './globals.css';

export const metadata: Metadata = {
  title: {
    template: '%s | The Nagrik',
    default: 'The Nagrik — Civic Literacy Initiative',
  },
  description: 'Empowering citizens through civic literacy and constitutional awareness. Access educational resources, school programs, and civic journalism.',
  keywords: ['Civic Literacy', 'Constitution', 'India', 'Education', 'Civics', 'Student Initiative'],
  authors: [{ name: 'The Nagrik Team' }],
  icons: {
    icon: [
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon.ico', type: 'image/x-icon' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ]
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: 'The Nagrik',
    description: 'Empowering citizens through civic literacy and constitutional awareness.',
    url: 'https://thenagrik.com',
    siteName: 'The Nagrik',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Nagrik',
    description: 'Empowering citizens through civic literacy and constitutional awareness.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

import { AuthProvider } from '@/lib/auth-context';
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${dmSerif.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "The Nagrik",
              "url": "https://thenagrik.com",
              "logo": "https://thenagrik.com/logo.png",
              "description": "Empowering citizens through civic literacy and constitutional awareness.",
              "sameAs": [
                "https://www.instagram.com/nagrikindia?igsh=enFqb2Vicnh6dTl1&utm_source=qr"
              ]
            })
          }}
        />
        <AuthProvider>
          {children}
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
