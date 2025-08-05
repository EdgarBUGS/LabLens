import Image from 'next/image';

interface SchoolLogoProps {
  className?: string;
  size?: number;
}

export function SchoolLogo({ className = '', size = 40 }: SchoolLogoProps) {
  return (
    <div 
      className={`relative ${className}`} 
      style={{ width: size, height: size }}
      title="Malate-Olos High School - Cagmanaba, Ocampo, Cam. Sur"
    >
      <Image
        src="/school-logo.jpg"
        alt="Malate-Olos High School Logo"
        width={size}
        height={size}
        className="object-contain w-full h-full rounded-full"
        priority
      />
    </div>
  );
} 