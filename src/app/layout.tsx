import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://wnbahoopsnews.com'),
  title: {
    default: 'WNBA Hoops News | Your Daily Source for Women\'s Basketball',
    template: '%s | WNBA Hoops News',
  },
  description:
    'Breaking WNBA news, verified game scores, Eastern and Western Conference standings, player statistics, schedules, and tactical analysis.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'WNBA Hoops News',
    title: 'WNBA Hoops News | Your Daily Source for Women\'s Basketball',
    description:
      'Premium coverage of the Women\'s National Basketball Association: breaking news, live scores, standings, and stats.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WNBA Hoops News',
    description: 'Your Daily Source for Women\'s Basketball.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-hoops-navy text-slate-100 antialiased selection:bg-hoops-orange selection:text-white">
        {children}
      </body>
    </html>
  );
}
