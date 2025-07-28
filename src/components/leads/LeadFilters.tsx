import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, X } from "lucide-react";
import { LEAD_STATUSES, INTERNS, LeadStatus } from "@/types/lead";

interface LeadFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: LeadStatus | "all";
  onStatusFilterChange: (status: LeadStatus | "all") => void;
  internFilter: string | "all";
  onInternFilterChange: (intern: string | "all") => void;
  dateFilter: string;
  onDateFilterChange: (period: string) => void;
}

export function LeadFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  internFilter,
  onInternFilterChange,
  dateFilter,
  onDateFilterChange,
}: LeadFiltersProps) {
  const hasActiveFilters = statusFilter !== "all" || internFilter !== "all" || dateFilter !== "all";

  const clearFilters = () => {
    onStatusFilterChange("all");
    onInternFilterChange("all");
    onDateFilterChange("all");
    onSearchChange("");
  };

  return (
    <div className="space-y-4 bg-card border border-border rounded-lg p-4">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by company or contact name..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-background border-border text-foreground"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-[140px] bg-background border-border text-foreground">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-background border border-border">
              <SelectItem value="all" className="text-foreground hover:bg-muted">All Statuses</SelectItem>
              {LEAD_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value} className="text-foreground hover:bg-muted">
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={internFilter} onValueChange={onInternFilterChange}>
            <SelectTrigger className="w-[140px] bg-background border-border text-foreground">
              <SelectValue placeholder="Intern" />
            </SelectTrigger>
            <SelectContent className="bg-background border border-border">
              <SelectItem value="all" className="text-foreground hover:bg-muted">All Interns</SelectItem>
              {INTERNS.map((intern) => (
                <SelectItem key={intern} value={intern} className="text-foreground hover:bg-muted">
                  {intern}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={dateFilter} onValueChange={onDateFilterChange}>
            <SelectTrigger className="w-[140px] bg-background border-border text-foreground">
              <SelectValue placeholder="Date" />
            </SelectTrigger>
            <SelectContent className="bg-background border border-border">
              <SelectItem value="all" className="text-foreground hover:bg-muted">All Time</SelectItem>
              <SelectItem value="7" className="text-foreground hover:bg-muted">Last 7 Days</SelectItem>
              <SelectItem value="30" className="text-foreground hover:bg-muted">Last 30 Days</SelectItem>
              <SelectItem value="90" className="text-foreground hover:bg-muted">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="border-border text-foreground hover:bg-muted"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}