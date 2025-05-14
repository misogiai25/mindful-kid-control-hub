
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import AddChildForm from "@/components/dashboard/AddChildForm";
import ChildProfileCard from "@/components/dashboard/ChildProfileCard";
import { useKidSafe } from "@/context/KidSafeContext";

const Index = () => {
  const { user, isParent, isChild } = useAuth();
  const { children, selectedChild } = useKidSafe();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  // Child users should be redirected to their specific page
  if (isChild) {
    return <Navigate to="/child" />;
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Children Profiles</h1>
        <AddChildForm />
      </div>
      
      {children.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {children.map((child) => (
            <ChildProfileCard 
              key={child.id} 
              child={child} 
              isSelected={selectedChild?.id === child.id}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border">
          <h2 className="text-xl font-medium mb-2">No Child Profiles Yet</h2>
          <p className="text-muted-foreground mb-6">
            Add your first child profile to start monitoring their device usage.
          </p>
        </div>
      )}
    </div>
  );
};

export default Index;
