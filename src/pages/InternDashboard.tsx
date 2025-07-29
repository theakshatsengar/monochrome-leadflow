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
import { useTodoStore } from '@/store/todoStore';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { TodoTask } from '@/types/todo';
import { LEAD_STATUSES, INTERNS, LeadStatus } from "@/types/lead";
import { toast } from "@/hooks/use-toast";

export function InternDashboard() {
  const navigate = useNavigate();
  const { leads, addLead } = useLeadStore();
  const { getTasksForIntern, toggleTaskComplete } = useTodoStore();
  const { user } = useAuthStore();
  const [addLeadOpen, setAddLeadOpen] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    website: "",
    contactPersonName: "",
    contactEmail: "",
    linkedinProfile: "",
    assignedIntern: "",
    status: "new" as LeadStatus,
  });
  
  // Get tasks for current intern
  const tasks = getTasksForIntern(user?.name || 'all');
  
  const toggleTask = (taskId: string) => {
    toggleTaskComplete(taskId, user?.name);
  };

  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;

  // Priority colors
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
      case 'low':
        return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800';
      default:
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800';
    }
  };

  // Check if task is overdue
  const isOverdue = (task: TodoTask) => {
    if (!task.dueDate || task.completed) return false;
    return new Date(task.dueDate) < new Date();
  };

  // Calculate action card metrics
  const leadsToEmail = leads.filter(lead => lead.status === 'new').length;
  const followupsDue = leads.filter(lead => 
    ['followup-1', 'followup-2'].includes(lead.status)
  ).length;
  const repliedNotBooked = leads.filter(lead => 
    lead.status === 'replied' || (lead.hasReplies && lead.status !== 'booked')
  ).length;

  // Mock stats for today
  const todayStats = {
    leadsAdded: 5,
    emailsSent: 12,
    replies: 3,
    callsBooked: 1
  };

  // Handle navigation to leads page with status filter
  const handleSendEmailsClick = () => {
    navigate('/leads?status=new');
  };

  // Handle form submission for add lead
  const handleAddLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.companyName || !formData.contactPersonName || !formData.contactEmail || !formData.assignedIntern) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      addLead({
        ...formData,
        linkedinProfile: formData.linkedinProfile || undefined,
      });

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
        assignedIntern: "",
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Intern Dashboard</h1>
        <p className="text-muted-foreground">
          Stay organized and track your daily activities
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Daily Checklist - Left Column */}
        <div className="lg:col-span-1">
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  Today's Tasks
                </CardTitle>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  {completedTasks}/{totalTasks}
                </Badge>
              </div>
              <CardDescription className="text-muted-foreground">
                Complete your daily checklist to stay on track
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {tasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No tasks assigned yet</p>
                  <p className="text-xs">Check back later for new assignments</p>
                </div>
              ) : (
                tasks.map((task) => (
                  <div 
                    key={task.id} 
                    className={`flex items-start gap-3 p-3 rounded-lg transition-colors border ${
                      isOverdue(task) 
                        ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800' 
                        : 'hover:bg-accent/50 border-transparent'
                    }`}
                  >
                    <Checkbox
                      id={task.id}
                      checked={task.completed}
                      onCheckedChange={() => toggleTask(task.id)}
                      className="mt-0.5"
                    />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <label 
                          htmlFor={task.id}
                          className={`block text-sm font-medium cursor-pointer transition-colors ${
                            task.completed 
                              ? 'text-muted-foreground line-through' 
                              : 'text-foreground'
                          }`}
                        >
                          {task.title}
                        </label>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge variant="outline" className={`text-xs ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </Badge>
                          {isOverdue(task) && (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </div>
                      
                      {task.description && (
                        <p className={`text-xs transition-colors ${
                          task.completed 
                            ? 'text-muted-foreground/70' 
                            : 'text-muted-foreground'
                        }`}>
                          {task.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {task.assignedTo === 'all' ? 'All interns' : `Assigned to you`}
                        </span>
                        {task.dueDate && (
                          <span className={isOverdue(task) ? 'text-red-500 font-medium' : ''}>
                            Due {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              
              {completedTasks === totalTasks && totalTasks > 0 && (
                <div className="mt-4 p-3 bg-accent border border-border rounded-lg">
                  <p className="text-sm text-foreground font-medium">
                    🎉 All tasks completed! Great job today!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions Section */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Target className="h-5 w-5 text-primary" />
                Quick Actions
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Jump to common tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-3">
                <Button 
                  onClick={() => setAddLeadOpen(true)}
                  variant="outline"
                  className="justify-start"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Add New Lead
                </Button>
                <Button 
                  onClick={handleSendEmailsClick}
                  variant="outline"
                  className="justify-start"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Send Emails
                </Button>
                <Button 
                  onClick={() => navigate('/leads')}
                  variant="outline"
                  className="justify-start"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View All Leads
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Action Cards Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Leads Needing Email */}
            <Card className="bg-card border-border hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-accent rounded-lg">
                    <Mail className="h-4 w-4 text-foreground" />
                  </div>
                  <CardTitle className="text-lg text-foreground">Leads to Email</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-foreground">{leadsToEmail}</span>
                  <span className="text-sm text-muted-foreground">new leads waiting</span>
                </div>
                <Button 
                  onClick={() => navigate('/leads')}
                  className="w-full"
                  size="sm"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  View Leads
                </Button>
              </CardContent>
            </Card>

            {/* Follow-ups Due */}
            <Card className="bg-card border-border hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-accent rounded-lg">
                    <Clock className="h-4 w-4 text-foreground" />
                  </div>
                  <CardTitle className="text-lg text-foreground">Follow-ups Today</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-foreground">{followupsDue}</span>
                  <span className="text-sm text-muted-foreground">follow-ups due</span>
                </div>
                <Button 
                  onClick={() => navigate('/leads')}
                  className="w-full"
                  size="sm"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  View Follow-ups
                </Button>
              </CardContent>
            </Card>

            {/* Replies Without Call */}
            <Card className="bg-card border-border hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-accent rounded-lg">
                    <MessageSquare className="h-4 w-4 text-foreground" />
                  </div>
                  <CardTitle className="text-lg text-foreground">Replied but Not Booked</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-foreground">{repliedNotBooked}</span>
                  <span className="text-sm text-muted-foreground">need follow-up</span>
                </div>
                <Button 
                  onClick={() => navigate('/leads')}
                  className="w-full"
                  size="sm"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  View Replies
                </Button>
              </CardContent>
            </Card>

            {/* Stats Summary */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-accent rounded-lg">
                    <BarChart3 className="h-4 w-4 text-foreground" />
                  </div>
                  <CardTitle className="text-lg text-foreground">Your Stats</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-2 bg-accent/50 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Added</span>
                    </div>
                    <span className="text-lg font-bold text-foreground">{todayStats.leadsAdded}</span>
                  </div>
                  <div className="text-center p-2 bg-accent/50 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Send className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Emails</span>
                    </div>
                    <span className="text-lg font-bold text-foreground">{todayStats.emailsSent}</span>
                  </div>
                  <div className="text-center p-2 bg-accent/50 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <MessageSquare className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Replies</span>
                    </div>
                    <span className="text-lg font-bold text-foreground">{todayStats.replies}</span>
                  </div>
                  <div className="text-center p-2 bg-accent/50 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Calls</span>
                    </div>
                    <span className="text-lg font-bold text-foreground">{todayStats.callsBooked}</span>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="assignedIntern" className="text-foreground">Assigned Intern *</Label>
                <Select
                  value={formData.assignedIntern}
                  onValueChange={(value) => setFormData({ ...formData, assignedIntern: value })}
                >
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue placeholder="Select intern" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border border-border">
                    {INTERNS.map((intern) => (
                      <SelectItem key={intern.id} value={intern.name} className="text-foreground hover:bg-accent">
                        {intern.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
