import { useState, useEffect } from "react";
import { Badge } from "./badge";
import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "./dropdown-menu";
import { cn } from "@/lib/utils";
import { Loader2, ChevronDown } from "lucide-react";

interface SelectOption {
  value: string;
  label: string;
  variant?: "default" | "destructive" | "outline" | "secondary";
}

interface EditableSelectProps {
  value: string;
  options: SelectOption[];
  className?: string;
  onSave: (value: string) => void;
  isLoading?: boolean;
  renderValue?: (value: string, option: SelectOption | undefined) => React.ReactNode;
}

export function EditableSelect({
  value,
  options,
  className,
  onSave,
  isLoading = false,
  renderValue,
}: EditableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const currentOption = options.find(option => option.value === value);

  const handleSelect = (selectedValue: string) => {
    if (selectedValue !== value) {
      onSave(selectedValue);
    }
    setIsOpen(false);
  };

  const defaultRenderValue = (val: string, option: SelectOption | undefined) => {
    if (!option) return val;
    
    return (
      <Badge variant={option.variant || "default"}>
        {option.label}
      </Badge>
    );
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "h-8 px-2 py-1 justify-start font-normal hover:bg-muted/50 transition-colors",
            isLoading && "opacity-60",
            className
          )}
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="w-3 h-3 mr-2 animate-spin" />}
          <div className="flex-1 flex items-center justify-between">
            {renderValue ? renderValue(value, currentOption) : defaultRenderValue(value, currentOption)}
            <ChevronDown className="w-3 h-3 ml-2" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[200px]">
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.value}
            checked={option.value === value}
            onCheckedChange={() => handleSelect(option.value)}
            className="cursor-pointer"
          >
            {option.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}