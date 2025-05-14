
import { ChildProfile } from "@/types/kidsafe";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Clock } from "lucide-react";

interface ChildTimeDisplayProps {
  child: ChildProfile;
}

const ChildTimeDisplay = ({ child }: ChildTimeDisplayProps) => {
  const { logout } = useAuth();
  
  const timeUsedPercent = Math.min((child.usedTime / child.dailyTimeLimit) * 100, 100);
  const timeLeft = Math.max(child.dailyTimeLimit - child.usedTime, 0);
  const timeLeftHours = Math.floor(timeLeft / 60);
  const timeLeftMinutes = timeLeft % 60;
  
  const isLowTime = timeLeft <= 15;
  
  return (
    <Card className={`w-full max-w-md mx-auto ${isLowTime ? 'border-kidsafe-red' : ''}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-center gap-2">
          <Clock className="h-5 w-5" />
          Your Screen Time
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="text-center">
          <h3 className="text-lg font-medium text-muted-foreground">Time remaining today</h3>
          <div className={`text-5xl font-bold mt-2 ${isLowTime ? 'text-kidsafe-red time-limit-alert' : ''}`}>
            {timeLeftHours > 0 && `${timeLeftHours}h `}
            {timeLeftMinutes}m
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Used</span>
            <span>{child.usedTime} / {child.dailyTimeLimit} minutes</span>
          </div>
          <Progress 
            value={timeUsedPercent} 
            className={`h-3 progress-gradient`}
          />
        </div>
        
        {isLowTime && (
          <div className="bg-red-50 border border-red-100 rounded-md p-3 text-center">
            <p className="text-kidsafe-red font-medium">
              Warning: You're almost out of screen time!
            </p>
          </div>
        )}
        
        <div className="flex justify-center pt-4">
          <Button variant="outline" onClick={logout}>
            Log out
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChildTimeDisplay;
