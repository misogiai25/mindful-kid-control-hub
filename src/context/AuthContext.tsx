
import { User } from "@/types/kidsafe";
import { createContext, useContext, useEffect, useState } from "react";
import { currentUser } from "@/data/mockData";
import { useToast } from "@/components/ui/use-toast";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isParent: boolean;
  isChild: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  childLogin: (pin: string, childId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Check if user is already authenticated
  useEffect(() => {
    const storedUser = localStorage.getItem("kidsafe_user");
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would validate credentials with a backend
      if (email === "parent@example.com" && password === "password") {
        setUser(currentUser);
        localStorage.setItem("kidsafe_user", JSON.stringify(currentUser));
        toast({
          title: "Logged in successfully",
          description: `Welcome back, ${currentUser.name}`,
        });
      } else {
        toast({
          title: "Login failed",
          description: "Invalid email or password",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const childLogin = async (pin: string, childId: string) => {
    try {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would validate credentials with a backend
      if (pin === "1234") {
        // Find the child profile from our mock data
        const childProfile = {
          id: childId,
          email: `child_${childId}@example.com`,
          name: childId === "c1" ? "Emma" : childId === "c2" ? "Jack" : "Sophia",
          role: "child" as const,
          avatar: `/avatar-${childId}.png`
        };
        
        setUser(childProfile);
        localStorage.setItem("kidsafe_user", JSON.stringify(childProfile));
        toast({
          title: "Logged in successfully",
          description: `Welcome, ${childProfile.name}`,
        });
      } else {
        toast({
          title: "Login failed",
          description: "Invalid PIN",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Child login error:", error);
      toast({
        title: "Login failed",
        description: "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("kidsafe_user");
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isParent: user?.role === "parent",
        isChild: user?.role === "child",
        login,
        logout,
        childLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
