import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/context/ToastContext';
import { AuthProvider } from '@/context/AuthContext';
import { DataProvider } from '@/context/DataContext';
import { WorkspaceProvider } from '@/context/WorkspaceContext';
import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Client Management Dashboard',
  description: 'Clean personal dashboard for managing software development clients, projects, and outstanding receivables.',
  icons: {
    icon: '/logo.png',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Client Management Dashboard',
    description: 'Clean personal dashboard for managing software development clients, projects, and outstanding receivables.',
    images: '/logo.png',
  },
  openGraph: {
    title: 'Client Management Dashboard',
    description: 'Clean personal dashboard for managing software development clients, projects, and outstanding receivables.',
    images: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 selection:bg-slate-900 selection:text-white dark:selection:bg-slate-100 dark:selection:text-slate-900">
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <DataProvider>
                <WorkspaceProvider>
                  <SidebarProvider>{children}</SidebarProvider>
                </WorkspaceProvider>
              </DataProvider>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
