
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useKidSafe } from "@/context/KidSafeContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface BlockedWebsiteManagerProps {
  childId: string;
}

const BlockedWebsiteManager = ({ childId }: BlockedWebsiteManagerProps) => {
  const { getChildById, addBlockedWebsite, removeBlockedWebsite } = useKidSafe();
  const [website, setWebsite] = useState("");
  
  const child = getChildById(childId);
  
  if (!child) return null;
  
  const handleAddWebsite = (e: React.FormEvent) => {
    e.preventDefault();
    if (website.trim()) {
      addBlockedWebsite(childId, website.trim());
      setWebsite("");
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Blocked Websites</CardTitle>
        <CardDescription>
          Manage which websites are blocked on {child.name}'s device
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddWebsite} className="flex gap-2 mb-4">
          <Input
            placeholder="e.g., facebook.com"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" className="bg-kidsafe-purple hover:bg-kidsafe-purple/90">
            Block
          </Button>
        </form>
        
        <div className="flex flex-wrap gap-2">
          {child.blockedWebsites.length > 0 ? (
            child.blockedWebsites.map((site) => (
              <Badge key={site} variant="secondary" className="flex items-center gap-1 py-1.5">
                {site}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => removeBlockedWebsite(childId, site)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No websites are currently blocked</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BlockedWebsiteManager;
