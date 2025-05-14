
import { User as KidsafeUser, UserRole } from "@/types/kidsafe";
import { createContext, useContext, useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  user: KidsafeUser | null;
  isLoading: boolean;
  isParent: boolean;
  isChild: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  childLogin: (pin: string, childId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<KidsafeUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          fetchUserProfile(session.user);
        } else {
          setUser(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user);
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (authUser: User) => {
    try {
      setIsLoading(true);
      
      // First, check if it's a parent login
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();
      
      if (profile) {
        // Parent login
        setUser({
          id: profile.id,
          email: profile.email,
          name: profile.name,
          role: profile.role as UserRole, // Cast the string to UserRole type
          avatar: profile.avatar
        });
      } else if (error) {
        // Check if it's a child login (stored in local storage)
        const childData = localStorage.getItem("kidsafe_child_user");
        if (childData) {
          const childUser = JSON.parse(childData);
          setUser(childUser);
        } else {
          console.error("Error fetching user profile:", error);
          toast({
            title: "Error loading profile",
            description: "There was an error loading your profile",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Error in fetchUserProfile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      // User will be set by the onAuthStateChange listener
      toast({
        title: "Logged in successfully",
        description: `Welcome back, ${data.user.email}`,
      });
      
      navigate('/');
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
      
      // For simplicity, child login is still mocked for now
      // In a real-world scenario, this would validate against a pin stored in the database
      if (pin === "1234") {
        // Get child data from our database
        const { data: childData, error } = await supabase
          .from('children')
          .select('*')
          .eq('id', childId)
          .single();
        
        if (error || !childData) {
          toast({
            title: "Login failed",
            description: "Invalid child profile",
            variant: "destructive",
          });
          return;
        }
        
        const childProfile: KidsafeUser = {
          id: childId,
          email: `child_${childId}@example.com`, // Placeholder
          name: childData.name,
          role: "child" as const,
          avatar: childData.avatar
        };
        
        // Store in local storage for persisting child sessions
        localStorage.setItem("kidsafe_child_user", JSON.stringify(childProfile));
        setUser(childProfile);
        
        toast({
          title: "Logged in successfully",
          description: `Welcome, ${childProfile.name}`,
        });
        
        navigate('/child');
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

  const logout = async () => {
    // Check if it's a child logout
    if (user?.role === 'child') {
      localStorage.removeItem("kidsafe_child_user");
      setUser(null);
      navigate('/login');
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
      return;
    }
    
    // It's a parent logout
    await supabase.auth.signOut();
    setUser(null);
    navigate('/login');
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
