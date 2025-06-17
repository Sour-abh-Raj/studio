
import { db } from './config';
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, doc, updateDoc, deleteDoc, orderBy, Timestamp, getDocs } from 'firebase/firestore';
import type { Task } from '@/types/task';

export interface TaskData {
  title: string;
  status: 'thought' | 'planned' | 'working' | 'done';
  order: number;
  notes?: string;
  date: string; // YYYY-MM-DD
  userId: string;
  createdAt?: Timestamp; // Firestore Timestamp
  updatedAt?: Timestamp; // Firestore Timestamp
}

// Get tasks for a specific date
export const getTasksForDate = (
  userIdAuth: string, 
  dateString: string,
  callback: (tasks: Task[]) => void,
  onError: (error: Error) => void
) => {
  if (!userIdAuth) {
    onError(new Error("User ID is not available. Cannot fetch tasks."));
    return () => {}; // Return an empty unsubscribe function
  }
  const tasksRef = collection(db, `users/${userIdAuth}/tasks`);
  const q = query(tasksRef, where('date', '==', dateString), orderBy('order', 'asc'));

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const tasks: Task[] = [];
    querySnapshot.forEach((docSnap) => { // Renamed doc to docSnap to avoid conflict
      const data = docSnap.data() as TaskData; 
      tasks.push({
        id: docSnap.id,
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
    console.error("Error fetching tasks: ", error);
    onError(error);
  });

  return unsubscribe; 
};

// Add a new task
export const addTask = async (userIdAuth: string, taskData: Pick<TaskData, 'title' | 'notes' | 'date' | 'order'>) => {
  if (!userIdAuth) throw new Error("User ID is not available. Cannot add task.");
  const tasksRef = collection(db, `users/${userIdAuth}/tasks`);
  await addDoc(tasksRef, {
    ...taskData,
    userId: userIdAuth, 
    status: 'thought', // Default status
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

// Update an existing task
export const updateTask = async (userIdAuth: string, taskId: string, updates: Partial<Omit<TaskData, 'createdAt' | 'userId'>>) => {
  if (!userIdAuth) throw new Error("User ID is not available. Cannot update task.");
  const taskDocRef = doc(db, `users/${userIdAuth}/tasks/${taskId}`);
  await updateDoc(taskDocRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

// Delete a task
export const deleteTask = async (userIdAuth: string, taskId: string) => {
  if (!userIdAuth) throw new Error("User ID is not available. Cannot delete task.");
  const taskDocRef = doc(db, `users/${userIdAuth}/tasks/${taskId}`);
  await deleteDoc(taskDocRef);
};


// Fetch tasks for a date range (for analytics)
export const getTasksForDateRange = async (
  userIdAuth: string,
  startDate: string, // YYYY-MM-DD
  endDate: string    // YYYY-MM-DD
): Promise<Task[]> => {
  if (!userIdAuth) throw new Error("User ID is not available. Cannot fetch tasks for range.");
  const tasksRef = collection(db, `users/${userIdAuth}/tasks`);
  const q = query(
    tasksRef,
    where('date', '>=', startDate),
    where('date', '<=', endDate),
    orderBy('date', 'asc'),
    orderBy('order', 'asc') 
  );

  const querySnapshot = await getDocs(q);
  const tasks: Task[] = [];
  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data() as TaskData;
    tasks.push({
      id: docSnap.id,
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
  return tasks;
};
