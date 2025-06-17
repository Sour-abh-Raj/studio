export interface Task {
  id: string;
  title: string;
  status: 'pending' | 'completed';
  order: number;
  notes?: string;
  createdAt: string; // ISO string date
  date: string; // YYYY-MM-DD format for specific day
}
