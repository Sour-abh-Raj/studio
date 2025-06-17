"use client";

import type { Task } from '@/types/task';
import type { TaskData } from '@/lib/firebase/firestore';
import TaskItem from './task-item';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface TaskListProps {
  tasks: Task[];
  onUpdateTask: (taskId: string, updates: Partial<TaskData>) => void;
  onDeleteTask: (taskId: string) => void;
}

export default function TaskList({ tasks, onUpdateTask, onDeleteTask }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <Card className="text-center py-10 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-headline text-muted-foreground">No tasks for today!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Add a new task to get started.</p>
        </CardContent>
      </Card>
    );
  }

  // Simple sorting: pending first, then by order. Could be more complex.
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.status === 'pending' && b.status === 'completed') return -1;
    if (a.status === 'completed' && b.status === 'pending') return 1;
    return a.order - b.order;
  });

  return (
    <div className="space-y-3">
      {sortedTasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onUpdateTask={onUpdateTask}
          onDeleteTask={onDeleteTask}
        />
      ))}
    </div>
  );
}
