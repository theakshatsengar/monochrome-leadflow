import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface LeadFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  quickTab: 'all' | 'needs-email' | 'email-sent' | 'followup-sent' | 'followup-due' | 'reply-received' | 'closed';
  onQuickTabChange: (tab: 'all' | 'needs-email' | 'email-sent' | 'followup-sent' | 'followup-due' | 'reply-received' | 'closed') => void;
}

export function LeadFilters({
  searchQuery,
  onSearchChange,
  quickTab,
  onQuickTabChange,
}: LeadFiltersProps) {
  const hasSearch = !!searchQuery;

  const clearSearch = () => onSearchChange("");

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
          <Button variant={quickTab === 'all' ? 'default' : 'ghost'} size="sm" onClick={() => onQuickTabChange('all')}>All Leads</Button>
          <Button variant={quickTab === 'needs-email' ? 'default' : 'ghost'} size="sm" onClick={() => onQuickTabChange('needs-email')}>Needs Email Sent</Button>
          <Button variant={quickTab === 'email-sent' ? 'default' : 'ghost'} size="sm" onClick={() => onQuickTabChange('email-sent')}>Email Sent</Button>
          <Button variant={quickTab === 'followup-sent' ? 'default' : 'ghost'} size="sm" onClick={() => onQuickTabChange('followup-sent')}>Follow-up Sent</Button>
          <Button variant={quickTab === 'followup-due' ? 'default' : 'ghost'} size="sm" onClick={() => onQuickTabChange('followup-due')}>Follow-up Due</Button>
          <Button variant={quickTab === 'reply-received' ? 'default' : 'ghost'} size="sm" onClick={() => onQuickTabChange('reply-received')}>Reply Received</Button>
          <Button variant={quickTab === 'closed' ? 'default' : 'ghost'} size="sm" onClick={() => onQuickTabChange('closed')}>Converted / Closed</Button>

          {hasSearch && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearSearch}
              className="border-border text-foreground hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}