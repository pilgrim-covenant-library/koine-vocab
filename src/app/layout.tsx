import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/ThemeProvider';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin', 'greek'],
});

export const metadata: Metadata = {
  title: 'Koine Greek Vocab | Master NT Greek',
  description:
    'Master New Testament Greek vocabulary with spaced repetition, flashcards, quizzes, and more. Perfect for seminary students.',
  keywords: [
    'Koine Greek',
    'New Testament',
    'Greek vocabulary',
    'seminary',
    'flashcards',
    'spaced repetition',
    'Bible study',
  ],
  authors: [{ name: 'Koine Vocab' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Koine Greek',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen bg-background text-foreground">
            {children}
          </div>
          <OfflineIndicator />
        </ThemeProvider>
      </body>
    </html>
  );
}
