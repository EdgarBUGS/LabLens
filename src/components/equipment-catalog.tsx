import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Beaker, 
  FlaskConical, 
  TestTube2, 
  Pipette, 
  Scale, 
  Microscope, 
  Thermometer, 
  Flame,
  Droplets,
  Eye,
  Zap,
  Magnet,
  Ruler,
  Timer,
  Calculator,
  BookOpen,
  Lightbulb,
  Battery,
  Gauge,
  Filter,
  GraduationCap,
  TestTube,
  Atom,
  Droplet
} from 'lucide-react';

const equipmentList = [
  // Chemistry Equipment
  { name: 'Beaker', icon: Beaker, description: 'A cylindrical container used for stirring, mixing and heating liquids.', category: 'Chemistry' },
  { name: 'Erlenmeyer Flask', icon: FlaskConical, description: 'A conical flask used to hold and mix chemicals, heat liquids.', category: 'Chemistry' },
  { name: 'Test Tube', icon: TestTube2, description: 'A thin glass tube used to hold small amounts of material for experiments.', category: 'Chemistry' },
  { name: 'Pipette', icon: Pipette, description: 'Used to transport a measured volume of liquid.', category: 'Chemistry' },
  { name: 'Bunsen Burner', icon: Flame, description: 'Produces a single open gas flame, which is used for heating.', category: 'Chemistry' },
  { name: 'Dropper', icon: Droplet, description: 'A small tube with a rubber bulb used to transfer small amounts of liquid.', category: 'Chemistry' },
  { name: 'Filter Paper', icon: Filter, description: 'Porous paper used to separate solids from liquids in filtration.', category: 'Chemistry' },
  { name: 'Graduated Cylinder', icon: GraduationCap, description: 'A tall, narrow container with volume markings for precise liquid measurement.', category: 'Chemistry' },
  { name: 'Test Tube Rack', icon: TestTube, description: 'A holder for organizing and storing test tubes during experiments.', category: 'Chemistry' },
  { name: 'Safety Goggles', icon: Eye, description: 'Protective eyewear to shield eyes from chemical splashes and flying debris.', category: 'Safety' },
  
  // Biology Equipment
  { name: 'Microscope', icon: Microscope, description: 'An instrument used to see objects that are too small for the naked eye.', category: 'Biology' },
  { name: 'Petri Dish', icon: Droplets, description: 'A shallow dish used to culture bacteria and other microorganisms.', category: 'Biology' },
  { name: 'Dissecting Kit', icon: BookOpen, description: 'A set of tools used for dissecting specimens in biology labs.', category: 'Biology' },
  { name: 'Slide and Cover Slip', icon: Eye, description: 'Glass slides and covers used to prepare specimens for microscopic examination.', category: 'Biology' },
  { name: 'Plant Pot', icon: GraduationCap, description: 'Container used for growing plants and conducting plant experiments.', category: 'Biology' },
  
  // Physics Equipment
  { name: 'Magnet', icon: Magnet, description: 'An object that produces a magnetic field and attracts certain materials.', category: 'Physics' },
  { name: 'Light Bulb', icon: Lightbulb, description: 'A device that produces light when electricity passes through it.', category: 'Physics' },
  { name: 'Battery', icon: Battery, description: 'A device that stores and provides electrical energy for experiments.', category: 'Physics' },
  { name: 'Wire', icon: Zap, description: 'Conductive material used to connect electrical components in circuits.', category: 'Physics' },
  { name: 'Pulley', icon: Gauge, description: 'A wheel with a groove used to change the direction of force in experiments.', category: 'Physics' },
  { name: 'Spring Scale', icon: Scale, description: 'A device that measures force by the extension of a spring.', category: 'Physics' },
  
  // Measurement Equipment
  { name: 'Digital Scale', icon: Scale, description: 'An instrument used to measure mass with high precision.', category: 'Measurement' },
  { name: 'Thermometer', icon: Thermometer, description: 'A device that measures temperature or a temperature gradient.', category: 'Measurement' },
  { name: 'Ruler', icon: Ruler, description: 'A straight edge with markings used to measure length and draw straight lines.', category: 'Measurement' },
  { name: 'Stopwatch', icon: Timer, description: 'A device used to measure time intervals during experiments.', category: 'Measurement' },
  { name: 'Calculator', icon: Calculator, description: 'An electronic device used for mathematical calculations in experiments.', category: 'Measurement' },
  
  // General Lab Equipment
  { name: 'Lab Apron', icon: BookOpen, description: 'Protective clothing worn to shield the body from chemical spills and stains.', category: 'Safety' },
  { name: 'Gloves', icon: Droplets, description: 'Protective hand coverings used when handling chemicals or hot materials.', category: 'Safety' },
  { name: 'Funnel', icon: Filter, description: 'A cone-shaped tool used to channel liquids or fine-grained substances into containers.', category: 'General' },
  { name: 'Stirring Rod', icon: Atom, description: 'A glass rod used to stir solutions and mixtures in the laboratory.', category: 'General' },
  { name: 'Tongs', icon: Gauge, description: 'A tool used to grip and lift hot objects or containers safely.', category: 'General' },
  { name: 'Beaker Tongs', icon: Beaker, description: 'Specialized tongs designed to hold and transport beakers safely.', category: 'General' },
];

export function EquipmentCatalog() {
  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {equipmentList.map((item) => (
        <Link href={`/equipment/${encodeURIComponent(item.name)}?description=${encodeURIComponent(item.description)}&category=${encodeURIComponent(item.category)}`} key={item.name} className="block h-full">
          <Card className="h-full hover:shadow-xl hover:border-primary transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium text-primary">{item.name}</CardTitle>
              <item.icon className="h-6 w-6 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{item.description}</p>
              <div className="mt-2">
                <span className="inline-block bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-full">
                  {item.category}
                </span>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
