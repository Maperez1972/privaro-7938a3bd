import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export const PaginationControls = ({ page, totalPages, totalItems, pageSize, onPageChange }: PaginationControlsProps) => {
  if (totalItems <= pageSize) return null;
  return (
    <div className="flex items-center justify-between pt-3">
      <p className="text-xs text-muted-foreground">
        Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, totalItems)} of {totalItems}
      </p>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" disabled={page === 0} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="text-sm flex items-center px-2">
          {page + 1} / {totalPages}
        </span>
        <Button size="sm" variant="outline" disabled={page >= totalPages - 1} onClick={() => onPageChange(page + 1)}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export const paginate = <T,>(items: T[], page: number, pageSize: number) => ({
  paged: items.slice(page * pageSize, (page + 1) * pageSize),
  totalPages: Math.max(1, Math.ceil(items.length / pageSize)),
});
