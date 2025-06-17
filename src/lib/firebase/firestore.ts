import { db } from './config';
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, doc, updateDoc, deleteDoc, orderBy, Timestamp } from 'firebase/firestore';
import type { Task } from '@/types/task';

export interface TaskData {
  title: string;
  status: 'pending' | 'completed';
  order: number;
  notes?: string;
  date: string; // YYYY-MM-DD
  createdAt?: Timestamp; // Firestore Timestamp
}

// Get tasks for a specific date
export const getTasksForDate = (
  userId: string,
  dateString: string,
  callback: (tasks: Task[]) => void,
  onError: (error: Error) => void
) => {
  const tasksRef = collection(db, `users/${userId}/tasks`);
  const q = query(tasksRef, where('date', '==', dateString), orderBy('order', 'asc'));

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const tasks: Task[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      tasks.push({
        id: doc.id,
        title: data.title,
        status: data.status,
        order: data.order,
        notes: data.notes,
        createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
        date: data.date,
      });
    });
    callback(tasks);
  }, (error) => {
    console.error("Error fetching tasks: ", error);
    onError(error);
  });

  return unsubscribe; // Return the unsubscribe function to be called on component unmount
};

// Add a new task
export const addTask = async (userId: string, taskData: Omit<TaskData, 'createdAt'>) => {
  const tasksRef = collection(db, `users/${userId}/tasks`);
  await addDoc(tasksRef, {
    ...taskData,
    createdAt: serverTimestamp(),
  });
};

// Update an existing task
export const updateTask = async (userId: string, taskId: string, updates: Partial<TaskData>) => {
  const taskDocRef = doc(db, `users/${userId}/tasks/${taskId}`);
  await updateDoc(taskDocRef, updates);
};

// Delete a task
export const deleteTask = async (userId: string, taskId: string) => {
  const taskDocRef = doc(db, `users/${userId}/tasks/${taskId}`);
  await deleteDoc(taskDocRef);
};


// Fetch all tasks for analytics (example, might need date range)
export const getAllUserTasks = async (
  userId: string,
  callback: (tasks: Task[]) => void,
  onError: (error: Error) => void
) => {
  const tasksRef = collection(db, `users/${userId}/tasks`);
  const q = query(tasksRef, orderBy('createdAt', 'desc')); // Order as needed

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const tasks: Task[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      tasks.push({
        id: doc.id,
        title: data.title,
        status: data.status,
        order: data.order,
        notes: data.notes,
        createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
        date: data.date,
      });
    });
    callback(tasks);
  }, (error) => {
    console.error("Error fetching all tasks: ", error);
    onError(error);
  });

  return unsubscribe;
};
