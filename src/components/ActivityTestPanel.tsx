import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useActivityStore } from "@/store/activityStore";
import { useAuthStore } from "@/store/authStore";

export function ActivityTestPanel() {
  const { addActivity, clearActivities, getRecentActivities } = useActivityStore();
  const { user } = useAuthStore();

  const addSampleActivity = (type: string) => {
    if (!user) return;

    const activities = {
      lead_created: {
        type: 'lead_created' as const,
        title: `New lead added: Test Company ${Date.now()}`,
        userId: user.id,
        userName: user.name,
        leadId: 'test-lead-id',
        leadName: `Test Company ${Date.now()}`,
      },
      status_changed: {
        type: 'status_changed' as const,
        title: `Status updated: Test Lead → Replied`,
        userId: user.id,
        userName: user.name,
        leadId: 'test-lead-id',
        leadName: 'Test Lead',
        fromStatus: 'new',
        toStatus: 'replied',
      },
      task_completed: {
        type: 'task_completed' as const,
        title: `Task completed: Follow up with client`,
        userId: user.id,
        userName: user.name,
      },
    };

    const activity = activities[type as keyof typeof activities];
    if (activity) {
      addActivity(activity);
    }
  };

  const recentActivities = getRecentActivities(3);

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Activity Test Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Button 
            onClick={() => addSampleActivity('lead_created')}
            variant="outline"
            size="sm"
          >
            Add Lead Activity
          </Button>
          <Button 
            onClick={() => addSampleActivity('status_changed')}
            variant="outline"
            size="sm"
          >
            Add Status Change
          </Button>
          <Button 
            onClick={() => addSampleActivity('task_completed')}
            variant="outline"
            size="sm"
          >
            Add Task Completion
          </Button>
          <Button 
            onClick={clearActivities}
            variant="destructive"
            size="sm"
          >
            Clear Activities
          </Button>
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-2">Recent Activities ({recentActivities.length}):</h4>
          <div className="text-xs space-y-1">
            {recentActivities.map((activity, index) => (
              <div key={index} className="p-2 bg-muted rounded text-muted-foreground">
                {activity.title}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
