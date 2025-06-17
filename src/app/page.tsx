"use client";
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Task } from '@/types/task';
import TaskList from '@/components/tasks/task-list';
import AddTask from '@/components/tasks/add-task';
import { getTasksForDate, addTask, updateTask, deleteTask, TaskData } from '@/lib/firebase/firestore';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
    if (user) {
      const dateString = getFormattedDate(currentDate);
      setIsLoadingTasks(true);
      const unsubscribe = getTasksForDate(user.uid, dateString, (fetchedTasks) => {
        setTasks(fetchedTasks);
        setIsLoadingTasks(false);
      }, (error) => {
        console.error("Error fetching tasks:", error);
        toast({ title: "Error", description: "Failed to fetch tasks.", variant: "destructive" });
        setIsLoadingTasks(false);
      });
      return () => unsubscribe();
    }
  }, [user, currentDate, toast]);

  const handleAddTask = async (title: string, notes?: string) => {
    if (!user) return;
    const dateString = getFormattedDate(currentDate);
    try {
      await addTask(user.uid, { title, notes: notes || '', status: 'pending', date: dateString, order: tasks.length });
      toast({ title: "Success", description: "Task added successfully." });
    } catch (error) {
      console.error("Error adding task:", error);
      toast({ title: "Error", description: "Failed to add task.", variant: "destructive" });
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<TaskData>) => {
    if (!user) return;
    try {
      await updateTask(user.uid, taskId, updates);
      toast({ title: "Success", description: "Task updated successfully." });
    } catch (error) {
      console.error("Error updating task:", error);
      toast({ title: "Error", description: "Failed to update task.", variant: "destructive" });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!user) return;
    try {
      await deleteTask(user.uid, taskId);
      toast({ title: "Success", description: "Task deleted successfully." });
    } catch (error) {
      console.error("Error deleting task:", error);
      toast({ title: "Error", description: "Failed to delete task.", variant: "destructive" });
    }
  };

  const handleExportTasks = () => {
    const dataStr = JSON.stringify(tasks, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `tasks-${getFormattedDate(currentDate)}.json`;
  
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    toast({ title: "Exported", description: "Tasks exported as JSON." });
  };

  if (authLoading || (!user && !authLoading)) {
    return <div className="flex items-center justify-center h-[calc(100vh-10rem)]"><p>Loading tasks...</p></div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold font-headline">Tasks for {format(currentDate, 'MMMM do, yyyy')}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportTasks} disabled={tasks.length === 0}>
            <Download className="mr-2 h-4 w-4" /> Export Tasks
          </Button>
          <AddTask onAddTask={handleAddTask} />
        </div>
      </div>
      
      {isLoadingTasks ? (
        <p>Loading tasks...</p>
      ) : (
        <TaskList tasks={tasks} onUpdateTask={handleUpdateTask} onDeleteTask={handleDeleteTask} />
      )}
    </div>
  );
}
