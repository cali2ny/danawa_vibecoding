import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Gauge, RefreshCw } from "lucide-react";
import { MonthSelector } from "@/components/MonthSelector";
import { NationToggle } from "@/components/NationToggle";
import { FilterControls } from "@/components/FilterControls";
import { RadarModelCard } from "@/components/RadarModelCard";
import { LoadingCardList } from "@/components/LoadingCard";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Nation, RadarData, RadarFilters } from "@shared/schema";

function generateAvailableMonths(): string[] {
  const months: string[] = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i - 1, 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    months.push(`${year}-${month}`);
  }
  return months;
}

export default function Dashboard() {
  const availableMonths = useMemo(() => generateAvailableMonths(), []);
  const [month, setMonth] = useState(availableMonths[0]);
  const [nation, setNation] = useState<Nation>("domestic");
  const [filters, setFilters] = useState<RadarFilters>({
    minSales: 300,
    excludeNewEntries: false,
  });

  const {
    data,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery<RadarData>({
    queryKey: ["/api/radar", month, nation],
    queryFn: async () => {
      const res = await fetch(`/api/radar?month=${month}&nation=${nation}`);
      if (!res.ok) throw new Error("Failed to fetch radar data");
      return res.json();
    },
  });

  const filteredModels = useMemo(() => {
    if (!data?.models) return [];
    return data.models.filter((m) => {
      if (m.sales < filters.minSales) return false;
      if (filters.excludeNewEntries && m.prevSales === 0) return false;
      return true;
    });
  }, [data?.models, filters]);

  const risingModels = useMemo(() => {
    return filteredModels
      .filter((m) => m.momAbs > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);
  }, [filteredModels]);

  const statsInfo = useMemo(() => {
    if (!data?.models) return null;
    const rising = data.models.filter((m) => m.momAbs > 0).length;
    const falling = data.models.filter((m) => m.momAbs < 0).length;
    const total = data.models.length;
    return { rising, falling, total };
  }, [data?.models]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground">
                <Gauge className="h-5 w-5" />
              </div>
              <div>
                <h1 className="font-bold text-lg leading-tight">
                  차량 판매 레이더
                </h1>
                <p className="text-xs text-muted-foreground">
                  급상승 모델 분석
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <MonthSelector
                value={month}
                onChange={setMonth}
                availableMonths={availableMonths}
              />
              <NationToggle value={nation} onChange={setNation} />
              <FilterControls filters={filters} onChange={setFilters} />
              <Button
                size="icon"
                variant="ghost"
                onClick={() => refetch()}
                disabled={isFetching}
                data-testid="button-refresh"
              >
                <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {statsInfo && (
          <div className="flex items-center gap-4 mb-6 flex-wrap" data-testid="stats-summary">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-rising" />
              <span className="font-semibold text-lg" data-testid="text-section-title">급상승 모델 Top 20</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs" data-testid="badge-total-count">
                전체 <span data-testid="text-total-count">{statsInfo.total}</span>개 모델
              </Badge>
              <Badge variant="secondary" className="bg-rising text-rising text-xs" data-testid="badge-rising-count">
                상승 <span data-testid="text-rising-count">{statsInfo.rising}</span>
              </Badge>
              <Badge variant="secondary" className="bg-falling text-falling text-xs" data-testid="badge-falling-count">
                하락 <span data-testid="text-falling-count">{statsInfo.falling}</span>
              </Badge>
            </div>
            {data?.fetchedAt && (
              <span className="text-xs text-muted-foreground ml-auto" data-testid="text-updated-at">
                업데이트: {new Date(data.fetchedAt).toLocaleString("ko-KR")}
              </span>
            )}
          </div>
        )}

        {isLoading ? (
          <LoadingCardList count={8} />
        ) : isError ? (
          <ErrorState
            description="데이터를 불러오는 중 오류가 발생했습니다. 다시 시도해 주세요."
            onRetry={() => refetch()}
          />
        ) : risingModels.length === 0 ? (
          <EmptyState
            title="급상승 모델 없음"
            description="현재 필터 조건에 맞는 급상승 모델이 없습니다. 필터를 조정해 보세요."
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {risingModels.map((model, index) => (
              <RadarModelCard key={`${model.modelName}-${model.brand}`} model={model} index={index} />
            ))}
          </div>
        )}
      </main>

      <footer className="border-t py-6 mt-8">
        <div className="container mx-auto px-4">
          <p className="text-xs text-muted-foreground text-center">
            데이터 출처: 다나와 자동차 (KAMA/KAIDA 기반) • 
            판매실적 데이터의 무단복제 및 가공을 금함
          </p>
        </div>
      </footer>
    </div>
  );
}
