import { useState } from "react";
import { Lead } from "@/types/lead";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mail, Linkedin, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { useLeadStore } from "@/store/leadStore";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface GalleryViewProps {
  leads: Lead[];
}

const getStatusVariant = (status: string): "secondary" | "outline" | "default" | "destructive" => {
  const variants: Record<string, "secondary" | "outline" | "default" | "destructive"> = {
    'new': 'secondary',
    'email-sent': 'outline',
    'followup-1': 'secondary',
    'followup-2': 'outline',
    'replied': 'default',
    'booked': 'secondary',
    'converted': 'default'
  };
  return variants[status] || 'secondary';
};

export function GalleryView({ leads }: GalleryViewProps) {
  const { deleteLead } = useLeadStore();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleDelete = (leadId: string) => {
    deleteLead(leadId);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {leads.map((lead) => (
        <Card 
          key={lead.id} 
          className="relative transition-all duration-200 hover:shadow-md border-border bg-card"
          onMouseEnter={() => setHoveredCard(lead.id)}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-foreground line-clamp-1">
                {lead.companyName}
              </h3>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`h-8 w-8 p-0 transition-opacity ${
                      hoveredCard === lead.id ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleDelete(lead.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Badge 
              variant={getStatusVariant(lead.status)}
              className="w-fit"
            >
              {lead.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Badge>
          </CardHeader>
          
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">
                {lead.contactPersonName}
              </p>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-3 w-3" />
                <span className="truncate">{lead.contactEmail}</span>
              </div>
              
              {lead.linkedinProfile && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Linkedin className="h-3 w-3" />
                  <span className="truncate">LinkedIn</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                    {getInitials(lead.assignedIntern)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">
                  {lead.assignedIntern.split(' ')[0]}
                </span>
              </div>
              
              <div className="text-xs text-muted-foreground">
                {formatDistanceToNow(lead.updatedAt, { addSuffix: true })}
              </div>
            </div>
            
            {lead.followupsSent > 0 && (
              <div className="text-xs text-muted-foreground">
                {lead.followupsSent} follow-up{lead.followupsSent > 1 ? 's' : ''} sent
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}