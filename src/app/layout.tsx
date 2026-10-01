import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Drop Ur EmBeGe! - Multiplayer Web Arcade',
  description: 'Balapan pengantaran MBG dari SPPG ke Sekolah',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-slate-900 text-slate-100">{children}</body>
    </html>
  );
}
