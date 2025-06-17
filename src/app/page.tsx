
"use client";
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import type { Task } from '@/types/task';
import TaskList from '@/components/tasks/task-list';
import AddTask from '@/components/tasks/add-task';
import { getTasksForDate, addTask, updateTask, deleteTask, TaskData } from '@/lib/firebase/firestore';
import { format, addDays, subDays, startOfWeek, endOfWeek, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Download, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TaskCounts {
  thought: number;
  planned: number;
  working: number;
  done: number;
  total: number;
}

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  const getFormattedDate = (date: Date): string => format(date, 'yyyy-MM-dd');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && user.uid) {
      const dateString = getFormattedDate(currentDate);
      setIsLoadingTasks(true);
      const unsubscribe = getTasksForDate(user.uid, dateString, (fetchedTasks) => {
        setTasks(fetchedTasks);
        setIsLoadingTasks(false);
      }, (error) => {
        console.error("Error fetching tasks:", error);
        toast({ title: "Error fetching tasks", description: error.message, variant: "destructive" });
        setIsLoadingTasks(false);
      });
      return () => unsubscribe();
    } else if (!authLoading && !user) {
        setIsLoadingTasks(false); // Not logged in, no tasks to load
    }
  }, [user, currentDate, toast]);

  const handleAddTask = async (title: string, notes?: string) => {
    if (!user || !user.uid) return;
    const dateString = getFormattedDate(currentDate);
    try {
      await addTask(user.uid, { title, notes: notes || '', date: dateString, order: tasks.length });
      toast({ title: "Success", description: "Task added successfully." });
    } catch (error: any) {
      console.error("Error adding task:", error);
      toast({ title: "Error adding task", description: error.message, variant: "destructive" });
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Omit<TaskData, 'createdAt' | 'userId'>>) => {
    if (!user || !user.uid) return;
    try {
      await updateTask(user.uid, taskId, updates);
      toast({ title: "Success", description: "Task updated successfully." });
    } catch (error: any) {
      console.error("Error updating task:", error);
      toast({ title: "Error updating task", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!user || !user.uid) return;
    try {
      await deleteTask(user.uid, taskId);
      toast({ title: "Success", description: "Task deleted successfully." });
    } catch (error: any) {
      console.error("Error deleting task:", error);
      toast({ title: "Error deleting task", description: error.message, variant: "destructive" });
    }
  };

  const handleExportTasks = () => {
    const dataStr = JSON.stringify(tasks.map(task => ({
      title: task.title,
      status: task.status,
      notes: task.notes,
      date: task.date,
      order: task.order,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt
    })), null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `tasks-${getFormattedDate(currentDate)}.json`;
  
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    toast({ title: "Exported", description: "Tasks exported as JSON." });
  };

  const taskCounts: TaskCounts = useMemo(() => {
    return tasks.reduce((acc, task) => {
      acc[task.status]++;
      acc.total++;
      return acc;
    }, { thought: 0, planned: 0, working: 0, done: 0, total: 0 });
  }, [tasks]);

  if (authLoading || (!user && !authLoading)) {
    return <div className="flex items-center justify-center h-[calc(100vh-10rem)]"><p>Loading page...</p></div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setCurrentDate(subDays(currentDate,1))}>
                <ChevronLeft className="h-5 w-5" />
                <span className="sr-only">Previous day</span>
            </Button>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[220px] justify-start text-left font-normal">
                        <CalendarDays className="mr-2 h-4 w-4" />
                        {format(currentDate, 'MMMM do, yyyy')}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={currentDate}
                        onSelect={(date) => date && setCurrentDate(date)}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
            <Button variant="outline" size="icon" onClick={() => setCurrentDate(addDays(currentDate,1))}>
                <ChevronRight className="h-5 w-5" />
                <span className="sr-only">Next day</span>
            </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCurrentDate(new Date())}>Today</Button>
          <Button variant="outline" onClick={handleExportTasks} disabled={tasks.length === 0}>
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          <AddTask onAddTask={handleAddTask} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-headline">Daily Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div><p className="text-2xl font-bold">{taskCounts.thought}</p><p className="text-sm text-muted-foreground">Thoughts</p></div>
          <div><p className="text-2xl font-bold">{taskCounts.planned}</p><p className="text-sm text-muted-foreground">Planned</p></div>
          <div><p className="text-2xl font-bold">{taskCounts.working}</p><p className="text-sm text-muted-foreground">Working</p></div>
          <div><p className="text-2xl font-bold">{taskCounts.done}</p><p className="text-sm text-muted-foreground">Done</p></div>
        </CardContent>
      </Card>
      
      {isLoadingTasks ? (
        <p>Loading tasks...</p>
      ) : (
        <TaskList tasks={tasks} onUpdateTask={handleUpdateTask} onDeleteTask={handleDeleteTask} />
      )}
    </div>
  );
}
