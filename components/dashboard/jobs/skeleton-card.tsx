import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function JobCardSkeleton() {
  return (
    <Card className="overflow-hidden border border-border/50 bg-card/40 backdrop-blur-sm">
      <CardContent className="p-6 space-y-4">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
          </div>
          <Skeleton className="h-8 w-16 rounded-full" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-5 w-20 rounded-md" />
          <Skeleton className="h-5 w-24 rounded-md" />
          <Skeleton className="h-5 w-16 rounded-md" />
        </div>
        <div className="flex gap-1.5 pt-2">
          <Skeleton className="h-6 w-14 rounded-md" />
          <Skeleton className="h-6 w-16 rounded-md" />
          <Skeleton className="h-6 w-12 rounded-md" />
        </div>
        <div className="pt-4 border-t border-border/40 flex justify-between items-center">
          <Skeleton className="h-4 w-28" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-24 rounded-md" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
