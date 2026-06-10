import type { Metadata, Viewport } from 'next';
import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google';
import { CarbonProvider } from '../context/CarbonContext';
import AppClientLayout from '../components/shared/AppClientLayout';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  weight: ['700'],
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500'],
  display: 'swap',
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  weight: ['400'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CarbonLens — AI Carbon Intelligence for India',
  description: 'Track, analyze, and reduce your personal carbon footprint with India-specific emission intelligence.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'CarbonLens',
  },
};

export const viewport: Viewport = {
  themeColor: '#080B12',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetBrainsMono.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var theme = localStorage.getItem('carbonlens_theme') || 'dark';
                document.documentElement.classList.add(theme);
              })();
            `
          }}
        />
      </head>
      <body className="antialiased">
        <CarbonProvider>
          <AppClientLayout>{children}</AppClientLayout>
        </CarbonProvider>
      </body>
    </html>
  );
}
