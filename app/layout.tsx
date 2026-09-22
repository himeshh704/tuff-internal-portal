import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MA Ashapuri Tuff — Factory Portal',
  description: 'Factory order and production management system for MA Ashapuri Tuff',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
