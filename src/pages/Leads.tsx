import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, List, Grid3X3 } from "lucide-react";
import { useLeadStore } from "@/store/leadStore";
import { useAuthStore } from "@/store/authStore";
import { Lead, LeadStatus } from "@/types/lead";
import { LeadFilters } from "@/components/leads/LeadFilters";
import { LeadTable } from "@/components/leads/LeadTable";
import { KanbanView } from "@/components/leads/KanbanView";
import { GalleryView } from "@/components/leads/GalleryView";
import { AddLeadDialog } from "@/components/leads/AddLeadDialog";
import { LeadService } from '@/services/leadService';

export default function Leads() {
  const { leads, fetchLeads, subscribeToLeads, isLoading, error } = useLeadStore();
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<"table" | "kanban" | "gallery">("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const [internFilter, setInternFilter] = useState<string | "all">("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [quickTab, setQuickTab] = useState<'all' | 'needs-email' | 'email-sent' | 'followup-sent' | 'followup-due' | 'reply-received' | 'closed' >('all')

  // Fetch leads on mount and set up real-time subscription
  useEffect(() => {
    if (user) {
      fetchLeads(user.id, user.role);
      
      // Set up real-time subscription
      const unsubscribe = subscribeToLeads(user.id, user.role);
      
      // Cleanup subscription on unmount
      return unsubscribe;
    }
  }, [user, fetchLeads, subscribeToLeads]);

  // Run auto-advance when the leads page mounts and then periodically (hourly)
  useEffect(() => {
    let intervalId: number | undefined;
    const runAutoAdvance = async () => {
      try {
        const res = await LeadService.autoAdvanceFollowups(user?.id);
        if (res && res.advanced && res.advanced.length > 0) {
          // Refresh leads after changes
          fetchLeads(user.id, user.role);
        }
      } catch (e) {
        console.error('Auto-advance failed', e);
      }
    }

    if (user) {
      runAutoAdvance();
      // Run hourly
      intervalId = setInterval(runAutoAdvance, 1000 * 60 * 60);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    }
  }, [user, fetchLeads]);

  // Handle status filter from URL params
  useEffect(() => {
    const statusParam = searchParams.get('status');
    if (statusParam && (statusParam === 'new' || statusParam === 'email-sent' || statusParam === 'followup-1' || statusParam === 'followup-2' || statusParam === 'replied' || statusParam === 'booked' || statusParam === 'converted')) {
      setStatusFilter(statusParam as LeadStatus);
    }
    const quickParam = searchParams.get('quick');
    if (quickParam && ['needs-email','email-sent','followup-sent','followup-due','reply-received','closed','all'].includes(quickParam)) {
      setQuickTab(quickParam as 'all' | 'needs-email' | 'email-sent' | 'followup-sent' | 'followup-due' | 'reply-received' | 'closed')
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

    // Quick tabs
    switch (quickTab) {
      case 'needs-email':
        filtered = filtered.filter(l => l.status === 'new');
        break;
      case 'email-sent':
        filtered = filtered.filter(l => l.status === 'email-sent');
        break;
      case 'followup-sent':
        filtered = filtered.filter(l => l.status === 'followup-1' || l.status === 'followup-2' || l.status === 'followup-3');
        break;
  case 'followup-due': {
        // Only show leads that are due for the next follow-up based on rules:
        // email-sent -> due after >=3 days
        // followup-1 -> due after >=4 days
        // followup-2 -> due after >=7 days
        const now = new Date();
        filtered = filtered.filter(l => {
          if (l.hasReplies) return false;
          const daysAgo = Math.floor((now.getTime() - l.updatedAt.getTime()) / (1000 * 60 * 60 * 24));
          if (l.status === 'email-sent' && daysAgo >= 3) return true;
          if (l.status === 'followup-1' && daysAgo >= 4) return true;
          if (l.status === 'followup-2' && daysAgo >= 7) return true;
          return false;
        });
        break;
      }
        case 'reply-received':
          filtered = filtered.filter(l => l.hasReplies || l.status === 'replied');
          break;
      case 'closed':
        filtered = filtered.filter(l => l.status === 'converted' || l.status === 'closed');
        break;
      case 'all':
      default:
        break;
    }

    return filtered;
  }, [leads, searchQuery, statusFilter, internFilter, dateFilter, quickTab]);

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
          <div className="flex items-center gap-2">
            <AddLeadDialog />
          </div>
        </div>

        <LeadFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          quickTab={quickTab}
          onQuickTabChange={(tab) => setQuickTab(tab)}
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