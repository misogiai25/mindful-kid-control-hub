
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { useKidSafe } from "@/context/KidSafeContext";
import ChildLockScreen from "@/components/child/ChildLockScreen";
import ChildTimeDisplay from "@/components/child/ChildTimeDisplay";
import { Spinner } from "@/components/ui/spinner";
import { useEffect } from "react";

const ChildDashboard = () => {
  const { user, isChild } = useAuth();
  const { children, fetchAllChildProfiles } = useKidSafe();
  
  // Fetch all child profiles when component mounts
  useEffect(() => {
    fetchAllChildProfiles();
  }, [fetchAllChildProfiles]);
  
  console.log("Child dashboard - user:", user);
  console.log("Child dashboard - children:", children);
  
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
  const childProfile = children.find((child) => child.id === user.id);
  
  console.log("Child dashboard - found profile:", childProfile);
  
  if (!childProfile) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-4">
        <p className="text-red-500 mb-2">Child profile not found</p>
        <p className="text-muted-foreground">Please contact a parent for assistance</p>
      </div>
    );
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
