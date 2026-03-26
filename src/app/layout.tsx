import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Diet Coke Tracker',
  description: 'Tracks Diet Coke availability',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto+Mono:ital,wght@0,100..700;1,100..700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
