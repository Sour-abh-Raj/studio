
export interface Task {
  id: string;
  title: string;
  status: 'thought' | 'planned' | 'done';
  order: number;
  notes?: string;
  userId: string;
  createdAt: string; // ISO string date
  updatedAt: string; // ISO string date
  date: string; // YYYY-MM-DD format for specific day
}
