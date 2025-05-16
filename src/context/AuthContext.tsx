
import { User as KidsafeUser, UserRole } from "@/types/kidsafe";
import { createContext, useContext, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  user: KidsafeUser | null;
  isLoading: boolean;
  isParent: boolean;
  isChild: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, name: string, password: string) => Promise<void>;
  requestOTP: (email: string) => Promise<void>;
  verifyOTP: (email: string, token: string) => Promise<void>;
  logout: () => void;
  childLogin: (pin: string, childName: string) => Promise<void>;
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

  const signup = async (email: string, name: string, password: string) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        }
      });
      
      if (error) {
        toast({
          title: "Signup failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Account created",
        description: "Please verify your email to continue",
      });
      
      // Don't return data, just return without a value for Promise<void>
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        title: "Signup failed",
        description: "An error occurred during signup",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const requestOTP = async (email: string) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });
      
      if (error) {
        toast({
          title: "Failed to send verification email",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async (email: string, token: string): Promise<void> => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'signup',
      });
      
      if (error) {
        toast({
          title: "Verification failed",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      // On successful verification, the user will be automatically logged in
      // and the onAuthStateChange listener will update the user state
    } catch (error) {
      console.error("OTP verification error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const childLogin = async (pin: string, childName: string): Promise<void> => {
    try {
      setIsLoading(true);
      console.log(`Attempting to login child with name: ${childName} and PIN: ${pin}`);
      
      // For simplicity, child login is still mocked for now
      // In a real-world scenario, this would validate against a pin stored in the database
      if (pin === "1234") {
        // Get child data from our database by name
        const { data: childData, error } = await supabase
          .from('children')
          .select('*')
          .ilike('name', childName)
          .single();
        
        if (error || !childData) {
          console.error("Error fetching child profile:", error);
          toast({
            title: "Login failed",
            description: "Child profile not found. Please check the name and try again.",
            variant: "destructive",
          });
          return;
        }
        
        console.log("Found child data:", childData);
        
        const childProfile: KidsafeUser = {
          id: childData.id,
          email: `child_${childData.id}@example.com`, // Placeholder
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
        signup,
        requestOTP,
        verifyOTP,
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
