
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

  // Sorting: 'done' tasks last, others by order.
  // 'thought' and 'planned' will be treated similarly for sorting before 'done'.
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.status === 'done' && b.status !== 'done') return 1;
    if (a.status !== 'done' && b.status === 'done') return -1;
    return a.order - b.order; // Original order for non-done tasks
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
