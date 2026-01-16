import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";

interface MonthSelectorProps {
  value: string;
  onChange: (month: string) => void;
  availableMonths: string[];
}

function formatMonth(month: string): string {
  const [year, m] = month.split("-");
  const monthNames = [
    "1월", "2월", "3월", "4월", "5월", "6월",
    "7월", "8월", "9월", "10월", "11월", "12월"
  ];
  return `${year}년 ${monthNames[parseInt(m, 10) - 1]}`;
}

export function MonthSelector({ value, onChange, availableMonths }: MonthSelectorProps) {
  const [open, setOpen] = useState(false);
  const currentIndex = availableMonths.indexOf(value);
  
  const goToPrev = () => {
    if (currentIndex < availableMonths.length - 1) {
      onChange(availableMonths[currentIndex + 1]);
    }
  };
  
  const goToNext = () => {
    if (currentIndex > 0) {
      onChange(availableMonths[currentIndex - 1]);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        size="icon"
        variant="ghost"
        onClick={goToPrev}
        disabled={currentIndex >= availableMonths.length - 1}
        data-testid="button-month-prev"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="min-w-[140px] gap-2 font-medium"
            data-testid="button-month-selector"
          >
            <Calendar className="h-4 w-4" />
            {formatMonth(value)}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-2" align="center">
          <div className="grid grid-cols-2 gap-1 max-h-[280px] overflow-y-auto">
            {availableMonths.map((month) => (
              <Button
                key={month}
                variant={month === value ? "default" : "ghost"}
                size="sm"
                className="justify-start text-sm"
                onClick={() => {
                  onChange(month);
                  setOpen(false);
                }}
                data-testid={`button-month-${month}`}
              >
                {formatMonth(month)}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      
      <Button
        size="icon"
        variant="ghost"
        onClick={goToNext}
        disabled={currentIndex <= 0}
        data-testid="button-month-next"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
