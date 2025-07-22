import { useState, useEffect, useRef, KeyboardEvent } from "react";
import { Input } from "./input";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface EditableInputProps {
  value: string | number;
  type?: "text" | "number";
  className?: string;
  onSave: (value: string | number) => void;
  isLoading?: boolean;
  placeholder?: string;
  validation?: (value: string | number) => string | null;
}

export function EditableInput({
  value,
  type = "text",
  className,
  onSave,
  isLoading = false,
  placeholder,
  validation,
}: EditableInputProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleClick = () => {
    if (!isLoading) {
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    if (validation) {
      const validationError = validation(editValue);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    setError(null);
    setIsEditing(false);
    
    if (editValue !== value) {
      onSave(editValue);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setError(null);
    setIsEditing(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = type === "number" ? parseFloat(e.target.value) || 0 : e.target.value;
    setEditValue(newValue);
    setError(null);
  };

  if (isEditing) {
    return (
      <div className="relative">
        <Input
          ref={inputRef}
          type={type}
          value={editValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className={cn(
            "h-8 text-sm",
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          placeholder={placeholder}
        />
        {error && (
          <div className="absolute top-full left-0 mt-1 text-xs text-destructive">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center min-h-8 px-2 py-1 text-sm cursor-pointer rounded hover:bg-muted/50 transition-colors",
        isLoading && "opacity-60",
        className
      )}
      onClick={handleClick}
    >
      {isLoading && <Loader2 className="w-3 h-3 mr-2 animate-spin" />}
      <span className="flex-1">
        {value || <span className="text-muted-foreground">{placeholder || "Click to edit"}</span>}
      </span>
    </div>
  );
}