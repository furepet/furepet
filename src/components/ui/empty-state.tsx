import React from "react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState = ({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center gap-3 py-12 text-center animate-fade-in">
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
      <Icon className="h-8 w-8 text-primary" />
    </div>
    <h3 className="text-base font-semibold text-foreground">{title}</h3>
    <p className="text-sm text-muted-foreground max-w-xs">{description}</p>
    {actionLabel && onAction && (
      <Button onClick={onAction} className="mt-2">
        {actionLabel}
      </Button>
    )}
  </div>
);
