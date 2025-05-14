
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useKidSafe } from "@/context/KidSafeContext";
import { Navigate, Outlet } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

const ParentLayout = () => {
  const { user, isParent } = useAuth();
  const { loadChildProfiles } = useKidSafe();
  
  useEffect(() => {
    if (user && isParent) {
      // Load child profiles for the logged-in parent
      loadChildProfiles(user.id);
    }
  }, [user, isParent, loadChildProfiles]);
  
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
