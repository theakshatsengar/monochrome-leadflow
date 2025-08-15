import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  Mail, 
  RotateCcw, 
  Edit,
  CheckCircle2
} from 'lucide-react';
import { useDailyTasksStore } from '@/store/dailyTasksStore';

const TASK_ICONS = {
  search: Search,
  plus: Plus,
  mail: Mail,
  repeat: RotateCcw,
  edit: Edit,
};

interface DailyTasksSectionProps {
  userId: string;
}

export function DailyTasksSection({ userId }: DailyTasksSectionProps) {
  const { 
    tasks, 
    initializeDailyTasks, 
    resetTasksIfNewDay, 
    toggleTask, 
    getTaskProgress 
  } = useDailyTasksStore();

  // Filter tasks for current user
  const userTasks = tasks.filter(task => task.userId === userId);

  useEffect(() => {
    if (userId) {
      resetTasksIfNewDay(userId);
      if (userTasks.length === 0) {
        initializeDailyTasks(userId);
      }
    }
  }, [userId, userTasks.length, resetTasksIfNewDay, initializeDailyTasks]);

  const { completed, total } = getTaskProgress(userId);
  const progressPercentage = total > 0 ? (completed / total) * 100 : 0;

  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">Daily Tasks</CardTitle>
          <Badge variant="outline" className="text-xs">
            {completed}/{total}
          </Badge>
        </div>
        <Progress value={progressPercentage} className="h-1.5" />
      </CardHeader>
      <CardContent className="space-y-2">
        {userTasks.map((task) => {
          const IconComponent = TASK_ICONS[task.icon as keyof typeof TASK_ICONS] || CheckCircle2;
          
          return (
            <div
              key={`${task.id}-${task.userId}`}
              className={`flex items-center gap-3 py-2 px-1 transition-opacity ${
                task.completed ? 'opacity-60' : 'opacity-100'
              }`}
            >
              <Checkbox
                id={`${task.id}-${task.userId}`}
                checked={task.completed}
                onCheckedChange={() => toggleTask(task.id, userId)}
                className="h-4 w-4"
              />
              
              <div className="flex-1 flex items-center gap-2">
                <IconComponent className="h-3.5 w-3.5 text-muted-foreground" />
                <label
                  htmlFor={`${task.id}-${task.userId}`}
                  className={`text-sm cursor-pointer transition-all ${
                    task.completed 
                      ? 'line-through text-muted-foreground' 
                      : 'text-foreground'
                  }`}
                >
                  {task.title}
                </label>
              </div>

              {task.targetCount && task.currentCount !== undefined && (
                <Badge 
                  variant={task.currentCount >= task.targetCount ? "default" : "outline"} 
                  className="text-xs h-5 px-1.5"
                >
                  {task.currentCount}/{task.targetCount}
                </Badge>
              )}
            </div>
          );
        })}

        {completed === total && total > 0 && (
          <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-md">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300 text-xs">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span className="font-medium">All tasks completed!</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
