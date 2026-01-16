import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function LoadingCard() {
  return (
    <Card className="p-4">
      <div className="flex items-start gap-4">
        <div className="flex flex-col items-center gap-1 min-w-[48px]">
          <Skeleton className="w-10 h-10 rounded-full" />
        </div>

        <div className="flex-1 space-y-3">
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-5 w-36" />
          </div>

          <div className="flex items-center gap-3">
            <Skeleton className="h-7 w-20" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-14" />
          </div>

          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    </Card>
  );
}

export function LoadingCardList({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <LoadingCard key={i} />
      ))}
    </div>
  );
}
