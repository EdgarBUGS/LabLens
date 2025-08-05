"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getEquipmentDetails } from '@/ai/flows/get-equipment-details';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle, Sparkles, Volume2, Pause, Mic, MicOff, Keyboard } from 'lucide-react';

// Type declarations for Speech Recognition API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const formSchema = z.object({
  query: z.string().min(1, 'Please enter a question.'),
});

type EquipmentQnAProps = {
  equipmentName: string;
};

export function EquipmentQnA({ equipmentName }: EquipmentQnAProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isVoiceSupported, setIsVoiceSupported] = useState(false);
  const [inputMode, setInputMode] = useState<'text' | 'voice'>('text');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      query: '',
    },
  });

  useEffect(() => {
    if ('speechSynthesis' in window) {
      setSpeechSynthesis(window.speechSynthesis);
    }
    
    // Check if speech recognition is supported
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsVoiceSupported(true);
    }
  }, []);

  const speakExplanation = () => {
    if (!speechSynthesis || !explanation) return;
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(explanation);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
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
      speakExplanation();
    }
  };

  const startVoiceInput = () => {
    if (!isVoiceSupported) {
      toast({
        title: "Voice Input Not Supported",
        description: "Your browser doesn't support voice input. Please type your question instead.",
      });
      return;
    }

    setIsListening(true);
    setInputMode('voice');

    // Use the appropriate Speech Recognition API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      toast({
        title: "Listening...",
        description: "Please speak your question now.",
      });
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      form.setValue('query', transcript);
      setIsListening(false);
      toast({
        title: "Question Captured",
        description: `"${transcript}" - Click "Ask AI Assistant" to submit.`,
      });
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      toast({
        variant: "destructive",
        title: "Voice Input Error",
        description: "Could not capture your voice. Please try again or type your question.",
      });
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const stopVoiceInput = () => {
    setIsListening(false);
    setInputMode('text');
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setExplanation(null);
    setIsPlaying(false);
    try {
      const result = await getEquipmentDetails({
        equipmentName: equipmentName,
        query: values.query,
      });
      setExplanation(result.explanation);
    } catch (error) {
      console.error('Error getting equipment details:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get equipment details. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Ask a Question</CardTitle>
          <CardDescription>
            Have a specific question about the {equipmentName}? Ask our AI assistant!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="query" className="text-sm font-medium">
                  Your Question
                </label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={inputMode === 'text' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setInputMode('text')}
                    className="flex items-center gap-1"
                  >
                    <Keyboard className="h-3 w-3" />
                    Type
                  </Button>
                  <Button
                    type="button"
                    variant={inputMode === 'voice' ? 'default' : 'outline'}
                    size="sm"
                    onClick={startVoiceInput}
                    disabled={!isVoiceSupported || isListening}
                    className="flex items-center gap-1"
                  >
                    {isListening ? (
                      <>
                        <MicOff className="h-3 w-3" />
                        Stop
                      </>
                    ) : (
                      <>
                        <Mic className="h-3 w-3" />
                        Voice
                      </>
                    )}
                  </Button>
                </div>
              </div>
              <Textarea
                id="query"
                placeholder={`e.g., "What are the safety precautions for using a ${equipmentName}?"`}
                className="min-h-[100px] resize-y"
                {...form.register('query')}
                disabled={isListening}
              />
              {isListening && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex gap-1">
                    <div className="w-1 h-4 bg-primary animate-pulse rounded"></div>
                    <div className="w-1 h-4 bg-primary animate-pulse rounded" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-1 h-4 bg-primary animate-pulse rounded" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span>Listening... Speak your question now</span>
                </div>
              )}
              {form.formState.errors.query && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.query.message}
                </p>
              )}
            </div>
            <Button type="submit" disabled={isLoading || isListening} className="w-full">
              {isLoading ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Asking AI Assistant...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Ask AI Assistant
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {explanation && (
        <Card className="bg-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between font-headline">
              <div className="flex items-center gap-2 text-primary">
                <Sparkles className="h-5 w-5" />
                AI Explanation
              </div>
              <Button
                onClick={toggleAudio}
                size="sm"
                variant="outline"
                className="text-primary border-primary/30 hover:bg-primary/10"
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-foreground/90 whitespace-pre-wrap">
              {explanation}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-3">
              <Volume2 className="h-4 w-4" />
              <span>Click the audio button to hear the explanation</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
