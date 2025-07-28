import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCorners } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Mail, CheckCircle, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Lead, LeadStatus, LEAD_STATUSES } from "@/types/lead";
import { useLeadStore } from "@/store/leadStore";
import { format } from "date-fns";

interface KanbanViewProps {
  leads: Lead[];
}

interface KanbanCardProps {
  lead: Lead;
}

function KanbanCard({ lead }: KanbanCardProps) {
  const { deleteLead } = useLeadStore();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this lead?")) {
      deleteLead(lead.id);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`${isDragging ? "opacity-50" : ""}`}
    >
      <Card className="mb-3 bg-card border border-border cursor-move hover:shadow-sm transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="text-sm font-medium text-foreground">
              {lead.companyName}
            </CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-background border border-border">
                <DropdownMenuItem 
                  className="text-destructive hover:bg-muted"
                  onClick={handleDelete}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <div className="text-sm text-foreground font-medium">
              {lead.contactPersonName}
            </div>
            <div className="text-xs text-muted-foreground">
              {lead.contactEmail}
            </div>
            <div className="text-xs text-muted-foreground">
              {lead.assignedIntern}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  {lead.followupsSent}
                </div>
                {lead.hasReplies && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <CheckCircle className="h-3 w-3" />
                  </div>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {format(lead.updatedAt, "MMM dd")}
              </div>
            </div>
            {(lead.website || lead.linkedinProfile) && (
              <div className="flex gap-2">
                {lead.website && (
                  <a
                    href={lead.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="h-3 w-3" />
                    Site
                  </a>
                )}
                {lead.linkedinProfile && (
                  <a
                    href={lead.linkedinProfile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="h-3 w-3" />
                    LinkedIn
                  </a>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface KanbanColumnProps {
  status: LeadStatus;
  title: string;
  leads: Lead[];
}

function KanbanColumn({ status, title, leads }: KanbanColumnProps) {
  return (
    <div className="flex flex-col bg-muted/50 rounded-lg p-3 min-h-[500px] w-80">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-foreground">{title}</h3>
        <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
          {leads.length}
        </Badge>
      </div>
      <SortableContext items={leads.map(lead => lead.id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1">
          {leads.map((lead) => (
            <KanbanCard key={lead.id} lead={lead} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

export function KanbanView({ leads }: KanbanViewProps) {
  const { updateLeadStatus } = useLeadStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);

  const statusGroups = LEAD_STATUSES.reduce((acc, status) => {
    acc[status.value] = leads.filter(lead => lead.status === status.value);
    return acc;
  }, {} as Record<LeadStatus, Lead[]>);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    const lead = leads.find(l => l.id === active.id);
    setDraggedLead(lead || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      setDraggedLead(null);
      return;
    }

    const leadId = active.id as string;
    const newStatus = over.id as LeadStatus;

    if (LEAD_STATUSES.some(s => s.value === newStatus)) {
      updateLeadStatus(leadId, newStatus);
    }

    setActiveId(null);
    setDraggedLead(null);
  };

  return (
    <DndContext
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {LEAD_STATUSES.map((status) => (
          <div key={status.value} id={status.value}>
            <KanbanColumn
              status={status.value}
              title={status.label}
              leads={statusGroups[status.value] || []}
            />
          </div>
        ))}
      </div>
      
      <DragOverlay>
        {activeId && draggedLead ? (
          <div className="rotate-2">
            <KanbanCard lead={draggedLead} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}