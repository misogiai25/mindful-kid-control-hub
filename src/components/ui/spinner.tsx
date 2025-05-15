
import React from "react";
import { cn } from "@/lib/utils";
import { LoaderCircle } from "lucide-react";

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
}

export const Spinner = ({ 
  size = "md", 
  className, 
  ...props 
}: SpinnerProps) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div className={cn("animate-spin text-primary", sizeClasses[size], className)} {...props}>
      <LoaderCircle className="w-full h-full" />
    </div>
  );
};
