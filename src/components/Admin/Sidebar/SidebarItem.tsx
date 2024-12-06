import React from 'react';
import { Button } from "@/components/ui/button";
import './SidebarItem.css';

interface SidebarItemProps {
  icon: React.ReactNode;
  text: string;
  active: boolean;
  onClick: () => void;
}

export const SidebarItem = ({ 
  icon, 
  text, 
  active, 
  onClick 
}: SidebarItemProps) => {
  return (
    <Button
      variant={active ? "default" : "outline"}
      onClick={onClick}
      className="sidebar-item"
    >
      <span className="sidebar-item-icon">
        {icon}
      </span>
      <span className="sidebar-item-text">
        {text}
      </span>
    </Button>
  );
};