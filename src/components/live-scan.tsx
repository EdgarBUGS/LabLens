"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { identifyEquipment } from '@/ai/flows/identify-equipment';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Camera, LoaderCircle, AlertCircle, ScanLine, CheckCircle, ArrowRight } from 'lucide-react';
import type { IdentifyEquipmentOutput } from '@/ai/flows/identify-equipment';
import { Badge } from '@/components/ui/badge';

export function LiveScan() {
  const router = useRouter();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [identificationResult, setIdentificationResult] = useState<IdentifyEquipmentOutput | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [shouldNavigate, setShouldNavigate] = useState(false);

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

  // Voice command: Listen for 'Identify Equipment' and trigger scan
  useEffect(() => {
    if (!isCameraReady || capturedImage) return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
      if (transcript.includes('identify equipment')) {
        handleScan();
      }
    };
    recognition.onerror = (event: any) => {
      // Optionally handle errors
    };
    recognition.start();
    return () => recognition.stop();
  }, [isCameraReady, capturedImage]);

  // Effect to handle navigation after identification
  useEffect(() => {
    if (shouldNavigate && identificationResult && capturedImage && !isNavigating) {
      handleViewDetails();
      setShouldNavigate(false);
    }
  }, [shouldNavigate, identificationResult, capturedImage, isNavigating]);
  
  const handleScan = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsLoading(true);
    setError(null);
    setCapturedImage(null);
    setIdentificationResult(null);
    setIsNavigating(false);
    setShouldNavigate(false);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const capturedImageDataUri = canvas.toDataURL('image/jpeg', 0.8); // Compress to 80% quality
      setCapturedImage(capturedImageDataUri);
      
      try {
        const result: IdentifyEquipmentOutput = await identifyEquipment({ photoDataUri: capturedImageDataUri });

        if (result && result.equipmentName) {
          setIdentificationResult(result);
          toast({
            title: "Equipment Identified!",
            description: `Identified as: ${result.equipmentName}`,
          });
          
          // Set flag to trigger navigation in useEffect
          setShouldNavigate(true);
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

  const handleViewDetails = async () => {
    if (!identificationResult || !capturedImage) {
      console.error("Missing identification result or captured image", { identificationResult, capturedImage: !!capturedImage });
      return;
    }
    
    try {
      setIsNavigating(true);
      
      // Store the captured image in sessionStorage for the detail page
      sessionStorage.setItem('capturedEquipmentImage', capturedImage);
      
      // Store flag to auto-play audio
      sessionStorage.setItem('autoPlayAudio', 'true');
      
      const query = new URLSearchParams({
        description: identificationResult.description || '',
        category: identificationResult.category || '',
      });
      
      const equipmentName = encodeURIComponent(identificationResult.equipmentName);
      const url = `/equipment/${equipmentName}?${query.toString()}`;
      
      console.log("Navigating to:", url);
      
      // Use router.push to navigate
      router.push(url);
      
      // Fallback: if navigation doesn't work after 2 seconds, show manual button
      setTimeout(() => {
        if (isNavigating) {
          setIsNavigating(false);
          toast({
            title: "Navigation Issue",
            description: "Please click 'View Details' to proceed manually.",
          });
        }
      }, 2000);
      
    } catch (error) {
      console.error("Navigation error:", error);
      setError("Failed to navigate to equipment details. Please try again.");
      setIsNavigating(false);
    }
  };

  const handleNewScan = () => {
    setCapturedImage(null);
    setIdentificationResult(null);
    setError(null);
    setIsNavigating(false);
    setShouldNavigate(false);
  };

  return (
    <Card className="w-full max-w-2xl shadow-lg">
      <CardContent className="p-4 md:p-6">
        {!capturedImage ? (
          // Camera view
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
        ) : (
          // Captured image preview (briefly shown before redirect)
          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden border">
            <img 
              src={capturedImage} 
              alt="Captured equipment" 
              className="w-full h-full object-cover"
            />
            {identificationResult && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            )}
            {identificationResult && (
              <div className="absolute bottom-0 left-0 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <h3 className="text-xl font-bold text-white">{identificationResult.equipmentName}</h3>
                </div>
                {identificationResult.category && (
                  <Badge variant="secondary" className="bg-white/20 text-white border-none">
                    {identificationResult.category}
                  </Badge>
                )}
                <div className="mt-2 text-white/80 text-sm">
                  <p>{isNavigating ? "Navigating to details page..." : "Redirecting to details page..."}</p>
                </div>
              </div>
            )}
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="mt-6 flex justify-center gap-3">
          {!capturedImage ? (
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
          ) : (
            <>
              <Button onClick={handleNewScan} variant="outline" size="lg" disabled={isNavigating}>
                <Camera className="mr-2 h-5 w-5" />
                New Scan
              </Button>
              {identificationResult && !isNavigating && (
                <Button onClick={handleViewDetails} size="lg">
                  <ArrowRight className="mr-2 h-5 w-5" />
                  View Details
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
