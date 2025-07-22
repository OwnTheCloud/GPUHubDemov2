import { ReactNode } from "react";
import { EditableInput } from "./editable-input";
import { EditableSelect } from "./editable-select";
import { cn } from "@/lib/utils";

interface SelectOption {
  value: string;
  label: string;
  variant?: "default" | "destructive" | "outline" | "secondary";
}

interface EditableCellProps {
  value: unknown;
  type?: "text" | "number" | "select";
  options?: SelectOption[];
  className?: string;
  onSave: (value: unknown) => void;
  isLoading?: boolean;
  placeholder?: string;
  validation?: (value: unknown) => string | null;
  renderValue?: (value: unknown, option?: SelectOption) => ReactNode;
  children?: ReactNode;
}

export function EditableCell({
  value,
  type = "text",
  options = [],
  className,
  onSave,
  isLoading = false,
  placeholder,
  validation,
  renderValue,
  children,
}: EditableCellProps) {
  if (children) {
    return <div className={cn("w-full", className)}>{children}</div>;
  }

  if (type === "select" && options.length > 0) {
    return (
      <EditableSelect
        value={value}
        options={options}
        className={className}
        onSave={onSave}
        isLoading={isLoading}
        renderValue={renderValue}
      />
    );
  }

  return (
    <EditableInput
      value={value}
      type={type as "text" | "number"}
      className={className}
      onSave={onSave}
      isLoading={isLoading}
      placeholder={placeholder}
      validation={validation}
    />
  );
}