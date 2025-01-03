import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface SidebarItemProps {
  icon: React.ReactNode;
  text: string;
  active: boolean;
  onClick: () => void;
  badge?: number;
  showTooltip?: boolean;
  className?: string;
}

export const SidebarItem = ({ 
  icon, 
  text, 
  active, 
  onClick,
  badge,
  showTooltip = false,
  className
}: SidebarItemProps) => {
  const ItemContent = (
    <Button
      onClick={onClick}
      variant={active ? "default" : "ghost"}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 h-auto",
        "transition-all duration-200 relative group",
        "hover:shadow-md hover:scale-[1.02]",
        active && "shadow-lg",
        className
      )}
    >
      <div className="flex items-center gap-3 flex-1">
        <span className={cn(
          "flex items-center justify-center transition-colors",
          active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
        )}>
          {icon}
        </span>
        <span className={cn(
          "font-medium transition-colors",
          active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
        )}>
          {text}
        </span>
        {badge !== undefined && badge > 0 && (
          <Badge 
            variant={active ? "outline" : "default"} 
            className={cn(
              "ml-auto",
              active ? "bg-primary-foreground text-primary" : ""
            )}
          >
            {badge}
          </Badge>
        )}
      </div>

      {/* Indicator line for active state */}
      <div className={cn(
        "absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-l-full transition-all",
        active ? "bg-primary-foreground" : "bg-transparent group-hover:bg-muted-foreground/20"
      )} />
    </Button>
  );

  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {ItemContent}
          </TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            {text}
            {badge !== undefined && badge > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-primary/10 text-sm">
                {badge}
              </span>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return ItemContent;
};

export default SidebarItem;