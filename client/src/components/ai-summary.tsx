import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Brain, RefreshCw, User, Building } from "lucide-react";
import { parseMarkdownBold } from "@/lib/markdown-utils";

interface AISummaryProps {
  farmerId: string;
  summaryType: "farmer" | "government";
  title: string;
}

export default function AISummary({ farmerId, summaryType, title }: AISummaryProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: summary, isLoading, refetch } = useQuery<{ summary: string }>({
    queryKey: ["/api/farmers", farmerId, "ai-summary", summaryType],
    enabled: !!farmerId,
    retry: false,
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const getSummaryIcon = () => {
    return summaryType === "farmer" ? 
      <User className="h-5 w-5 text-blue-600 dark:text-blue-400" /> : 
      <Building className="h-5 w-5 text-green-600 dark:text-green-400" />;
  };

  const getCardStyle = () => {
    return summaryType === "farmer" ? 
      "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20" : 
      "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20";
  };

  return (
    <Card className={`${getCardStyle()}`} data-testid={`card-ai-summary-${summaryType}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Brain className="h-5 w-5" />
          {getSummaryIcon()}
          {title}
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading || isRefreshing}
          data-testid={`button-refresh-${summaryType}`}
        >
          <RefreshCw className={`h-4 w-4 ${(isLoading || isRefreshing) ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent className="pt-2 pb-4">
        {isLoading ? (
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        ) : summary?.summary ? (
          <div 
            className="text-base leading-relaxed text-gray-700 dark:text-gray-300"
            data-testid={`text-summary-${summaryType}`}
          >
            {summary.summary.split('\n').map((line, lineIndex) => (
              <div key={lineIndex} className="mb-1">
                {parseMarkdownBold(line).map((part, partIndex) => 
                  part.isBold ? (
                    <strong key={partIndex} className="font-semibold">
                      {part.text}
                    </strong>
                  ) : (
                    part.text
                  )
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-base text-gray-500 dark:text-gray-400 italic">
            Unable to generate summary. Please check your connection and try again.
          </div>
        )}
      </CardContent>
    </Card>
  );
}