import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'LabLens',
  description: 'An educational app for identifying science lab equipment.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased text-foreground flex flex-col min-h-screen relative">
        {/* Blurred background logo */}
        <div 
          className="fixed inset-0 z-0 opacity-20"
          style={{
            backgroundImage: 'url(/school-logo.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            filter: 'blur(8px)',
          }}
        />
        {/* Content overlay */}
        <div className="relative z-10 flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 container mx-auto p-4 sm:p-6 md:p-8">
            <div className="bg-background/90 backdrop-blur-sm rounded-lg shadow-lg p-6">
              {children}
            </div>
          </main>
          <Toaster />
        </div>
      </body>
    </html>
  );
}
