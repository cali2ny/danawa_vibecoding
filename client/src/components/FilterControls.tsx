import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { SlidersHorizontal } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import type { RadarFilters } from "@shared/schema";

interface FilterControlsProps {
  filters: RadarFilters;
  onChange: (filters: RadarFilters) => void;
}

export function FilterControls({ filters, onChange }: FilterControlsProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2" data-testid="button-filters">
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">필터</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">최소 판매량</Label>
              <span className="text-sm text-muted-foreground font-mono">
                {filters.minSales.toLocaleString()}대
              </span>
            </div>
            <Slider
              value={[filters.minSales]}
              onValueChange={([value]) =>
                onChange({ ...filters, minSales: value })
              }
              min={0}
              max={1000}
              step={50}
              className="w-full"
              data-testid="slider-min-sales"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0</span>
              <span>1,000</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <Label className="text-sm font-medium">신규 진입 제외</Label>
              <p className="text-xs text-muted-foreground">
                전월 판매량이 0인 모델 제외
              </p>
            </div>
            <Switch
              checked={filters.excludeNewEntries}
              onCheckedChange={(checked) =>
                onChange({ ...filters, excludeNewEntries: checked })
              }
              data-testid="switch-exclude-new"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
