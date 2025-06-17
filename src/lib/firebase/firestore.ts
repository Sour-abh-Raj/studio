
import { db } from './config';
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, doc, updateDoc, deleteDoc, orderBy, Timestamp } from 'firebase/firestore';
import type { Task } from '@/types/task';

export interface TaskData {
  title: string;
  status: 'thought' | 'planned' | 'done';
  order: number;
  notes?: string;
  date: string; // YYYY-MM-DD
  userId: string;
  createdAt?: Timestamp; // Firestore Timestamp
  updatedAt?: Timestamp; // Firestore Timestamp
}

// Get tasks for a specific date
export const getTasksForDate = (
  userIdAuth: string, // Renamed to avoid conflict with task.userId
  dateString: string,
  callback: (tasks: Task[]) => void,
  onError: (error: Error) => void
) => {
  const tasksRef = collection(db, `users/${userIdAuth}/tasks`);
  const q = query(tasksRef, where('date', '==', dateString), orderBy('order', 'asc'));

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const tasks: Task[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as TaskData; // Cast to ensure type safety
      tasks.push({
        id: doc.id,
        title: data.title,
        status: data.status,
        order: data.order,
        notes: data.notes,
        userId: data.userId, // Ensure this is coming from the document
        createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate().toISOString() || new Date().toISOString(),
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
export const addTask = async (userIdAuth: string, taskData: Pick<TaskData, 'title' | 'notes' | 'date' | 'order'>) => {
  const tasksRef = collection(db, `users/${userIdAuth}/tasks`);
  await addDoc(tasksRef, {
    ...taskData,
    userId: userIdAuth, // Explicitly set userId from auth
    status: 'thought', // Default status
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

// Update an existing task
export const updateTask = async (userIdAuth: string, taskId: string, updates: Partial<Omit<TaskData, 'createdAt' | 'userId'>>) => {
  const taskDocRef = doc(db, `users/${userIdAuth}/tasks/${taskId}`);
  await updateDoc(taskDocRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

// Delete a task
export const deleteTask = async (userIdAuth: string, taskId: string) => {
  const taskDocRef = doc(db, `users/${userIdAuth}/tasks/${taskId}`);
  await deleteDoc(taskDocRef);
};


// Fetch all tasks for analytics (example, might need date range)
export const getAllUserTasks = async (
  userIdAuth: string,
  callback: (tasks: Task[]) => void,
  onError: (error: Error) => void
) => {
  const tasksRef = collection(db, `users/${userIdAuth}/tasks`);
  const q = query(tasksRef, orderBy('createdAt', 'desc')); // Order as needed

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const tasks: Task[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as TaskData;
      tasks.push({
        id: doc.id,
        title: data.title,
        status: data.status,
        order: data.order,
        notes: data.notes,
        userId: data.userId,
        createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate().toISOString() || new Date().toISOString(),
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
