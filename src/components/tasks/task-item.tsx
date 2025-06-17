"use client";

import type { Task } from '@/types/task';
import type { TaskData } from '@/lib/firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Edit3, Trash2, GripVertical, MoreVertical } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';

interface TaskItemProps {
  task: Task;
  onUpdateTask: (taskId: string, updates: Partial<TaskData>) => void;
  onDeleteTask: (taskId: string) => void;
}

export default function TaskItem({ task, onUpdateTask, onDeleteTask }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedNotes, setEditedNotes] = useState(task.notes || '');

  const handleStatusChange = (checked: boolean) => {
    onUpdateTask(task.id, { status: checked ? 'completed' : 'pending' });
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (editedTitle.trim() === '') return; // Prevent empty title
    onUpdateTask(task.id, { title: editedTitle, notes: editedNotes });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedTitle(task.title);
    setEditedNotes(task.notes || '');
    setIsEditing(false);
  };

  return (
    <Card className={`mb-3 transition-all duration-300 ease-in-out ${task.status === 'completed' ? 'bg-muted/50 opacity-70' : 'bg-card hover:shadow-md'}`}>
      <CardContent className="p-4 flex items-center justify-between gap-3">
        {isEditing ? (
          <div className="flex-grow space-y-2">
            <Input 
              value={editedTitle} 
              onChange={(e) => setEditedTitle(e.target.value)} 
              className="text-lg"
              aria-label="Edit task title"
            />
            <Textarea 
              value={editedNotes} 
              onChange={(e) => setEditedNotes(e.target.value)} 
              placeholder="Notes (optional)"
              aria-label="Edit task notes"
            />
            <div className="flex gap-2 mt-2">
              <Button size="sm" onClick={handleSaveEdit}>Save</Button>
              <Button size="sm" variant="outline" onClick={handleCancelEdit}>Cancel</Button>
            </div>
          </div>
        ) : (
          <>
            {/* <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab mr-2" aria-hidden="true" /> */}
            <Checkbox
              id={`task-${task.id}`}
              checked={task.status === 'completed'}
              onCheckedChange={handleStatusChange}
              className="mr-3 shrink-0"
              aria-labelledby={`task-title-${task.id}`}
            />
            <div className="flex-grow cursor-pointer" onClick={() => handleStatusChange(task.status !== 'completed')}>
              <label 
                htmlFor={`task-${task.id}`}
                id={`task-title-${task.id}`}
                className={`text-lg font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''} break-words`}
              >
                {task.title}
              </label>
              {task.notes && (
                <p className={`text-sm text-muted-foreground ${task.status === 'completed' ? 'line-through' : ''} break-words`}>
                  {task.notes}
                </p>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0">
                  <MoreVertical className="h-5 w-5" />
                  <span className="sr-only">Task options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit3 className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDeleteTask(task.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </CardContent>
    </Card>
  );
}
