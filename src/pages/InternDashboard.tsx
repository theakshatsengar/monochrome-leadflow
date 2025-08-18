import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  CheckCircle, 
  Mail, 
  Clock, 
  MessageSquare, 
  BarChart3,
  Users,
  Send,
  Phone,
  Target,
  AlertCircle
} from 'lucide-react';
import { useLeadStore } from '@/store/leadStore';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { LEAD_STATUSES, INTERNS, LeadStatus } from "@/types/lead";
import { toast } from "@/hooks/use-toast";
import { DailyTasksSection } from '@/components/DailyTasksSection';
import { useDailyTasksStore } from '@/store/dailyTasksStore';

export function InternDashboard() {
  const navigate = useNavigate();
  const { leads, addLead, fetchLeads, subscribeToLeads, isLoading, error } = useLeadStore();
  const { user } = useAuthStore();
  const { tasks } = useDailyTasksStore();
  const [addLeadOpen, setAddLeadOpen] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    website: "",
    contactPersonName: "",
    contactEmail: "",
    linkedinProfile: "",
    status: "new" as LeadStatus,
  });
  
  // Fetch data on mount and set up real-time subscription
  useEffect(() => {
    if (user) {
      fetchLeads(user.id, user.role);
      
      // Set up real-time subscription
      const unsubscribe = subscribeToLeads(user.id, user.role);
      
      // Cleanup subscription on unmount
      return unsubscribe;
    }
  }, [user, fetchLeads, subscribeToLeads]);
  
  // Calculate action card metrics
  const leadsToEmail = leads.filter(lead => lead.status === 'new').length;
  const followupsDue = leads.filter(lead => 
    ['followup-1', 'followup-2'].includes(lead.status)
  ).length;
  const repliedNotBooked = leads.filter(lead => 
    lead.status === 'replied' || (lead.hasReplies && lead.status !== 'booked')
  ).length;

  // Calculate realtime stats for today based on actual data
  const getTodayStats = () => {
    if (!user) return { leadsAdded: 0, emailsSent: 0, replies: 0, callsBooked: 0 };
    
    const today = new Date().toDateString();
    
    // Get leads added today (filter by created_at if available, otherwise use current count)
    const todayLeads = leads.filter(lead => {
      if (lead.created_at) {
        return new Date(lead.created_at).toDateString() === today;
      }
      return false;
    });

    // Get task progress from daily tasks store for current user
    const userTasks = tasks.filter(task => task.userId === user.id);
    const submitLeadsTask = userTasks.find(task => task.id === 'submit-leads');
    const sendEmailsTask = userTasks.find(task => task.id === 'send-emails');
    const followUpTask = userTasks.find(task => task.id === 'follow-up');
    
    // Calculate calls booked today
    const callsBooked = leads.filter(lead => {
      if (lead.status === 'booked' && lead.updated_at) {
        return new Date(lead.updated_at).toDateString() === today;
      }
      return false;
    }).length;

    return {
      leadsAdded: submitLeadsTask?.currentCount || todayLeads.length,
      emailsSent: sendEmailsTask?.currentCount || 0,
      replies: leads.filter(lead => lead.status === 'replied' && lead.updated_at && 
        new Date(lead.updated_at).toDateString() === today).length,
      callsBooked: callsBooked
    };
  };

  const todayStats = getTodayStats();

  // Handle navigation to leads page with status filter
  const handleSendEmailsClick = () => {
    if (!user) return;
    // Track email sending activity
    const { incrementTaskProgress } = useDailyTasksStore.getState();
    incrementTaskProgress('send-emails', user.id);
  navigate('/leads?quick=needs-email');
  };

  // Track follow-up activity
  const handleFollowUpClick = () => {
    if (!user) return;
    const { incrementTaskProgress } = useDailyTasksStore.getState();
    incrementTaskProgress('follow-up', user.id);
  navigate('/leads?quick=followup-due');
  };

  // Handle form submission for add lead
  const handleAddLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.companyName || !formData.contactPersonName || !formData.contactEmail) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to add leads.",
        variant: "destructive",
      });
      return;
    }

    try {
      await addLead({
        ...formData,
        linkedinProfile: formData.linkedinProfile || undefined,
      }, user.id);

      toast({
        title: "Lead added successfully",
        description: `${formData.companyName} has been added to your leads.`,
      });

      setFormData({
        companyName: "",
        website: "",
        contactPersonName: "",
        contactEmail: "",
        linkedinProfile: "",
        status: "new",
      });
      setAddLeadOpen(false);
    } catch (error) {
      toast({
        title: "Error adding lead",
        description: error instanceof Error ? error.message : "Failed to add lead",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold">Intern Dashboard</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Daily Tasks - Left Column */}
        <div className="lg:col-span-1">
          {user && <DailyTasksSection userId={user.id} />}
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Add Lead CTA removed from standalone position; placed inside the action cards below for consistent widths */}

          {/* Action Cards Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Action Cards Column */}
            <div className="space-y-3">
              {/* Add Lead - placed here so it shares the same width/column as other action cards */}
              <Card className="border-none shadow-sm cursor-pointer hover:bg-accent/30 transition-colors" onClick={() => setAddLeadOpen(true)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Add Lead</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Leads Needing Email */}
              <Card className="border-none shadow-sm cursor-pointer hover:bg-accent/30 transition-colors" onClick={handleSendEmailsClick}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">To Email</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {leadsToEmail}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Follow-ups Due */}
              <Card className="border-none shadow-sm cursor-pointer hover:bg-accent/30 transition-colors" onClick={handleFollowUpClick}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Follow-ups</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {followupsDue}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Replies Without Call */}
              <Card className="border-none shadow-sm cursor-pointer hover:bg-accent/30 transition-colors" onClick={() => navigate('/leads?quick=reply-received')}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Replied</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {repliedNotBooked}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Stats Summary Column */}
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Today's Performance</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center justify-between p-2 bg-accent/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 text-blue-600" />
                      <span className="text-xs font-medium">Leads Added</span>
                    </div>
                    <Badge variant="default" className="text-xs bg-blue-100 text-blue-800 hover:bg-blue-100">
                      {todayStats.leadsAdded}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-accent/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Send className="h-3.5 w-3.5 text-green-600" />
                      <span className="text-xs font-medium">Emails Sent</span>
                    </div>
                    <Badge variant="default" className="text-xs bg-green-100 text-green-800 hover:bg-green-100">
                      {todayStats.emailsSent}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-accent/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-3.5 w-3.5 text-purple-600" />
                      <span className="text-xs font-medium">Replies Received</span>
                    </div>
                    <Badge variant="default" className="text-xs bg-purple-100 text-purple-800 hover:bg-purple-100">
                      {todayStats.replies}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-accent/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-orange-600" />
                      <span className="text-xs font-medium">Calls Booked</span>
                    </div>
                    <Badge variant="default" className="text-xs bg-orange-100 text-orange-800 hover:bg-orange-100">
                      {todayStats.callsBooked}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Add Lead Dialog */}
      <Dialog open={addLeadOpen} onOpenChange={setAddLeadOpen}>
        <DialogContent className="sm:max-w-[425px] bg-background border border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Add New Lead</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Add a new lead to your pipeline. Fill in the required information below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddLeadSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-foreground">Company Name *</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="bg-input border-border text-foreground"
                  placeholder="Enter company name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website" className="text-foreground">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="bg-input border-border text-foreground"
                  placeholder="https://example.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPersonName" className="text-foreground">Contact Person *</Label>
              <Input
                id="contactPersonName"
                value={formData.contactPersonName}
                onChange={(e) => setFormData({ ...formData, contactPersonName: e.target.value })}
                className="bg-input border-border text-foreground"
                placeholder="Enter contact person name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactEmail" className="text-foreground">Contact Email *</Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                className="bg-input border-border text-foreground"
                placeholder="contact@company.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedinProfile" className="text-foreground">LinkedIn Profile</Label>
              <Input
                id="linkedinProfile"
                value={formData.linkedinProfile}
                onChange={(e) => setFormData({ ...formData, linkedinProfile: e.target.value })}
                className="bg-input border-border text-foreground"
                placeholder="https://linkedin.com/in/profile"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status" className="text-foreground">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as LeadStatus })}
              >
                <SelectTrigger className="bg-input border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border">
                  {LEAD_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value} className="text-foreground hover:bg-accent">
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddLeadOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Add Lead
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
