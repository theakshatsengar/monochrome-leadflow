import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, List, Grid3X3 } from "lucide-react";
import { useLeadStore } from "@/store/leadStore";
import { Lead, LeadStatus } from "@/types/lead";
import { LeadFilters } from "@/components/leads/LeadFilters";
import { LeadTable } from "@/components/leads/LeadTable";
import { KanbanView } from "@/components/leads/KanbanView";
import { GalleryView } from "@/components/leads/GalleryView";
import { AddLeadDialog } from "@/components/leads/AddLeadDialog";

export default function Leads() {
  const { leads } = useLeadStore();
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<"table" | "kanban" | "gallery">("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const [internFilter, setInternFilter] = useState<string | "all">("all");
  const [dateFilter, setDateFilter] = useState<string>("all");

  // Handle status filter from URL params
  useEffect(() => {
    const statusParam = searchParams.get('status');
    if (statusParam && (statusParam === 'new' || statusParam === 'contacted' || statusParam === 'qualified' || statusParam === 'proposal' || statusParam === 'won' || statusParam === 'lost')) {
      setStatusFilter(statusParam as LeadStatus);
    }
  }, [searchParams]);

  const filteredLeads = useMemo(() => {
    let filtered = leads;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (lead) =>
          lead.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lead.contactPersonName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((lead) => lead.status === statusFilter);
    }

    // Intern filter
    if (internFilter !== "all") {
      filtered = filtered.filter((lead) => lead.assignedIntern === internFilter);
    }

    // Date filter
    if (dateFilter !== "all") {
      const days = parseInt(dateFilter);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      filtered = filtered.filter((lead) => lead.updatedAt >= cutoffDate);
    }

    return filtered;
  }, [leads, searchQuery, statusFilter, internFilter, dateFilter]);

  return (
    <div className="flex flex-col h-full max-w-full overflow-hidden">
      {/* Fixed header section */}
      <div className="flex-shrink-0 space-y-6 max-w-full">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Lead Management</h1>
            <p className="text-muted-foreground">
              Manage and track your outbound leads
            </p>
          </div>
          <AddLeadDialog />
        </div>

        <LeadFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          internFilter={internFilter}
          onInternFilterChange={setInternFilter}
          dateFilter={dateFilter}
          onDateFilterChange={setDateFilter}
        />

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {filteredLeads.length} of {leads.length} leads
          </div>
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "table" | "kanban" | "gallery")}>
            <TabsList className="bg-muted border border-border">
              <TabsTrigger value="table" className="data-[state=active]:bg-background">
                <Table className="h-4 w-4 mr-2" />
                Table
              </TabsTrigger>
              <TabsTrigger value="kanban" className="data-[state=active]:bg-background">
                <List className="h-4 w-4 mr-2" />
                Kanban
              </TabsTrigger>
              <TabsTrigger value="gallery" className="data-[state=active]:bg-background">
                <Grid3X3 className="h-4 w-4 mr-2" />
                Gallery
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Scrollable content area */}
      <div className="flex-1 min-h-0 mt-6 max-w-full overflow-hidden">
        {viewMode === "table" ? (
          <div className="overflow-auto h-full">
            <LeadTable leads={filteredLeads} />
          </div>
        ) : viewMode === "kanban" ? (
          <div className="h-full w-full max-w-full overflow-hidden bg-background border border-border rounded-lg">
            <div className="h-full w-full max-w-full overflow-x-auto overflow-y-hidden p-4 hide-scrollbar">
              <KanbanView leads={filteredLeads} />
            </div>
          </div>
        ) : (
          <div className="overflow-auto h-full">
            <GalleryView leads={filteredLeads} />
          </div>
        )}
      </div>
    </div>
  );
}