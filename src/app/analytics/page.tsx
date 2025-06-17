
"use client";

import { useAuth } from '@/contexts/auth-context';
import { useEffect, useState } from 'react';
import type { Task } from '@/types/task';
import { getTasksForDateRange } from '@/lib/firebase/firestore';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface DailyAnalyticsData {
  date: string; // Short date format for X-axis
  fullDate: string; // YYYY-MM-DD for fetching
  thought: number;
  planned: number;
  working: number;
  done: number;
  total: number;
}

const statusColors: Record<Task['status'], string> = {
  thought: "hsl(var(--chart-1))",
  planned: "hsl(var(--chart-2))",
  working: "hsl(var(--chart-3))",
  done: "hsl(var(--chart-4))",
};

const chartConfigBase = {
  thought: { label: "Thoughts", color: statusColors.thought },
  planned: { label: "Planned", color: statusColors.planned },
  working: { label: "Working", color: statusColors.working },
  done: { label: "Done", color: statusColors.done },
} satisfies ChartConfig;


export default function AnalyticsPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [analyticsData, setAnalyticsData] = useState<DailyAnalyticsData[]>([]);
  const [overallStatusCounts, setOverallStatusCounts] = useState<Record<Task['status'], number>>({ thought: 0, planned: 0, working: 0, done: 0 });
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);

  useEffect(() => {
    if (user && user.uid) {
      const fetchAnalytics = async () => {
        setIsLoadingAnalytics(true);
        try {
          const endDate = startOfDay(new Date());
          const startDate = startOfDay(subDays(endDate, 6)); // Last 7 days including today

          const tasksInRange = await getTasksForDateRange(user.uid, format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd'));
          
          const dailyMap = new Map<string, DailyAnalyticsData>();
          const tempOverallCounts: Record<Task['status'], number> = { thought: 0, planned: 0, working: 0, done: 0 };

          for (let i = 0; i < 7; i++) {
            const targetDate = subDays(endDate, i);
            const dateStr = format(targetDate, 'yyyy-MM-dd');
            dailyMap.set(dateStr, {
              date: format(targetDate, 'MMM d'),
              fullDate: dateStr,
              thought: 0,
              planned: 0,
              working: 0,
              done: 0,
              total: 0,
            });
          }

          tasksInRange.forEach(task => {
            const dayData = dailyMap.get(task.date);
            if (dayData) {
              dayData[task.status]++;
              dayData.total++;
              tempOverallCounts[task.status]++;
            }
          });
          
          setAnalyticsData(Array.from(dailyMap.values()).sort((a,b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime()));
          setOverallStatusCounts(tempOverallCounts);

        } catch (error: any) {
          console.error("Error fetching analytics:", error);
          toast({ title: "Error fetching analytics", description: error.message, variant: "destructive" });
        } finally {
          setIsLoadingAnalytics(false);
        }
      };
      fetchAnalytics();
    }
  }, [user, toast]);

  if (authLoading) {
    return <div className="flex items-center justify-center h-[calc(100vh-10rem)]"><p>Loading analytics...</p></div>;
  }

  if (!user) {
    return <div className="flex items-center justify-center h-[calc(100vh-10rem)]"><p>Please log in to view analytics.</p></div>;
  }
  
  const pieData = (Object.keys(overallStatusCounts) as Array<Task['status']>)
    .map(status => ({ name: chartConfigBase[status].label, value: overallStatusCounts[status], fill: chartConfigBase[status].color }))
    .filter(item => item.value > 0);


  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold font-headline">Task Analytics</h1>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-headline">Task Distribution (Last 7 Days)</CardTitle>
          <CardDescription>Breakdown of tasks by status over the last 7 days.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingAnalytics ? (
            <p>Loading chart data...</p>
          ) : analyticsData.length > 0 ? (
            <ChartContainer config={chartConfigBase} className="min-h-[300px] w-full">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={analyticsData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} tickMargin={8} />
                  <Tooltip
                    cursor={{ fill: "hsl(var(--muted))" }}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Legend />
                  <Bar dataKey="thought" stackId="a" fill="var(--color-thought)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="planned" stackId="a" fill="var(--color-planned)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="working" stackId="a" fill="var(--color-working)" radius={[4, 4, 0, 0]}/>
                  <Bar dataKey="done" stackId="a" fill="var(--color-done)" radius={[4, 4, 0, 0]}/>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <p>No task data available for the last 7 days to display charts.</p>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-headline">Overall Status Breakdown (Last 7 Days)</CardTitle>
           <CardDescription>Total count of tasks in each status over the last 7 days.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingAnalytics ? (
            <p>Loading pie chart...</p>
          ) : pieData.length > 0 ? (
            <ChartContainer config={chartConfigBase} className="min-h-[300px] w-full aspect-square sm:aspect-video">
                <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                        <Tooltip content={<ChartTooltipContent hideLabel nameKey="name" />} />
                        <Pie
                            data={pieData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={120}
                            labelLine={false}
                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        >
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Pie>
                         <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </ChartContainer>
          ) : (
             <p>No tasks to display in the pie chart for the last 7 days.</p>
          )}
        </CardContent>
      </Card>
      {/* TODO: Add more analytics like streaks, progress charts */}
    </div>
  );
}
