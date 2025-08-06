"use client";

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EquipmentQnA } from '@/components/equipment-q-and-a';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Info, Camera, Volume2, VolumeX, Play, Pause } from 'lucide-react';

export default function EquipmentDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ name: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const resolvedSearchParams = use(searchParams);
  const equipmentName = decodeURIComponent(resolvedParams.name);
  const description = resolvedSearchParams.description ? decodeURIComponent(resolvedSearchParams.description as string) : null;
  const category = resolvedSearchParams.category ? decodeURIComponent(resolvedSearchParams.category as string) : null;
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);
  const [hasAutoPlayed, setHasAutoPlayed] = useState(false);

  useEffect(() => {
    // Retrieve the captured image from sessionStorage
    const storedImage = sessionStorage.getItem('capturedEquipmentImage');
    if (storedImage) {
      setCapturedImage(storedImage);
      // Clear the stored image after retrieving it
      sessionStorage.removeItem('capturedEquipmentImage');
    }

    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      setSpeechSynthesis(window.speechSynthesis);
    }
  }, []);

  // Voice command: Listen for 'another equipment' and navigate to scan page
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
      if (transcript.includes('another equipment')) {
        router.push('/');
      } else if (transcript.includes('okay')) {
        stopSpeaking();
      }
    };
    
    recognition.onerror = (event: any) => {
      // Optionally handle errors
    };
    
    recognition.start();
    return () => recognition.stop();
  }, [router]);

  // Auto-play audio when page loads from equipment identification
  useEffect(() => {
    if (speechSynthesis && !hasAutoPlayed) {
      const autoPlayFlag = sessionStorage.getItem('autoPlayAudio');
      if (autoPlayFlag === 'true') {
        // Clear the flag
        sessionStorage.removeItem('autoPlayAudio');
        setHasAutoPlayed(true);
        
        // Small delay to ensure everything is loaded
        setTimeout(() => {
          speakEquipmentDetails();
        }, 500);
      }
    }
  }, [speechSynthesis, hasAutoPlayed]);

  const speakEquipmentDetails = () => {
    if (!speechSynthesis) return;

    // Stop any current speech
    speechSynthesis.cancel();

    // Create the text to speak
    let textToSpeak = `Equipment identified: ${equipmentName}. `;
    
    if (category) {
      textToSpeak += `Category: ${category}. `;
    }
    
    if (description) {
      textToSpeak += `Description: ${description}`;
    } else {
      textToSpeak += `This is a catalog entry for ${equipmentName}. Use the form below to ask specific questions.`;
    }

    // Create speech utterance
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Set up event listeners
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    // Speak the text
    speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (speechSynthesis) {
      speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  const toggleAudio = () => {
    if (isPlaying) {
      stopSpeaking();
    } else {
      speakEquipmentDetails();
    }
  };
  
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <Card className="overflow-hidden shadow-lg">
        <div className="relative">
          {capturedImage ? (
            <Image
              src={capturedImage}
              alt={`Captured image of ${equipmentName}`}
              width={800}
              height={400}
              className="w-full h-48 md:h-64 object-cover"
              data-ai-hint="lab equipment"
            />
          ) : (
            <div className="w-full h-48 md:h-64 bg-muted flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Camera className="h-12 w-12 mx-auto mb-2" />
                <p>No captured image available</p>
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-bold font-headline text-white">{equipmentName}</h1>
              <Button
                onClick={toggleAudio}
                size="sm"
                variant="secondary"
                className="bg-white/20 text-white border-white/30 hover:bg-white/30"
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="flex gap-2 mt-2">
              {category && <Badge variant="secondary" className="bg-white/20 text-white border-none">{category}</Badge>}
              {capturedImage && (
                <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-300">
                  Captured Image
                </Badge>
              )}
            </div>
          </div>
        </div>
        <CardContent className="p-6">
          {description ? (
            <div className="space-y-4">
              <p className="text-base text-foreground/90">{description}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Volume2 className="h-4 w-4" />
                <span>Click the audio button above to hear the equipment details</span>
              </div>
            </div>
          ) : (
             <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Information</AlertTitle>
                <AlertDescription>
                  {`This is a catalog entry for ${equipmentName}. Use the form below to ask specific questions.`}
                </AlertDescription>
              </Alert>
          )}
        </CardContent>
      </Card>
      
      <EquipmentQnA 
        equipmentName={equipmentName}
        description={description}
        category={category}
        capturedImage={capturedImage}
      />
    </div>
  );
}
