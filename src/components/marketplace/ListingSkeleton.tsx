import { Skeleton } from "@/components/ui/skeleton";

export default function ListingSkeleton() {
    return (
        <div>
            <Skeleton className="aspect-square w-full rounded-lg bg-[#e4e6eb]" />

            <div className="space-y-2 py-3">
                <Skeleton className="h-5 w-20 bg-[#e4e6eb]" />
                <Skeleton className="h-4 w-4/5 bg-[#e4e6eb]" />
                <Skeleton className="h-3 w-3/5 bg-[#e4e6eb]" />
            </div>
        </div>
    );
}