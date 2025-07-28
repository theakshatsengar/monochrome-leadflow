import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, List } from "lucide-react";
import { useLeadStore } from "@/store/leadStore";
import { Lead, LeadStatus } from "@/types/lead";
import { LeadFilters } from "@/components/leads/LeadFilters";
import { LeadTable } from "@/components/leads/LeadTable";
import { KanbanView } from "@/components/leads/KanbanView";
import { AddLeadDialog } from "@/components/leads/AddLeadDialog";

export default function Leads() {
  const { leads } = useLeadStore();
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const [internFilter, setInternFilter] = useState<string | "all">("all");
  const [dateFilter, setDateFilter] = useState<string>("all");

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
    <div className="space-y-6">
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
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "table" | "kanban")}>
          <TabsList className="bg-muted border border-border">
            <TabsTrigger value="table" className="data-[state=active]:bg-background">
              <Table className="h-4 w-4 mr-2" />
              Table
            </TabsTrigger>
            <TabsTrigger value="kanban" className="data-[state=active]:bg-background">
              <List className="h-4 w-4 mr-2" />
              Kanban
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {viewMode === "table" ? (
        <LeadTable leads={filteredLeads} />
      ) : (
        <KanbanView leads={filteredLeads} />
      )}
    </div>
  );
}