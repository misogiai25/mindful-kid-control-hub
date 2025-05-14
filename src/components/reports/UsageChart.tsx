
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppCategory, DailyUsage } from "@/types/kidsafe";
import { useKidSafe } from "@/context/KidSafeContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts";

interface UsageChartProps {
  childId: string;
}

const categoryColors: Record<string, string> = {
  games: "#ef4444", // red
  social: "#3b82f6", // blue
  education: "#10b981", // green
  entertainment: "#f97316", // orange
  productivity: "#6366f1", // indigo
  other: "#71717a", // gray
};

const UsageChart = ({ childId }: UsageChartProps) => {
  const { weeklyUsage } = useKidSafe();
  
  const data = weeklyUsage[childId] || [];
  
  // Format data for the stacked bar chart
  const chartData = data.map(day => {
    const date = new Date(day.date);
    const formattedDate = date.toLocaleDateString('en-US', { weekday: 'short' });
    
    return {
      name: formattedDate,
      ...day.breakdownByCategory,
      total: day.totalTime
    };
  });
  
  // Get the categories from the data
  const categories = Object.keys(chartData[0] || {}).filter(
    key => key !== 'name' && key !== 'total'
  ) as AppCategory[];
  
  const formatYAxisTick = (minutes: number) => {
    if (minutes >= 60) {
      return `${Math.floor(minutes / 60)}h`;
    }
    return `${minutes}m`;
  };
  
  const formatTooltip = (value: number, name: string) => {
    if (name === "total") return "";
    
    if (value >= 60) {
      const hours = Math.floor(value / 60);
      const minutes = value % 60;
      return `${hours}h ${minutes}m`;
    }
    return `${value} min`;
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Usage</CardTitle>
        <CardDescription>
          Screen time breakdown by category
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[300px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={formatYAxisTick} />
              <Tooltip 
                formatter={formatTooltip}
                labelFormatter={(label) => `${label}`}
              />
              <Legend />
              {categories.map((category) => (
                <Bar
                  key={category}
                  dataKey={category}
                  stackId="a"
                  name={category.charAt(0).toUpperCase() + category.slice(1)}
                  fill={categoryColors[category]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default UsageChart;
