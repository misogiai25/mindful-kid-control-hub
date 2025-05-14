
import { useParams, Navigate } from "react-router-dom";
import { useKidSafe } from "@/context/KidSafeContext";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import BlockedWebsiteManager from "@/components/child/BlockedWebsiteManager";
import TimeLimitManager from "@/components/child/TimeLimitManager";
import UsageTimeline from "@/components/child/UsageTimeline";
import UsageChart from "@/components/reports/UsageChart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ChildProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { getChildById } = useKidSafe();
  const { isParent } = useAuth();
  const navigate = useNavigate();
  
  if (!id) return <Navigate to="/" />;
  
  const child = getChildById(id);
  
  if (!child) return <Navigate to="/" />;
  
  if (!isParent) return <Navigate to="/child" />;

  return (
    <div>
      <Button variant="ghost" onClick={() => navigate('/')} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to all children
      </Button>
      
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center mb-6">
        <Avatar className="h-20 w-20">
          <AvatarImage src={child.avatar} alt={child.name} />
          <AvatarFallback className="bg-kidsafe-light-purple text-white text-xl">
            {child.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">{child.name}</h1>
          <p className="text-muted-foreground">
            {child.age} years old • Device ID: {child.deviceId}
          </p>
        </div>
        <div className="md:ml-auto flex gap-3">
          <Button 
            variant={child.isLocked ? "outline" : "destructive"}
            onClick={() => {
              if (child.isLocked) {
                // Unlock logic
              } else {
                // Lock logic
              }
            }}
          >
            {child.isLocked ? "Unlock Device" : "Lock Device"}
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="overview">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2">
            <TimeLimitManager childId={id} />
            <UsageChart childId={id} />
          </div>
        </TabsContent>
        
        <TabsContent value="activity">
          <div className="grid gap-6 md:grid-cols-2">
            <UsageTimeline childId={id} />
            <UsageChart childId={id} />
          </div>
        </TabsContent>
        
        <TabsContent value="settings">
          <div className="grid gap-6 md:grid-cols-2">
            <BlockedWebsiteManager childId={id} />
            <TimeLimitManager childId={id} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChildProfile;
