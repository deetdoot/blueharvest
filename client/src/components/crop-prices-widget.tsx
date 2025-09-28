import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, DollarSign, Globe, MapPin, Wheat } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

interface CropPricesWidgetProps {
  farmerId: string;
}

interface CropPriceData {
  commodity: string;
  international: {
    price: number;
    unit: string;
    change: number;
    change_percent: number;
    high_52_week?: number;
    low_52_week?: number;
    volume?: number;
    last_updated: string;
  };
  local: {
    price: number;
    unit: string;
    source: string;
    last_updated: string;
  } | null;
  price_difference: string | null;
}

const getCommodityIcon = (commodity: string) => {
  switch (commodity.toLowerCase()) {
    case 'corn':
      return <Wheat className="h-5 w-5 text-yellow-600" />;
    case 'wheat':
      return <Wheat className="h-5 w-5 text-amber-600" />;
    case 'soybeans':
      return <Wheat className="h-5 w-5 text-green-600" />;
    case 'rice':
      return <Wheat className="h-5 w-5 text-green-700" />;
    case 'cotton':
      return <Wheat className="h-5 w-5 text-gray-600" />;
    default:
      return <Wheat className="h-5 w-5 text-green-600" />;
  }
};

const formatPrice = (price: number, unit: string) => {
  return `$${price.toFixed(2)}/${unit}`;
};

const formatChange = (change: number, changePercent: number) => {
  const isPositive = change >= 0;
  return (
    <div className={`flex items-center space-x-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
      {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      <span className="text-xs font-medium">
        {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
      </span>
    </div>
  );
};

export default function CropPricesWidget({ farmerId }: CropPricesWidgetProps) {
  const { data: cropPrices = [], isLoading } = useQuery<CropPriceData[]>({
    queryKey: ["/api/farmers", farmerId, "crop-prices"],
    enabled: !!farmerId,
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  if (isLoading) {
    return (
      <Card className="crop-prices-widget border-border" data-testid="card-crop-prices-loading">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <span>Crop Market Prices</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Separator />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="crop-prices-widget border-border" data-testid="card-crop-prices">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2" data-testid="text-crop-prices-title">
            <DollarSign className="h-5 w-5 text-green-600" />
            <span>Market Prices</span>
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            Live
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {cropPrices.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground text-sm" data-testid="text-no-crop-data">
                No crop data available. Add crops to your farm to see market prices.
              </p>
            </div>
          ) : (
            cropPrices.map((cropPrice, index) => (
              <div key={index} className="space-y-3" data-testid={`crop-price-item-${cropPrice.commodity.toLowerCase()}`}>
                {/* Commodity Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getCommodityIcon(cropPrice.commodity)}
                    <span className="font-medium capitalize">{cropPrice.commodity}</span>
                  </div>
                  {formatChange(cropPrice.international.change, cropPrice.international.change_percent)}
                </div>

                {/* Price Comparison */}
                <div className="grid grid-cols-2 gap-3">
                  {/* International Price */}
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      <Globe className="h-3 w-3" />
                      <span>International</span>
                    </div>
                    <p className="font-semibold text-sm" data-testid={`price-international-${cropPrice.commodity.toLowerCase()}`}>
                      {formatPrice(cropPrice.international.price, cropPrice.international.unit)}
                    </p>
                    {cropPrice.international.high_52_week && (
                      <p className="text-xs text-muted-foreground">
                        52W High: ${cropPrice.international.high_52_week.toFixed(2)}
                      </p>
                    )}
                  </div>

                  {/* Local Price */}
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>Local</span>
                    </div>
                    {cropPrice.local ? (
                      <>
                        <p className="font-semibold text-sm" data-testid={`price-local-${cropPrice.commodity.toLowerCase()}`}>
                          {formatPrice(cropPrice.local.price, cropPrice.local.unit)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {cropPrice.local.source}
                        </p>
                      </>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Local pricing unavailable
                      </p>
                    )}
                  </div>
                </div>

                {/* Price Difference */}
                {cropPrice.price_difference && (
                  <div className="mt-2">
                    <Badge 
                      variant={parseFloat(cropPrice.price_difference) >= 0 ? "default" : "destructive"} 
                      className="text-xs"
                    >
                      Local Premium: {parseFloat(cropPrice.price_difference) >= 0 ? '+' : ''}
                      {cropPrice.price_difference}%
                    </Badge>
                  </div>
                )}

                {index < cropPrices.length - 1 && <Separator className="mt-3" />}
              </div>
            ))
          )}
        </div>

        {/* Last Updated */}
        {cropPrices.length > 0 && (
          <div className="mt-4 pt-3 border-t">
            <p className="text-xs text-muted-foreground text-center">
              Last updated: {new Date(cropPrices[0]?.international?.last_updated || new Date()).toLocaleTimeString()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}