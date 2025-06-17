
"use client";

import { useAuth } from '@/contexts/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import type { Task } from '@/types/task'; // Ensure this uses the updated Task type
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { format, subDays } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

interface DailyAnalytics {
  date: string;
  completed: number; // Specifically tasks marked as 'done'
  total: number;
  percentage: number;
}

const chartConfig = {
  completed: {
    label: "Tasks Done", // Changed from "Completed Tasks" to "Tasks Done" to match 'done' status
    color: "hsl(var(--chart-4))", // Using the 'done' color from analytics page for consistency
  },
} satisfies ChartConfig;

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [analytics, setAnalytics] = useState<DailyAnalytics[]>([]);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);

  useEffect(() => {
    if (user && user.uid) {
      const fetchAnalytics = async () => {
        setIsLoadingAnalytics(true);
        const today = new Date();
        const dailyData: DailyAnalytics[] = [];

        for (let i = 6; i >= 0; i--) { // Last 7 days
          const targetDate = subDays(today, i);
          const dateString = format(targetDate, 'yyyy-MM-dd');
          
          const tasksRef = collection(db, `users/${user.uid}/tasks`);
          const q = query(tasksRef, where("date", "==", dateString));
          
          const querySnapshot = await getDocs(q);
          let doneCount = 0; // Changed from completedCount
          const totalTasks = querySnapshot.size;

          querySnapshot.forEach(doc => {
            const taskData = doc.data() as Task; // Use Task type
            if (taskData.status === 'done') { // Check for 'done' status
              doneCount++;
            }
          });
          
          dailyData.push({
            date: format(targetDate, 'MMM d'), // Format for chart display
            completed: doneCount, // Represents 'done' tasks
            total: totalTasks,
            percentage: totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0,
          });
        }
        setAnalytics(dailyData);
        setIsLoadingAnalytics(false);
      };
      fetchAnalytics();
    }
  }, [user]);

  if (authLoading) {
    return <div className="flex items-center justify-center h-[calc(100vh-10rem)]"><p>Loading profile...</p></div>;
  }

  if (!user) {
    return <div className="flex items-center justify-center h-[calc(100vh-10rem)]"><p>Please log in to view your profile.</p></div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold font-headline">Your Profile</h1>
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
            <AvatarFallback className="text-3xl">{user.displayName ? user.displayName.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : '?')}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl">{user.displayName || 'User'}</CardTitle>
            <CardDescription className="text-md">{user.email}</CardDescription>
          </div>
        </CardHeader>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-headline">Task Completion Analytics (Last 7 Days)</CardTitle>
          <CardDescription>Overview of your tasks marked as 'done'.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingAnalytics ? (
            <p>Loading analytics...</p>
          ) : analytics.length > 0 ? (
            <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} tickMargin={8} />
                  <Tooltip
                    cursor={{ fill: "hsl(var(--muted))" }}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Legend />
                  <Bar dataKey="completed" fill="var(--color-completed)" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <p>No task data available for the last 7 days.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
