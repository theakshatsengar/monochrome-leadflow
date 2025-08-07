import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Target, TrendingUp, CheckCircle, Clock, Mail } from "lucide-react";
import { useLeadStore } from "@/store/leadStore";
import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react";

const Index = () => {
  const { leads, fetchLeads, subscribeToLeads } = useLeadStore();
  const { user } = useAuthStore();
  
  // Fetch leads on mount for admin dashboard
  useEffect(() => {
    if (user) {
      fetchLeads(user.id, user.role);
      
      // Set up real-time subscription
      const unsubscribe = subscribeToLeads(user.id, user.role);
      return unsubscribe;
    }
  }, [user, fetchLeads, subscribeToLeads]);
  
  const stats = {
    totalLeads: leads.length,
    newLeads: leads.filter(lead => lead.status === 'new').length,
    emailSent: leads.filter(lead => lead.status === 'email-sent').length,
    replied: leads.filter(lead => lead.status === 'replied').length,
    booked: leads.filter(lead => lead.status === 'booked').length,
    converted: leads.filter(lead => lead.status === 'converted').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Lead management overview and analytics
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLeads}</div>
            <p className="text-xs text-muted-foreground">
              Active leads in system
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Leads</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newLeads}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting outreach
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Email Responses</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.replied}</div>
            <p className="text-xs text-muted-foreground">
              Leads that replied
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Meetings Booked</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.booked}</div>
            <p className="text-xs text-muted-foreground">
              Meetings scheduled
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
