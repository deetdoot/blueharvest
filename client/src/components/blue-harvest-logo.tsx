
import blueHarvestLogoImg from "@assets/BlueHarvest Logo_1759023379104.png";

interface BlueHarvestLogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function BlueHarvestLogo({ 
  className = "", 
  showText = false, 
  size = "lg" 
}: BlueHarvestLogoProps) {
  const logoSizes = {
    sm: "h-8 w-auto",
    md: "h-12 w-auto", 
    lg: "h-16 w-auto"
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl"
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <img 
        src={blueHarvestLogoImg} 
        alt="Blue Harvest" 
        className={logoSizes[size]}
        data-testid="logo-blue-harvest"
      />
      
      {showText && (
        <h1 className={`${textSizes[size]} font-bold text-primary`} data-testid="text-company-name">
          Blue Harvest
        </h1>
      )}
    </div>
  );
}
