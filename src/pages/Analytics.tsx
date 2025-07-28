import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Analytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground">
          Track your lead performance and conversion metrics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">18.2%</div>
            <p className="text-muted-foreground text-sm">+2.4% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Average Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">2.3h</div>
            <p className="text-muted-foreground text-sm">-0.5h from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Active Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">47</div>
            <p className="text-muted-foreground text-sm">+12 from last week</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Lead Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-foreground">New</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-200 rounded-full">
                  <div className="w-1/4 h-2 bg-gray-700 rounded-full"></div>
                </div>
                <span className="text-muted-foreground text-sm">25%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-foreground">Email Sent</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-200 rounded-full">
                  <div className="w-2/5 h-2 bg-gray-600 rounded-full"></div>
                </div>
                <span className="text-muted-foreground text-sm">40%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-foreground">Follow-up 1</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-200 rounded-full">
                  <div className="w-1/5 h-2 bg-gray-500 rounded-full"></div>
                </div>
                <span className="text-muted-foreground text-sm">20%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-foreground">Replied</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-200 rounded-full">
                  <div className="w-1/10 h-2 bg-gray-800 rounded-full"></div>
                </div>
                <span className="text-muted-foreground text-sm">10%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-foreground">Converted</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-200 rounded-full">
                  <div className="w-1/20 h-2 bg-gray-900 rounded-full"></div>
                </div>
                <span className="text-muted-foreground text-sm">5%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}