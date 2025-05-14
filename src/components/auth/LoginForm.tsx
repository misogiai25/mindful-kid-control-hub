
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { children } from "@/data/mockData";

const LoginForm = () => {
  const { login, childLogin, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [selectedChildId, setSelectedChildId] = useState("c1");
  
  const handleParentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };
  
  const handleChildLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await childLogin(pin, selectedChildId);
  };
  
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-center text-2xl text-kidsafe-purple">KidSafe</CardTitle>
        <CardDescription className="text-center">
          Parental control & usage monitor
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="parent">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="parent">Parent Login</TabsTrigger>
            <TabsTrigger value="child">Child Login</TabsTrigger>
          </TabsList>
          
          <TabsContent value="parent">
            <form onSubmit={handleParentLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="parent@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
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
                Demo login: parent@example.com / password
              </p>
            </form>
          </TabsContent>
          
          <TabsContent value="child">
            <form onSubmit={handleChildLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="child">Select Child</Label>
                <select
                  id="child"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={selectedChildId}
                  onChange={(e) => setSelectedChildId(e.target.value)}
                >
                  {children.map(child => (
                    <option key={child.id} value={child.id}>
                      {child.name}
                    </option>
                  ))}
                </select>
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
                Demo PIN for all children: 1234
              </p>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
