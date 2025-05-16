
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { 
  InputOTP, 
  InputOTPGroup, 
  InputOTPSlot 
} from "@/components/ui/input-otp";
import { useOTP } from "@/hooks/use-otp";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useKidSafe } from "@/context/KidSafeContext";
import { Spinner } from "@/components/ui/spinner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Create validation schemas
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

const signupSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const LoginForm = () => {
  const { login, signup, verifyOTP, requestOTP, childLogin, isLoading } = useAuth();
  const { toast } = useToast();
  const { children: childProfiles, fetchAllChildProfiles } = useKidSafe();
  const [selectedChildId, setSelectedChildId] = useState("");
  const [pin, setPin] = useState("");
  const [currentView, setCurrentView] = useState<"login" | "signup" | "otp">("login");
  const [email, setEmail] = useState("");
  const [loadingChildren, setLoadingChildren] = useState(true);
  const { otp, handleOTPChange: updateOTP, getOTPString, resetOTP } = useOTP(6);
  
  // Fetch all child profiles when the login form loads
  useEffect(() => {
    const fetchChildren = async () => {
      setLoadingChildren(true);
      try {
        await fetchAllChildProfiles();
      } catch (error) {
        console.error("Error fetching children for login:", error);
      } finally {
        setLoadingChildren(false);
      }
    };
    
    fetchChildren();
  }, [fetchAllChildProfiles]);
  
  // Set default child when profiles are loaded
  useEffect(() => {
    if (childProfiles && childProfiles.length > 0 && !selectedChildId) {
      console.log("Setting default child ID:", childProfiles[0].id);
      setSelectedChildId(childProfiles[0].id);
    }
  }, [childProfiles, selectedChildId]);
  
  // Create forms
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const signupForm = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      name: "",
      password: "",
      confirmPassword: ""
    }
  });
  
  const handleParentLogin = async (values: z.infer<typeof loginSchema>) => {
    try {
      await login(values.email, values.password);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleParentSignup = async (values: z.infer<typeof signupSchema>) => {
    try {
      await signup(values.email, values.name, values.password);
      setEmail(values.email);
      setCurrentView("otp");
      toast({
        title: "Verification email sent",
        description: "Please check your email for the verification code",
      });
    } catch (error) {
      console.error("Signup error:", error);
    }
  };
  
  const handleChildLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChildId) {
      toast({
        title: "Select a child profile",
        description: "Please select a child profile to continue",
        variant: "destructive"
      });
      return;
    }

    // Find the child's name by their ID to pass to the childLogin function
    const selectedChild = childProfiles.find(child => child.id === selectedChildId);
    if (!selectedChild) {
      toast({
        title: "Child profile not found",
        description: "The selected child profile could not be found",
        variant: "destructive"
      });
      return;
    }

    try {
      // Pass the child's actual name as the second parameter
      await childLogin(pin, selectedChild.name);
    } catch (error) {
      console.error("Child login error:", error);
      toast({
        title: "Login failed",
        description: "Could not log in with the provided details",
        variant: "destructive"
      });
    }
  };

  const handleResendOTP = async () => {
    try {
      await requestOTP(email);
      toast({
        title: "Verification code resent",
        description: "Please check your email for the new verification code",
      });
      resetOTP();
    } catch (error) {
      console.error("Error resending OTP:", error);
      toast({
        title: "Failed to resend code",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  const handleVerifyOTP = async () => {
    try {
      const otpCode = getOTPString();
      if (otpCode.length < 6) {
        toast({
          title: "Invalid code",
          description: "Please enter all 6 digits of the verification code",
          variant: "destructive",
        });
        return;
      }
      
      await verifyOTP(email, otpCode);
      toast({
        title: "Email verified",
        description: "Your account has been verified successfully",
      });
      setCurrentView("login");
    } catch (error) {
      console.error("OTP verification error:", error);
      toast({
        title: "Verification failed",
        description: "Invalid or expired verification code",
        variant: "destructive",
      });
    }
  };
  
  // Helper function to handle OTP input changes
  const handleOTPInputChange = (index: number, value: string) => {
    if (updateOTP) {
      updateOTP(index, value ? value.toString() : "");
    }
  };

  // Add console logs to debug child profiles
  console.log("Child profiles in LoginForm:", childProfiles);
  console.log("Selected child ID:", selectedChildId);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-center text-2xl text-kidsafe-purple">KidSafe</CardTitle>
        <CardDescription className="text-center">
          Parental control & usage monitor
        </CardDescription>
      </CardHeader>
      <CardContent>
        {currentView === "otp" ? (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-medium">Verify your email</h3>
              <p className="text-sm text-muted-foreground">
                We've sent a 6-digit code to {email}
              </p>
            </div>
            
            <div className="flex flex-col items-center space-y-4">
              <InputOTP maxLength={6} className="gap-2">
                <InputOTPGroup>
                  {Array.from({ length: 6 }).map((_, index) => (
                    <InputOTPSlot 
                      key={index} 
                      index={index} 
                      onChange={(value) => handleOTPInputChange(index, value ? value.toString() : "")}
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
              
              <Button 
                onClick={handleVerifyOTP}
                className="w-full mt-4 bg-kidsafe-purple hover:bg-kidsafe-purple/90"
                disabled={isLoading}
              >
                {isLoading ? "Verifying..." : "Verify Email"}
              </Button>
              
              <div className="text-sm text-center mt-4">
                <span className="text-muted-foreground">Didn't receive the code? </span>
                <button 
                  onClick={handleResendOTP} 
                  className="text-kidsafe-purple hover:underline"
                  type="button"
                >
                  Resend
                </button>
              </div>
              
              <Button 
                variant="ghost" 
                className="mt-2" 
                onClick={() => setCurrentView("login")}
              >
                Back to login
              </Button>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="parent" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="parent">Parent Access</TabsTrigger>
              <TabsTrigger value="child">Child Login</TabsTrigger>
            </TabsList>
            
            <TabsContent value="parent">
              <Tabs defaultValue={currentView === "login" ? "login" : "signup"} onValueChange={(value) => setCurrentView(value as "login" | "signup")}>
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(handleParentLogin)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="parent@example.com" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="••••••••" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button
                        type="submit"
                        className="w-full bg-kidsafe-purple hover:bg-kidsafe-purple/90"
                        disabled={isLoading}
                      >
                        {isLoading ? "Logging in..." : "Login"}
                      </Button>
                      
                      <p className="text-xs text-center text-muted-foreground pt-2">
                        Demo login: parent@example.com / password
                      </p>
                    </form>
                  </Form>
                </TabsContent>
                
                <TabsContent value="signup">
                  <Form {...signupForm}>
                    <form onSubmit={signupForm.handleSubmit(handleParentSignup)} className="space-y-4">
                      <FormField
                        control={signupForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="parent@example.com" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={signupForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Your full name" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={signupForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="••••••••" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={signupForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="••••••••" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button
                        type="submit"
                        className="w-full bg-kidsafe-purple hover:bg-kidsafe-purple/90"
                        disabled={isLoading}
                      >
                        {isLoading ? "Creating Account..." : "Create Account"}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </TabsContent>
            
            <TabsContent value="child">
              {loadingChildren ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Spinner size="lg" className="mb-4" />
                  <p className="text-muted-foreground">Loading child profiles...</p>
                </div>
              ) : childProfiles.length === 0 ? (
                <div className="text-center py-8 space-y-4">
                  <p className="text-red-500">No child profiles available.</p>
                  <p className="text-muted-foreground">A parent must add child profiles first.</p>
                </div>
              ) : (
                <form onSubmit={handleChildLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="childSelect">Select Child</Label>
                    <Select 
                      value={selectedChildId} 
                      onValueChange={setSelectedChildId}
                    >
                      <SelectTrigger className="w-full" id="childSelect">
                        <SelectValue placeholder="Select a child" />
                      </SelectTrigger>
                      <SelectContent>
                        {childProfiles.map((child) => (
                          <SelectItem key={child.id} value={child.id}>
                            {child.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pin">PIN Code</Label>
                    <Input 
                      id="pin" 
                      type="password"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder="••••"
                      maxLength={4}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-kidsafe-purple hover:bg-kidsafe-purple/90"
                    disabled={isLoading}
                  >
                    {isLoading ? "Logging in..." : "Login"}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground pt-2">
                    Demo PIN: 1234
                  </p>
                </form>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default LoginForm;
