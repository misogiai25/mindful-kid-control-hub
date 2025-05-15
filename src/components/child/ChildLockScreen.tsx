
import { User } from "@/types/kidsafe";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Lock } from "lucide-react";

interface ChildLockScreenProps {
  user: User;
}

const ChildLockScreen = ({ user }: ChildLockScreenProps) => {
  const { logout } = useAuth();
  
  return (
    <Card className="w-full max-w-md mx-auto border-kidsafe-red">
      <CardHeader>
        <CardTitle className="flex items-center justify-center gap-2">
          <Lock className="h-5 w-5" />
          Device Locked
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8 text-center">
        <div>
          <h2 className="text-xl font-medium">Hi {user.name}</h2>
          <p className="mt-4 text-muted-foreground">
            Your access has been temporarily restricted by your parent.
          </p>
          <p className="mt-2 text-muted-foreground">
            Please check back later or contact your parent for help.
          </p>
        </div>
        
        <div className="flex justify-center pt-4">
          <Button variant="outline" onClick={logout}>
            Log out
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChildLockScreen;
