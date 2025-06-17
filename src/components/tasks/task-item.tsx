
"use client";

import type { Task } from '@/types/task';
import type { TaskData } from '@/lib/firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit3, Trash2, MoreVertical, ThumbsUp, Brain, CalendarCheck2, Briefcase } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';

interface TaskItemProps {
  task: Task;
  onUpdateTask: (taskId: string, updates: Partial<Omit<TaskData, 'createdAt' | 'userId'>>) => void;
  onDeleteTask: (taskId: string) => void;
}

const statusMap: Record<Task['status'], { label: string; icon: React.ElementType; colorClass: string; badgeVariant: "default" | "secondary" | "destructive" | "outline" }> = {
  thought: { label: 'Thought', icon: Brain, colorClass: 'bg-blue-500 hover:bg-blue-600', badgeVariant: 'default' },
  planned: { label: 'Planned', icon: CalendarCheck2, colorClass: 'bg-yellow-500 hover:bg-yellow-600 text-black', badgeVariant: 'default' },
  working: { label: 'Working', icon: Briefcase, colorClass: 'bg-purple-500 hover:bg-purple-600', badgeVariant: 'default' },
  done: { label: 'Done', icon: ThumbsUp, colorClass: 'bg-green-500 hover:bg-green-600', badgeVariant: 'secondary' },
};

export default function TaskItem({ task, onUpdateTask, onDeleteTask }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedNotes, setEditedNotes] = useState(task.notes || '');
  const [editedStatus, setEditedStatus] = useState<Task['status']>(task.status);

  const handleUpdateStatus = (newStatus: Task['status']) => {
    onUpdateTask(task.id, { status: newStatus });
    if (isEditing) setEditedStatus(newStatus);
  };

  const handleEdit = () => {
    setEditedTitle(task.title);
    setEditedNotes(task.notes || '');
    setEditedStatus(task.status);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (editedTitle.trim() === '') return; 
    onUpdateTask(task.id, { title: editedTitle.trim(), notes: editedNotes.trim(), status: editedStatus });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const CurrentStatusIcon = statusMap[task.status]?.icon || Brain;
  const currentStatusInfo = statusMap[task.status];

  return (
    <Card className={`mb-3 transition-all duration-300 ease-in-out ${task.status === 'done' ? 'bg-muted/60 opacity-80' : 'bg-card hover:shadow-lg'}`}>
      <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {isEditing ? (
          <div className="flex-grow space-y-3 w-full">
            <Input 
              value={editedTitle} 
              onChange={(e) => setEditedTitle(e.target.value)} 
              className="text-lg font-medium"
              aria-label="Edit task title"
            />
            <Textarea 
              value={editedNotes} 
              onChange={(e) => setEditedNotes(e.target.value)} 
              placeholder="Notes (optional)"
              aria-label="Edit task notes"
              className="min-h-[80px]"
            />
            <div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto justify-start text-left">
                    Status: {statusMap[editedStatus]?.label || 'Set Status'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuLabel>Set Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup value={editedStatus} onValueChange={(value) => setEditedStatus(value as Task['status'])}>
                    {(Object.keys(statusMap) as Array<Task['status']>).map((statusKey) => (
                      <DropdownMenuRadioItem key={statusKey} value={statusKey}>
                        {statusMap[statusKey].label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex gap-2 mt-2">
              <Button size="sm" onClick={handleSaveEdit}>Save Changes</Button>
              <Button size="sm" variant="outline" onClick={handleCancelEdit}>Cancel</Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-grow space-y-1">
              <div className="flex items-center gap-2">
                <CurrentStatusIcon className={`h-5 w-5 ${task.status === 'done' ? 'text-green-600' : 'text-primary'}`} />
                <span 
                  id={`task-title-${task.id}`}
                  className={`text-lg font-medium ${task.status === 'done' ? 'line-through text-muted-foreground' : ''} break-words`}
                >
                  {task.title}
                </span>
              </div>
              {task.notes && (
                <p className={`text-sm text-muted-foreground pl-7 ${task.status === 'done' ? 'line-through' : ''} break-words whitespace-pre-wrap`}>
                  {task.notes}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 mt-2 sm:mt-0 self-end sm:self-center">
              {currentStatusInfo && (
                <Badge variant={currentStatusInfo.badgeVariant} className={`${currentStatusInfo.colorClass} ${currentStatusInfo.colorClass.includes('yellow') ? 'text-black' : 'text-white'}`}>
                  {currentStatusInfo.label}
                </Badge>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="shrink-0">
                    <MoreVertical className="h-5 w-5" />
                    <span className="sr-only">Task options</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {(Object.keys(statusMap) as Array<Task['status']>).map((statusKey) => (
                     <DropdownMenuItem key={statusKey} onClick={() => handleUpdateStatus(statusKey)} disabled={task.status === statusKey}>
                       {statusMap[statusKey].label}
                     </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit3 className="mr-2 h-4 w-4" />
                    Edit Task
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDeleteTask(task.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Task
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
