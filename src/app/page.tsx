import { LiveScan } from '@/components/live-scan';

export default function Home() {
  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold font-headline tracking-tight text-primary">
          Live Equipment Scan
        </h1>
        <p className="mt-4 text-lg text-foreground/80">
          Point your camera at a piece of lab equipment, and we'll identify it for you.
          This app is designed to detect only laboratory equipment - non-laboratory items will be rejected.
          Make sure the item is well-lit and centered in the frame for the best results.
        </p>
      </div>
      <LiveScan />
    </div>
  );
}
