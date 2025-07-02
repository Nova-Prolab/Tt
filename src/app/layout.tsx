import type {Metadata} from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'Manhwa Scribe',
  description: 'Una ayuda de traducción funcional diseñada para traductores de Manhwa.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Lexend:wght@500;600;700&display=swap" rel="stylesheet"></link>
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
            defaultTheme="light"
            storageKey="manhwa-scribe-theme"
        >
            {children}
            <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
