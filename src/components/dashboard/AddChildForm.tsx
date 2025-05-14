
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useKidSafe } from "@/context/KidSafeContext";
import { UserPlus } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/components/ui/use-toast";

const AddChildForm = () => {
  const { addChild } = useKidSafe();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [age, setAge] = useState(10);
  const [deviceId, setDeviceId] = useState("");
  const [dailyTimeLimit, setDailyTimeLimit] = useState(120); // 2 hours default
  
  const handleAddChild = () => {
    if (!name || !deviceId) {
      toast({
        title: "Missing information",
        description: "Please fill out all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    addChild({
      name,
      age,
      deviceId,
      dailyTimeLimit,
      avatar: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      blockedWebsites: []
    });
    
    // Reset form and close dialog
    setName("");
    setAge(10);
    setDeviceId("");
    setDailyTimeLimit(120);
    setOpen(false);
  };
  
  const formatTimeLimit = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-kidsafe-purple hover:bg-kidsafe-purple/90">
          <UserPlus className="mr-2 h-4 w-4" />
          Add Child
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Child Profile</DialogTitle>
          <DialogDescription>
            Create a new profile for your child to monitor their device usage.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Child's name" 
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="age">Age: {age}</Label>
            <Slider
              id="age"
              min={1}
              max={18}
              step={1}
              value={[age]}
              onValueChange={(values) => setAge(values[0])}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="deviceId">Device ID</Label>
            <Input 
              id="deviceId" 
              value={deviceId} 
              onChange={(e) => setDeviceId(e.target.value)} 
              placeholder="Device identifier" 
            />
          </div>
          <div className="grid gap-2">
            <div className="flex justify-between">
              <Label htmlFor="timeLimit">Daily Time Limit</Label>
              <span className="text-sm text-muted-foreground">
                {formatTimeLimit(dailyTimeLimit)}
              </span>
            </div>
            <Slider
              id="timeLimit"
              min={30}
              max={480}
              step={15}
              value={[dailyTimeLimit]}
              onValueChange={(values) => setDailyTimeLimit(values[0])}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button className="bg-kidsafe-purple hover:bg-kidsafe-purple/90" onClick={handleAddChild}>
            Add Child
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddChildForm;
