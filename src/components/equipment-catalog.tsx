import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Beaker, FlaskConical, TestTube2, Pipette, Scale, Microscope, Thermometer, BunsenBurner } from 'lucide-react';

const equipmentList = [
  { name: 'Beaker', icon: Beaker, description: 'A cylindrical container used for stirring, mixing and heating liquids.' },
  { name: 'Erlenmeyer Flask', icon: FlaskConical, description: 'A conical flask used to hold and mix chemicals, heat liquids.' },
  { name: 'Test Tube', icon: TestTube2, description: 'A thin glass tube used to hold small amounts of material for experiments.' },
  { name: 'Pipette', icon: Pipette, description: 'Used to transport a measured volume of liquid.' },
  { name: 'Digital Scale', icon: Scale, description: 'An instrument used to measure mass with high precision.' },
  { name: 'Microscope', icon: Microscope, description: 'An instrument used to see objects that are too small for the naked eye.' },
  { name: 'Thermometer', icon: Thermometer, description: 'A device that measures temperature or a temperature gradient.' },
  { name: 'Bunsen Burner', icon: BunsenBurner, description: 'Produces a single open gas flame, which is used for heating.' },
];

export function EquipmentCatalog() {
  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {equipmentList.map((item) => (
        <Link href={`/equipment/${encodeURIComponent(item.name)}?description=${encodeURIComponent(item.description)}&category=Labware`} key={item.name} className="block h-full">
          <Card className="h-full hover:shadow-xl hover:border-primary transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium text-primary">{item.name}</CardTitle>
              <item.icon className="h-6 w-6 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
