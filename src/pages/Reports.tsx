
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { useKidSafe } from "@/context/KidSafeContext";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import UsageChart from "@/components/reports/UsageChart";
import { toast } from "@/components/ui/use-toast";
import { useEffect } from "react";

const Reports = () => {
  const { user, isParent } = useAuth();
  const { children, selectedChild, setSelectedChild } = useKidSafe();
  
  // Ensure only parents can access this page
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (!isParent) {
    // Show toast when a child tries to access this page
    useEffect(() => {
      toast({
        title: "Access Denied",
        description: "Only parents can view reports.",
        variant: "destructive"
      });
    }, []);
    
    return <Navigate to="/child" />;
  }
  
  const handleChildChange = (childId: string) => {
    const child = children.find(c => c.id === childId);
    if (child) {
      setSelectedChild(child);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Usage Reports</h1>
      
      <div className="mb-6">
        <Select 
          value={selectedChild?.id} 
          onValueChange={handleChildChange}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select a child" />
          </SelectTrigger>
          <SelectContent>
            {children.map((child) => (
              <SelectItem key={child.id} value={child.id}>
                {child.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {selectedChild ? (
        <div className="grid gap-6 md:grid-cols-2">
          <UsageChart childId={selectedChild.id} />
          
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">Common Statistics</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Average daily usage</p>
                  <p className="text-xl font-medium">
                    {Math.round(selectedChild.usedTime / 7)} minutes
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Most used category</p>
                  <p className="text-xl font-medium">Entertainment</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Most visited website</p>
                  <p className="text-xl font-medium">youtube.com</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Most used app</p>
                  <p className="text-xl font-medium">Minecraft</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border">
          <h2 className="text-xl font-medium mb-2">Select a Child</h2>
          <p className="text-muted-foreground">
            Please select a child to view their usage reports.
          </p>
        </div>
      )}
    </div>
  );
};

export default Reports;
