import { Button } from "@/components/ui/button";
import type { Nation } from "@shared/schema";
import { Car, Globe } from "lucide-react";

interface NationToggleProps {
  value: Nation;
  onChange: (nation: Nation) => void;
}

export function NationToggle({ value, onChange }: NationToggleProps) {
  return (
    <div className="flex items-center rounded-md border bg-card p-1 gap-1">
      <Button
        size="sm"
        variant={value === "domestic" ? "default" : "ghost"}
        className="gap-2"
        onClick={() => onChange("domestic")}
        data-testid="button-nation-domestic"
      >
        <Car className="h-4 w-4" />
        <span className="hidden sm:inline">국산</span>
      </Button>
      <Button
        size="sm"
        variant={value === "export" ? "default" : "ghost"}
        className="gap-2"
        onClick={() => onChange("export")}
        data-testid="button-nation-export"
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">수입</span>
      </Button>
    </div>
  );
}
