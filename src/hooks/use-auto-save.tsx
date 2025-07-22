import { useCallback, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface AutoSaveOptions<T> {
  delay?: number;
  onSave: (rowId: string, field: string, value: unknown) => Promise<T>;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  queryKey?: string[];
}

export function useAutoSave<T = unknown>({
  delay = 500,
  onSave,
  onSuccess,
  onError,
  queryKey,
}: AutoSaveOptions<T>) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ rowId, field, value }: { rowId: string; field: string; value: unknown }) =>
      onSave(rowId, field, value),
    onSuccess: (data) => {
      toast.success("Changes saved successfully");
      if (queryKey) {
        queryClient.invalidateQueries({ queryKey });
      }
      onSuccess?.(data);
    },
    onError: (error: Error) => {
      toast.error(`Failed to save changes: ${error.message}`);
      onError?.(error);
    },
  });

  const debouncedSave = useCallback(
    (rowId: string, field: string, value: unknown) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        mutation.mutate({ rowId, field, value });
      }, delay);
    },
    [mutation, delay]
  );

  const cancelPendingSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  return {
    save: debouncedSave,
    cancel: cancelPendingSave,
    isLoading: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
}