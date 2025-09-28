import { useQuery, useMutation } from "@tanstack/react-query";
import { Sprout, Apple, Carrot, Calendar, Clock, Droplets, Brain, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import type { IrrigationRecommendation } from "@shared/schema";

interface IrrigationRecommendationsProps {
  farmerId: string;
}

const getCropIcon = (cropType: string) => {
  switch (cropType.toLowerCase()) {
    case 'corn':
      return <Sprout className="h-6 w-6 text-green-600" />;
    case 'tomatoes':
    case 'tomato':
      return <Apple className="h-6 w-6 text-red-600" />;
    case 'carrots':
    case 'carrot':
      return <Carrot className="h-6 w-6 text-orange-600" />;
    default:
      return <Sprout className="h-6 w-6 text-green-600" />;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function IrrigationRecommendations({ farmerId }: IrrigationRecommendationsProps) {
  const { toast } = useToast();

  const { data: recommendations = [], isLoading } = useQuery<IrrigationRecommendation[]>({
    queryKey: ["/api/farmers", farmerId, "recommendations"],
    enabled: !!farmerId,
  });

  const { data: crops = [] } = useQuery({
    queryKey: ["/api/farmers", farmerId, "crops"],
    enabled: !!farmerId,
  });

  // Fetch ML-powered efficiency score
  const { data: efficiencyData } = useQuery({
    queryKey: ["/api/farmers", farmerId, "water-efficiency-score"],
    enabled: !!farmerId,
  });

  // Fetch historical data for insights
  const { data: historicalData } = useQuery({
    queryKey: ["/api/farmers", farmerId, "historical-data"],
    enabled: !!farmerId,
  });

  const generateRecommendationsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/farmers/${farmerId}/recommendations/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to generate recommendations');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/farmers", farmerId, "recommendations"] });
      toast({
        title: "Recommendations Generated",
        description: "New irrigation recommendations have been created based on current conditions.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to generate recommendations. Please try again.",
        variant: "destructive",
      });
    },
  });

  const scheduleIrrigationMutation = useMutation({
    mutationFn: async (recommendationId: string) => {
      const response = await fetch(`/api/recommendations/${recommendationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'scheduled' }),
      });
      if (!response.ok) throw new Error('Failed to schedule irrigation');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/farmers", farmerId, "recommendations"] });
      toast({
        title: "Irrigation Scheduled",
        description: "The irrigation has been scheduled successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to schedule irrigation. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getCropInfo = (cropId: string) => {
    return crops.find((crop: any) => crop.id === cropId);
  };

  // Calculate analytics
  const currentEfficiency = efficiencyData?.efficiency_score || 0.5;
  const totalYields = historicalData?.yields?.length || 0;
  const avgYield = totalYields > 0 
    ? historicalData.yields.reduce((sum: number, y: any) => sum + parseFloat(y.yieldPerAcre), 0) / totalYields
    : 0;

  const getEfficiencyInsight = () => {
    if (currentEfficiency >= 0.85) return { text: "Excellent water efficiency", color: "text-green-600", icon: <CheckCircle className="h-4 w-4" /> };
    if (currentEfficiency >= 0.7) return { text: "Good efficiency, room for improvement", color: "text-blue-600", icon: <TrendingUp className="h-4 w-4" /> };
    return { text: "Efficiency below optimal, needs attention", color: "text-yellow-600", icon: <AlertTriangle className="h-4 w-4" /> };
  };

  const efficiencyInsight = getEfficiencyInsight();

  if (isLoading) {
    return (
      <Card className="irrigation-recommendation">
        <CardHeader>
          <CardTitle>Today's Irrigation Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="irrigation-recommendation border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle data-testid="text-recommendations-title">AI-Powered Irrigation Recommendations</CardTitle>
          <div className="flex items-center space-x-2">
            <Badge className="bg-secondary text-secondary-foreground" data-testid="badge-ai-generated">
              <Brain className="h-3 w-3 mr-1" />
              ML Enhanced
            </Badge>
            <Button 
              onClick={() => generateRecommendationsMutation.mutate()}
              disabled={generateRecommendationsMutation.isPending}
              size="sm"
              data-testid="button-generate-recommendations"
            >
              {generateRecommendationsMutation.isPending ? "Generating..." : "Generate New"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* ML Insights Panel */}
        <div className="mb-6 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium flex items-center space-x-2">
              <Brain className="h-4 w-4 text-blue-600" />
              <span>Smart Analytics</span>
            </h4>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Water Efficiency</p>
              <div className="flex items-center justify-center space-x-1 mt-1">
                <Progress value={currentEfficiency * 100} className="w-16 h-2" />
                <span className="text-sm font-medium">{Math.round(currentEfficiency * 100)}%</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Historical Yields</p>
              <p className="text-lg font-semibold mt-1">{totalYields}</p>
              <p className="text-xs text-muted-foreground">records</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Performance</p>
              <div className={`flex items-center justify-center space-x-1 mt-1 ${efficiencyInsight.color}`}>
                {efficiencyInsight.icon}
                <span className="text-xs font-medium">Optimizing</span>
              </div>
            </div>
          </div>
          <div className={`mt-3 flex items-center space-x-2 ${efficiencyInsight.color}`}>
            {efficiencyInsight.icon}
            <span className="text-sm">{efficiencyInsight.text}</span>
          </div>
        </div>
        <div className="space-y-4">
          {recommendations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4" data-testid="text-no-recommendations">
                No irrigation recommendations available.
              </p>
              <Button 
                onClick={() => generateRecommendationsMutation.mutate()}
                disabled={generateRecommendationsMutation.isPending}
                data-testid="button-generate-first"
              >
                {generateRecommendationsMutation.isPending ? "Generating..." : "Generate Recommendations"}
              </Button>
            </div>
          ) : (
            recommendations.map((recommendation) => {
              const crop = getCropInfo(recommendation.cropId);
              const recommendedDate = new Date(recommendation.recommendedDate);
              const isToday = recommendedDate.toDateString() === new Date().toDateString();
              const timeString = recommendedDate.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              });

              return (
                <div 
                  key={recommendation.id}
                  className="flex items-start space-x-4 p-4 bg-white rounded-lg border border-border"
                  data-testid={`recommendation-${recommendation.id}`}
                >
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    {crop ? getCropIcon(crop.cropType) : <Sprout className="h-6 w-6 text-green-600" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-foreground" data-testid={`text-crop-name-${recommendation.id}`}>
                        {crop ? `${crop.fieldName} - ${crop.cropType} (${crop.acres} acres)` : 'Unknown Crop'}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <Badge className={getPriorityColor(recommendation.priority)} data-testid={`badge-priority-${recommendation.id}`}>
                          {recommendation.priority}
                        </Badge>
                        <span className="text-sm text-accent font-medium" data-testid={`text-schedule-${recommendation.id}`}>
                          {isToday ? `Today ${timeString}` : recommendedDate.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1" data-testid={`text-reasoning-${recommendation.id}`}>
                      {recommendation.reasoning}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center space-x-1">
                        <Droplets className="h-3 w-3" />
                        <span data-testid={`text-water-amount-${recommendation.id}`}>
                          {Math.round(parseFloat(recommendation.waterAmount)).toLocaleString()} gal
                        </span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span data-testid={`text-duration-${recommendation.id}`}>
                          {Math.round(recommendation.duration / 60 * 10) / 10} hrs
                        </span>
                      </span>
                    </div>
                    {recommendation.status === 'pending' && (
                      <div className="mt-3">
                        <Button 
                          size="sm"
                          onClick={() => scheduleIrrigationMutation.mutate(recommendation.id)}
                          disabled={scheduleIrrigationMutation.isPending}
                          data-testid={`button-schedule-${recommendation.id}`}
                        >
                          {scheduleIrrigationMutation.isPending ? "Scheduling..." : "Schedule Irrigation"}
                        </Button>
                      </div>
                    )}
                    {recommendation.status === 'scheduled' && (
                      <div className="mt-3">
                        <Badge variant="outline" className="text-green-600 border-green-600" data-testid={`badge-scheduled-${recommendation.id}`}>
                          Scheduled
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
