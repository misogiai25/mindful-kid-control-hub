
import { useEffect } from "react";
import LoginForm from "@/components/auth/LoginForm";
import { useAuth } from "@/context/AuthContext";
import { useKidSafe } from "@/context/KidSafeContext";
import { Navigate } from "react-router-dom";

const Login = () => {
  const { user } = useAuth();
  const { children: childProfiles, fetchAllChildProfiles } = useKidSafe();
  
  // Ensure child profiles are loaded on the login page
  useEffect(() => {
    // Fetch all child profiles for login form
    fetchAllChildProfiles();
    console.log("Child profiles in Login page:", childProfiles);
  }, [fetchAllChildProfiles]);
  
  // Redirect if already logged in
  if (user) {
    return <Navigate to="/" />;
  }
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
      <LoginForm />
      
      <div className="mt-8 text-center text-sm text-muted-foreground max-w-md">
        <p>
          KidSafe is a parental control application that helps you monitor and manage your children's screen time.
        </p>
      </div>
    </div>
  );
};

export default Login;
