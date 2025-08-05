"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getEquipmentDetails } from '@/ai/flows/get-equipment-details';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle, Sparkles } from 'lucide-react';

const formSchema = z.object({
  query: z.string().min(10, {
    message: "Your question must be at least 10 characters long.",
  }).max(200, {
    message: "Your question must not be longer than 200 characters.",
  }),
});

interface EquipmentQnAProps {
  equipmentName: string;
}

export function EquipmentQnA({ equipmentName }: EquipmentQnAProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      query: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setExplanation(null);
    try {
      const result = await getEquipmentDetails({
        equipmentName: equipmentName,
        query: values.query,
      });
      setExplanation(result.explanation);
    } catch (error) {
      console.error("Error getting equipment details:", error);
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: "Could not fetch details. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Ask a Question</CardTitle>
          <CardDescription>
            Have a specific question about the {equipmentName}? Ask our AI assistant!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="query"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Question</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={`e.g., "What are the safety precautions for using a ${equipmentName}?"`}
                        {...field}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    Getting Answer...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Ask AI Assistant
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {explanation && (
        <Card className="bg-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary font-headline">
              <Sparkles className="h-5 w-5" />
              AI Explanation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-foreground/90 whitespace-pre-wrap">
              {explanation}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
