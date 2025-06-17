
"use client";

import type { Task } from '@/types/task';
import type { TaskData } from '@/lib/firebase/firestore';
import TaskItem from './task-item';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface TaskListProps {
  tasks: Task[];
  onUpdateTask: (taskId: string, updates: Partial<Omit<TaskData, 'createdAt' | 'userId'>>) => void;
  onDeleteTask: (taskId: string) => void;
}

const statusOrder: Record<Task['status'], number> = {
  working: 1,
  planned: 2,
  thought: 3,
  done: 4,
};

export default function TaskList({ tasks, onUpdateTask, onDeleteTask }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <Card className="text-center py-10 shadow-sm border-dashed border-muted-foreground/30">
        <CardHeader>
          <CardTitle className="text-xl font-headline text-muted-foreground">No tasks for today!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Add a new task to get started.</p>
        </CardContent>
      </Card>
    );
  }

  // Sort tasks: by status order, then by their original 'order' field.
  const sortedTasks = [...tasks].sort((a, b) => {
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status];
    }
    return a.order - b.order;
  });

  return (
    <div className="space-y-4">
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
