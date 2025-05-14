
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { Card } from "@/components/ui/card";

const Schedule = () => {
  const { user, isParent } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (!isParent) {
    return <Navigate to="/child" />;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Schedule Settings</h1>
      
      <Card className="p-6">
        <div className="flex items-center justify-center h-40">
          <p className="text-muted-foreground">
            Advanced scheduling features will be available in a future update.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Schedule;
