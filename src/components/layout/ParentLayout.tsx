
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useKidSafe } from "@/context/KidSafeContext";
import { Navigate, Outlet } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const ParentLayout = () => {
  const { user, isParent } = useAuth();
  const kidSafeContext = useKidSafe();
  
  useEffect(() => {
    if (user && isParent && kidSafeContext) {
      // Load child profiles for the logged-in parent
      try {
        // The loadChildProfiles function doesn't exist in the KidSafeContextType interface
        // Instead, we'll use the fetchChildren functionality that's already implemented
        // No extra call needed as the KidSafeProvider already loads children profiles when a parent logs in
      } catch (error) {
        console.error("Failed to load child profiles:", error);
      }
    }
  }, [user, isParent, kidSafeContext]);
  
  // Redirect if not logged in or not a parent
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (!isParent) {
    useEffect(() => {
      toast({
        title: "Access Denied",
        description: "This area is for parents only",
        variant: "destructive"
      });
    }, []);
    
    return <Navigate to="/child" />;
  }
  
  return <Outlet />;
};

export default ParentLayout;
