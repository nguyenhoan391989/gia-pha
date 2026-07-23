import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/theme-provider';
import { AppShell } from '@/components/app-shell';
import { Toaster } from '@/components/ui/sonner';
import { getCurrentUser } from '@/lib/session';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'Gia Phả Dòng Tộc', template: '%s | Gia Phả Dòng Tộc' },
  description: 'Ứng dụng quản lý gia phả dòng tộc - truyền thống, trang trọng, dễ sử dụng',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700&family=Noto+Serif:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <AppShell user={{ name: user.name, role: user.role, initials: user.initials }}>
            {children}
          </AppShell>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
