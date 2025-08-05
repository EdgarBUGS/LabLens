import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EquipmentQnA } from '@/components/equipment-q-and-a';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export default function EquipmentDetailsPage({
  params,
  searchParams,
}: {
  params: { name: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const equipmentName = decodeURIComponent(params.name);
  const description = searchParams.description ? decodeURIComponent(searchParams.description as string) : null;
  const category = searchParams.category ? decodeURIComponent(searchParams.category as string) : null;
  
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <Card className="overflow-hidden shadow-lg">
        <div className="relative">
          <Image
            src="https://placehold.co/800x400.png"
            alt={equipmentName}
            width={800}
            height={400}
            className="w-full h-48 md:h-64 object-cover"
            data-ai-hint="lab equipment"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6">
            <h1 className="text-3xl md:text-4xl font-bold font-headline text-white">{equipmentName}</h1>
            {category && <Badge variant="secondary" className="mt-2 bg-white/20 text-white border-none">{category}</Badge>}
          </div>
        </div>
        <CardContent className="p-6">
          {description ? (
            <p className="text-base text-foreground/90">{description}</p>
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
      
      <EquipmentQnA equipmentName={equipmentName} />
    </div>
  );
}
