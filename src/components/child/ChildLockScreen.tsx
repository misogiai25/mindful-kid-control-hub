
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "@/types/kidsafe";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Clock, Lock } from "lucide-react";

const ChildLockScreen = ({ user }: { user: User }) => {
  const { logout } = useAuth();
  
  return (
    <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto text-center">
      <Card className="w-full animate-pulse-slow border-kidsafe-red">
        <CardHeader>
          <Lock className="h-8 w-8 mx-auto text-kidsafe-red" />
          <CardTitle className="text-kidsafe-red text-2xl">Device Locked</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg">
            Hi {user.name}, your screen time is up for today.
          </p>
          
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Clock className="h-5 w-5" />
            <span>Your device will unlock tomorrow</span>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Please contact your parents if you need access for schoolwork or other important activities.
          </p>
          
          <Button 
            variant="outline"
            onClick={logout}
            className="mt-8"
          >
            Log out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChildLockScreen;
