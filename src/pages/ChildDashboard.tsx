
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { useKidSafe } from "@/context/KidSafeContext";
import ChildLockScreen from "@/components/child/ChildLockScreen";
import ChildTimeDisplay from "@/components/child/ChildTimeDisplay";
import { Spinner } from "@/components/ui/spinner";

const ChildDashboard = () => {
  const { user, isChild } = useAuth();
  const { children } = useKidSafe();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (!isChild) {
    return <Navigate to="/" />;
  }
  
  // Display loading state while waiting for child profiles to load
  if (children.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-4">
        <Spinner size="lg" className="mb-4" />
        <p className="text-muted-foreground">Loading child profile...</p>
      </div>
    );
  }
  
  // Find the child profile that matches the logged in child user
  const childProfile = children.find((child) => 
    child.id === user.id.replace('child_', '')
  );
  
  if (!childProfile) {
    return <Navigate to="/login" />;
  }
  
  // If the device is locked, show lock screen
  if (childProfile.isLocked) {
    return (
      <div className="h-full flex items-center justify-center px-4">
        <ChildLockScreen user={user} />
      </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-center px-4">
      <ChildTimeDisplay child={childProfile} />
    </div>
  );
};

export default ChildDashboard;
