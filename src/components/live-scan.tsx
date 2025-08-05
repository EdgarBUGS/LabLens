"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { identifyEquipment } from '@/ai/flows/identify-equipment';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Camera, LoaderCircle, AlertCircle, ScanLine } from 'lucide-react';
import type { IdentifyEquipmentOutput } from '@/ai/flows/identify-equipment';

export function LiveScan() {
  const router = useRouter();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);

  const setupCamera = useCallback(async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            setIsCameraReady(true);
          }
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Could not access camera. Please ensure you have a camera connected and have granted permission to use it.");
      }
    } else {
      setError("Your browser does not support camera access.");
    }
  }, []);

  useEffect(() => {
    setupCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [setupCamera]);
  
  const handleScan = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsLoading(true);
    setError(null);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUri = canvas.toDataURL('image/jpeg');
      
      try {
        const result: IdentifyEquipmentOutput = await identifyEquipment({ photoDataUri: dataUri });

        if (result && result.equipmentName) {
          toast({
            title: "Equipment Identified!",
            description: `Identified as: ${result.equipmentName}`,
          });
          const query = new URLSearchParams({
            description: result.description,
            category: result.category,
          });
          router.push(`/equipment/${encodeURIComponent(result.equipmentName)}?${query.toString()}`);
        } else {
          throw new Error("Identification failed. No equipment name found in result.");
        }
      } catch (err) {
        console.error("Identification error:", err);
        setError("Could not identify the equipment. Please try again with a clearer image.");
        toast({
          variant: "destructive",
          title: "Identification Failed",
          description: "We couldn't identify the equipment. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Card className="w-full max-w-2xl shadow-lg">
      <CardContent className="p-4 md:p-6">
        <div className="relative aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center border">
          <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
          {!isCameraReady && !error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 text-foreground">
              <Camera className="h-12 w-12 mb-4 animate-pulse" />
              <p>Starting camera...</p>
            </div>
          )}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <LoaderCircle className="h-16 w-16 animate-spin text-white" />
            </div>
          )}
        </div>
        <canvas ref={canvasRef} className="hidden" />

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="mt-6 flex justify-center">
          <Button onClick={handleScan} disabled={isLoading || !isCameraReady || !!error} size="lg">
            {isLoading ? (
              <>
                <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <ScanLine className="mr-2 h-5 w-5" />
                Identify Equipment
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
