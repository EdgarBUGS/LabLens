import Link from 'next/link';
import { Microscope, BookOpenCheck, ScanLine } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="bg-card shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-3 text-primary transition-opacity hover:opacity-80">
            <Microscope className="h-7 w-7" />
            <span className="text-2xl font-bold font-headline text-foreground">LabLens</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Button asChild variant="ghost" className="hidden sm:flex">
              <Link href="/catalog">
                <BookOpenCheck className="mr-2 h-4 w-4" />
                Catalog
              </Link>
            </Button>
            <Button asChild>
                <Link href="/">
                    <ScanLine className="mr-2 h-4 w-4" />
                    Scan Equipment
                </Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
