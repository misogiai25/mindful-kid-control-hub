
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useKidSafe } from "@/context/KidSafeContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UsageLog } from "@/types/kidsafe";

interface UsageTimelineProps {
  childId: string;
}

const categoryColors: Record<string, string> = {
  games: "text-red-600 bg-red-50",
  social: "text-blue-600 bg-blue-50",
  education: "text-green-600 bg-green-50",
  entertainment: "text-orange-600 bg-orange-50",
  productivity: "text-indigo-600 bg-indigo-50",
  other: "text-gray-600 bg-gray-50",
};

const UsageTimeline = ({ childId }: UsageTimelineProps) => {
  const { usageLogs } = useKidSafe();
  
  const logs = usageLogs[childId] || [];
  
  // Sort logs by startTime (most recent first)
  const sortedLogs = [...logs].sort((a, b) => 
    new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  );
  
  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Timeline</CardTitle>
        <CardDescription>
          Recent activity and app usage
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {sortedLogs.length > 0 ? (
            <div className="space-y-4">
              {sortedLogs.map((log) => (
                <TimelineItem key={log.id} log={log} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No activity recorded today
            </p>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

const TimelineItem = ({ log }: { log: UsageLog }) => {
  const categoryColor = categoryColors[log.category] || categoryColors.other;
  
  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  return (
    <div className="flex">
      <div className="flex flex-col items-center mr-4">
        <div className={`rounded-full w-3 h-3 ${categoryColor.split(' ')[0]}`} />
        <div className="flex-grow w-px bg-gray-200" />
      </div>
      <div className="pb-4 flex-1">
        <div className="flex justify-between items-start">
          <div>
            <span className="font-medium">
              {log.app || log.website}
            </span>
            <span 
              className={`text-xs px-2 py-0.5 rounded ml-2 ${categoryColor}`}
            >
              {log.category}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            {formatTime(log.startTime)}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {log.app 
            ? `Used ${log.app} for ${log.duration} minutes`
            : `Visited ${log.website} for ${log.duration} minutes`
          }
        </p>
      </div>
    </div>
  );
};

export default UsageTimeline;
