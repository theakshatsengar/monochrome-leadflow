import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">
          Configure your lead management preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Email Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emailTemplate" className="text-foreground">Default Email Template</Label>
              <Input
                id="emailTemplate"
                placeholder="Hi {{name}}, I hope this email finds you well..."
                className="bg-background border-border text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="followupDelay" className="text-foreground">Follow-up Delay (days)</Label>
              <Input
                id="followupDelay"
                type="number"
                placeholder="3"
                className="bg-background border-border text-foreground"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="autoFollowup" />
              <Label htmlFor="autoFollowup" className="text-foreground">Enable automatic follow-ups</Label>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Notification Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch id="emailNotifications" />
              <Label htmlFor="emailNotifications" className="text-foreground">Email notifications</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="dailyReports" />
              <Label htmlFor="dailyReports" className="text-foreground">Daily reports</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="replyAlerts" />
              <Label htmlFor="replyAlerts" className="text-foreground">Reply alerts</Label>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Team Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newIntern" className="text-foreground">Add New Intern</Label>
              <div className="flex gap-2">
                <Input
                  id="newIntern"
                  placeholder="Enter intern name"
                  className="bg-background border-border text-foreground"
                />
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Add
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Current Team Members</Label>
              <div className="space-y-2">
                {['John Smith', 'Sarah Johnson', 'Mike Chen', 'Emily Davis', 'Alex Rodriguez'].map((intern) => (
                  <div key={intern} className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-foreground">{intern}</span>
                    <Button variant="outline" size="sm" className="border-border text-foreground hover:bg-muted">
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Data Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              Export All Leads
            </Button>
            <Button variant="outline" className="w-full border-border text-foreground hover:bg-muted">
              Import Leads (CSV)
            </Button>
            <Button variant="destructive" className="w-full">
              Clear All Data
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}