import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, ExternalLink, Edit, Trash2, Mail, CheckCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Lead, LeadStatus, LEAD_STATUSES } from "@/types/lead";
import { useLeadStore } from "@/store/leadStore";
import { format } from "date-fns";

interface LeadTableProps {
  leads: Lead[];
}

const getStatusColor = (status: LeadStatus) => {
  const colors = {
    new: "bg-gray-200 text-gray-800",
    "email-sent": "bg-gray-400 text-gray-100",
    "followup-1": "bg-gray-300 text-gray-800",
    "followup-2": "bg-gray-500 text-gray-100",
    replied: "bg-gray-700 text-gray-100",
    booked: "bg-gray-600 text-gray-100",
    converted: "bg-gray-900 text-gray-100",
  };
  return colors[status];
};

export function LeadTable({ leads }: LeadTableProps) {
  const { updateLeadStatus, deleteLead } = useLeadStore();
  const [editingStatus, setEditingStatus] = useState<string | null>(null);

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    try {
      await updateLeadStatus(leadId, newStatus);
      setEditingStatus(null);
    } catch (error) {
      console.error('Error updating lead status:', error);
    }
  };

  const handleDelete = async (leadId: string) => {
    if (confirm("Are you sure you want to delete this lead?")) {
      try {
        await deleteLead(leadId);
      } catch (error) {
        console.error('Error deleting lead:', error);
      }
    }
  };

  return (
    <div className="border border-border rounded-lg bg-card">
      <Table>
        <TableHeader>
          <TableRow className="border-border">
            <TableHead className="text-foreground font-medium">Company</TableHead>
            <TableHead className="text-foreground font-medium">Contact</TableHead>
            <TableHead className="text-foreground font-medium">Email</TableHead>
            <TableHead className="text-foreground font-medium">Intern</TableHead>
            <TableHead className="text-foreground font-medium">Status</TableHead>
            <TableHead className="text-foreground font-medium">Last Updated</TableHead>
            <TableHead className="text-foreground font-medium">Stats</TableHead>
            <TableHead className="text-foreground font-medium w-[50px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id} className="border-border">
              <TableCell className="font-medium text-foreground">
                <div>
                  <div className="font-medium">{lead.companyName}</div>
                  {lead.website && (
                    <a
                      href={lead.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Website
                    </a>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-foreground">
                <div>
                  <div className="font-medium">{lead.contactPersonName}</div>
                  {lead.linkedinProfile && (
                    <a
                      href={lead.linkedinProfile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      LinkedIn
                    </a>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-foreground">{lead.contactEmail}</TableCell>
              <TableCell className="text-foreground">{lead.assignedIntern}</TableCell>
              <TableCell>
                {editingStatus === lead.id ? (
                  <Select
                    value={lead.status}
                    onValueChange={(value) => handleStatusChange(lead.id, value as LeadStatus)}
                    onOpenChange={(open) => !open && setEditingStatus(null)}
                  >
                    <SelectTrigger className="w-[120px] bg-background border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border border-border">
                      {LEAD_STATUSES.map((status) => (
                        <SelectItem key={status.value} value={status.value} className="text-foreground hover:bg-muted">
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge
                    className={`cursor-pointer ${getStatusColor(lead.status)}`}
                    onClick={() => setEditingStatus(lead.id)}
                  >
                    {LEAD_STATUSES.find(s => s.value === lead.status)?.label}
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {format(lead.updatedAt, "MMM dd, yyyy")}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    {lead.followupsSent}
                  </div>
                  {lead.hasReplies && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <CheckCircle className="h-3 w-3" />
                      Reply
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-background border border-border">
                    <DropdownMenuLabel className="text-foreground">Actions</DropdownMenuLabel>
                    <DropdownMenuItem className="text-foreground hover:bg-muted">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem 
                      className="text-destructive hover:bg-muted"
                      onClick={() => handleDelete(lead.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}