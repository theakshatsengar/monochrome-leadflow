import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Target, TrendingUp, CheckCircle, Clock, Mail } from "lucide-react";
import { useLeadStore } from "@/store/leadStore";

const Index = () => {
  const { leads } = useLeadStore();
  
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

      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-border">
            <span className="text-foreground">New lead added: TechCorp Solutions</span>
            <span className="text-muted-foreground text-sm">2 hours ago</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-border">
            <span className="text-foreground">Status updated: Digital Innovations → Replied</span>
            <span className="text-muted-foreground text-sm">4 hours ago</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-border">
            <span className="text-foreground">Follow-up sent to StartupXYZ</span>
            <span className="text-muted-foreground text-sm">1 day ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
