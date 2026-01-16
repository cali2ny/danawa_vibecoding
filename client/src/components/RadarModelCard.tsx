import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, TrendingUp, TrendingDown, Minus, Trophy, Medal, Award } from "lucide-react";
import type { RadarModel } from "@shared/schema";

interface RadarModelCardProps {
  model: RadarModel;
  index: number;
}

function formatNumber(n: number): string {
  return n.toLocaleString("ko-KR");
}

function formatPercent(n: number): string {
  if (!isFinite(n)) return "-";
  return `${n >= 0 ? "+" : ""}${(n * 100).toFixed(1)}%`;
}

function formatChange(n: number): string {
  if (n === 0) return "0";
  return `${n > 0 ? "+" : ""}${formatNumber(n)}`;
}

function getRankIcon(rank: number) {
  if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
  if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />;
  return null;
}

export function RadarModelCard({ model, index }: RadarModelCardProps) {
  const isRising = model.momAbs > 0;
  const isFalling = model.momAbs < 0;
  const rankUp = model.rankChange > 0;
  const rankDown = model.rankChange < 0;

  return (
    <Card
      className="p-4 hover-elevate transition-all duration-200"
      data-testid={`card-model-${index}`}
    >
      <div className="flex items-start gap-4">
        <div className="flex flex-col items-center gap-1 min-w-[48px]">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted font-bold text-lg" data-testid={`text-rank-${index}`}>
            {getRankIcon(model.rank) || model.rank}
          </div>
          {model.rankChange !== 0 && (
            <Badge
              variant="secondary"
              className={`text-xs px-1.5 ${
                rankUp
                  ? "bg-rising border-rising text-rising"
                  : rankDown
                  ? "bg-falling border-falling text-falling"
                  : ""
              }`}
              data-testid={`badge-rank-change-${index}`}
            >
              {rankUp ? "↑" : "↓"}
              {Math.abs(model.rankChange)}
            </Badge>
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground" data-testid={`text-brand-${index}`}>{model.brand}</p>
              <h3 className="font-semibold text-base truncate" title={model.modelName} data-testid={`text-model-name-${index}`}>
                {model.modelName}
              </h3>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="shrink-0"
              asChild
              data-testid={`button-original-${index}`}
            >
              <a href={model.originalUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold" data-testid={`text-sales-${index}`}>{formatNumber(model.sales)}</span>
              <span className="text-sm text-muted-foreground">대</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div
                className={`flex items-center gap-1 text-sm font-medium ${
                  isRising
                    ? "text-rising"
                    : isFalling
                    ? "text-falling"
                    : "text-muted-foreground"
                }`}
                data-testid={`text-mom-abs-${index}`}
              >
                {isRising ? (
                  <TrendingUp className="h-4 w-4" />
                ) : isFalling ? (
                  <TrendingDown className="h-4 w-4" />
                ) : (
                  <Minus className="h-4 w-4" />
                )}
                <span>{formatChange(model.momAbs)}</span>
              </div>

              <Badge
                variant="secondary"
                className={`text-xs ${
                  isRising
                    ? "bg-rising text-rising"
                    : isFalling
                    ? "bg-falling text-falling"
                    : ""
                }`}
                data-testid={`badge-mom-pct-${index}`}
              >
                {formatPercent(model.momPct)}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span data-testid={`text-prev-sales-${index}`}>전월: {formatNumber(model.prevSales)}대</span>
            {model.prevRank && (
              <span>•</span>
            )}
            {model.prevRank && (
              <span data-testid={`text-prev-rank-${index}`}>전월 순위: {model.prevRank}위</span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
