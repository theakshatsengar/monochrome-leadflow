// Update this page (the content is just a fallback if you fail to update the page)

const Index = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Lead management overview and analytics
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Total Leads</h3>
          <p className="text-2xl font-bold text-foreground">127</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Active Campaigns</h3>
          <p className="text-2xl font-bold text-foreground">12</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Reply Rate</h3>
          <p className="text-2xl font-bold text-foreground">23%</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Conversions</h3>
          <p className="text-2xl font-bold text-foreground">8</p>
        </div>
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
