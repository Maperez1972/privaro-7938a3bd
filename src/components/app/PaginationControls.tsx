import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE_OPTIONS = [5, 10, 25, 50];

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export const PaginationControls = ({ page, totalPages, totalItems, pageSize, onPageChange, onPageSizeChange }: PaginationControlsProps) => {
  if (totalItems <= Math.min(...PAGE_SIZE_OPTIONS) && !onPageSizeChange) return null;
  if (totalItems === 0) return null;

  return (
    <div className="flex items-center justify-between pt-3">
      <div className="flex items-center gap-3">
        <p className="text-xs text-muted-foreground">
          Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, totalItems)} of {totalItems}
        </p>
        {onPageSizeChange && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Rows:</span>
            <Select value={String(pageSize)} onValueChange={(v) => { onPageSizeChange(Number(v)); onPageChange(0); }}>
              <SelectTrigger className="h-7 w-[62px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((s) => (
                  <SelectItem key={s} value={String(s)}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
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
