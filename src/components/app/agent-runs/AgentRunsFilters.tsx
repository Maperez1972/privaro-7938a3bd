import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type AgentRunFilters = {
  status: string;
  pipeline: string;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
};

const EMPTY_FILTERS: AgentRunFilters = {
  status: "all",
  pipeline: "all",
  dateFrom: undefined,
  dateTo: undefined,
};

interface Props {
  filters: AgentRunFilters;
  onChange: (f: AgentRunFilters) => void;
  pipelines: string[];
}

export { EMPTY_FILTERS };

export default function AgentRunsFilters({ filters, onChange, pipelines }: Props) {
  const hasFilters =
    filters.status !== "all" ||
    filters.pipeline !== "all" ||
    filters.dateFrom !== undefined ||
    filters.dateTo !== undefined;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Filter className="w-4 h-4 text-muted-foreground" />

      {/* Status */}
      <Select
        value={filters.status}
        onValueChange={(v) => onChange({ ...filters, status: v })}
      >
        <SelectTrigger className="w-[140px] h-9 text-xs">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="running">Running</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="failed">Failed</SelectItem>
          <SelectItem value="aborted">Aborted</SelectItem>
        </SelectContent>
      </Select>

      {/* Pipeline */}
      <Select
        value={filters.pipeline}
        onValueChange={(v) => onChange({ ...filters, pipeline: v })}
      >
        <SelectTrigger className="w-[180px] h-9 text-xs">
          <SelectValue placeholder="Pipeline" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All pipelines</SelectItem>
          {pipelines.map((p) => (
            <SelectItem key={p} value={p}>
              {p}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Date From */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "h-9 w-[150px] justify-start text-left text-xs font-normal",
              !filters.dateFrom && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-3.5 w-3.5" />
            {filters.dateFrom ? format(filters.dateFrom, "dd/MM/yyyy") : "From"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={filters.dateFrom}
            onSelect={(d) => onChange({ ...filters, dateFrom: d })}
            initialFocus
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>

      {/* Date To */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "h-9 w-[150px] justify-start text-left text-xs font-normal",
              !filters.dateTo && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-3.5 w-3.5" />
            {filters.dateTo ? format(filters.dateTo, "dd/MM/yyyy") : "To"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={filters.dateTo}
            onSelect={(d) => onChange({ ...filters, dateTo: d })}
            initialFocus
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>

      {/* Clear */}
      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          className="h-9 text-xs text-muted-foreground"
          onClick={() => onChange(EMPTY_FILTERS)}
        >
          <X className="w-3.5 h-3.5 mr-1" /> Clear
        </Button>
      )}
    </div>
  );
}
