
import { ChildProfile } from "@/types/kidsafe";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useKidSafe } from "@/context/KidSafeContext";
import { useNavigate } from "react-router-dom";
import { Lock, Timer, Unlock } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ChildProfileCardProps {
  child: ChildProfile;
  isSelected?: boolean;
}

const ChildProfileCard = ({ child, isSelected }: ChildProfileCardProps) => {
  const { setSelectedChild, lockDevice, unlockDevice } = useKidSafe();
  const navigate = useNavigate();
  
  const timeUsedPercent = Math.min((child.usedTime / child.dailyTimeLimit) * 100, 100);
  const timeLeft = Math.max(child.dailyTimeLimit - child.usedTime, 0);
  const timeLeftHours = Math.floor(timeLeft / 60);
  const timeLeftMinutes = timeLeft % 60;
  
  const handleViewProfile = () => {
    setSelectedChild(child);
    navigate(`/child/${child.id}`);
  };
  
  const handleLockToggle = () => {
    if (child.isLocked) {
      unlockDevice(child.id);
    } else {
      lockDevice(child.id);
    }
  };
  
  return (
    <Card 
      className={cn(
        "border transition-all duration-200", 
        isSelected ? "border-kidsafe-purple shadow-md" : "hover:border-kidsafe-light-purple",
        child.isLocked ? "bg-slate-50" : ""
      )}
    >
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <Avatar className="h-12 w-12">
          <AvatarImage src={child.avatar} alt={child.name} />
          <AvatarFallback className="bg-kidsafe-light-purple text-white">
            {child.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="flex items-center gap-2">
            {child.name}
            {child.isOnline && (
              <span className="h-2 w-2 rounded-full bg-kidsafe-green inline-block"/>
            )}
          </CardTitle>
          <CardDescription>Age: {child.age}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pb-0">
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium">
            <span>Screen Time</span>
            <span>
              {child.usedTime} / {child.dailyTimeLimit} min
            </span>
          </div>
          <Progress 
            value={timeUsedPercent} 
            className={cn(
              "h-2",
              timeUsedPercent >= 90 ? "bg-red-200" : timeUsedPercent >= 75 ? "bg-orange-200" : "bg-green-200"
            )}
          />
        </div>
        
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Timer className="h-4 w-4 text-muted-foreground" />
            <span className={cn(
              "text-sm",
              timeUsedPercent >= 90 ? "text-kidsafe-red font-medium" : ""
            )}>
              {child.isLocked ? "Device Locked" : timeLeft > 0 ? `${timeLeftHours > 0 ? `${timeLeftHours}h ` : ""}${timeLeftMinutes}m left` : "Time's up"}
            </span>
          </div>
          
          <div className="flex items-center gap-1.5">
            {child.isLocked ? (
              <Unlock className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Lock className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="text-sm text-muted-foreground">
              {child.blockedWebsites.length} sites blocked
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-4">
        <Button variant="outline" size="sm" onClick={handleViewProfile}>
          View Profile
        </Button>
        <Button 
          variant={child.isLocked ? "outline" : "destructive"} 
          size="sm"
          onClick={handleLockToggle}
        >
          {child.isLocked ? "Unlock Device" : "Lock Device"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ChildProfileCard;
