
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useKidSafe } from "@/context/KidSafeContext";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Timer } from "lucide-react";

interface TimeLimitManagerProps {
  childId: string;
}

const TimeLimitManager = ({ childId }: TimeLimitManagerProps) => {
  const { getChildById, updateChild } = useKidSafe();
  
  const child = getChildById(childId);
  
  if (!child) return null;
  
  const formatTimeLimit = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours > 0 ? `${hours}h ` : ""}${mins}m`;
  };
  
  const handleTimeLimitChange = (values: number[]) => {
    updateChild(childId, { dailyTimeLimit: values[0] });
  };
  
  const resetUsedTime = () => {
    updateChild(childId, { usedTime: 0 });
  };
  
  const timeUsedPercent = Math.min((child.usedTime / child.dailyTimeLimit) * 100, 100);
  const timeLeft = Math.max(child.dailyTimeLimit - child.usedTime, 0);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Timer className="h-5 w-5" />
          Time Limits
        </CardTitle>
        <CardDescription>
          Set daily screen time limits for {child.name}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label>Daily Time Limit</Label>
              <span className="text-sm font-medium">{formatTimeLimit(child.dailyTimeLimit)}</span>
            </div>
            <Slider
              min={30}
              max={480}
              step={15}
              value={[child.dailyTimeLimit]}
              onValueChange={handleTimeLimitChange}
              className="my-4"
            />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label>Used Today</Label>
              <span className="text-sm font-medium">{formatTimeLimit(child.usedTime)}</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`h-full ${
                  timeUsedPercent >= 90 ? "bg-kidsafe-red" :
                  timeUsedPercent >= 70 ? "bg-kidsafe-orange" :
                  "bg-kidsafe-green"
                }`}
                style={{ width: `${timeUsedPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0m</span>
              <span>{formatTimeLimit(child.dailyTimeLimit)}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <div>
              <span className="text-sm font-medium block">
                Time remaining today
              </span>
              <span className={`text-lg font-bold ${timeLeft === 0 ? "text-kidsafe-red" : ""}`}>
                {formatTimeLimit(timeLeft)}
              </span>
            </div>
            <Button variant="outline" onClick={resetUsedTime}>
              Reset Usage
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimeLimitManager;
