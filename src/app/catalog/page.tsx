import { EquipmentCatalog } from '@/components/equipment-catalog';

export default function CatalogPage() {
  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold font-headline tracking-tight text-primary">
          Equipment Catalog
        </h1>
        <p className="mt-4 text-lg text-foreground/80">
          Browse our catalog of common science lab equipment to learn more about each item.
        </p>
      </div>
      <EquipmentCatalog />
    </div>
  );
}
