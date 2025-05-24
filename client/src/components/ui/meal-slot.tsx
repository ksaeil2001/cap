import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface MealSlotProps {
  className?: string;
  children?: ReactNode;
  isFilled?: boolean;
  onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave?: (e: React.DragEvent<HTMLDivElement>) => void;
}

const MealSlot = ({
  className,
  children,
  isFilled = false,
  onDragOver,
  onDrop,
  onDragLeave,
}: MealSlotProps) => {
  return (
    <div
      className={cn(
        "meal-slot mb-4 p-4",
        isFilled && "filled",
        className
      )}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragLeave={onDragLeave}
    >
      {children ? (
        children
      ) : (
        <div className="text-center text-neutral-400 text-sm">
          <i className="ri-add-line"></i> Drop food here
        </div>
      )}
    </div>
  );
};

export default MealSlot;
