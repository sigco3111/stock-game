import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '오르락 내리락 | 주식 시뮬레이션 게임',
  description:
    '한국 주식 시장을 배경으로 한 투자 시뮬레이션 게임. AI 투자자들과 경쟁하며 주식 투자를 학습하세요!',
  icons: {
    icon: '/favicon.ico',
  },
  keywords: ['주식', '시뮬레이션', '투자', '게임', '코스피', '한국거래소'],
  authors: [{ name: '오르락 내리락' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0a0f1a',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark">
      <body className="min-h-screen bg-[#0a0f1a] text-gray-100 antialiased">
        {children}
      </body>
    </html>
  );
}
