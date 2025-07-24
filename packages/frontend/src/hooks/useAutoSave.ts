import { useCallback, useEffect, useRef } from 'react';
import { UseFormReturn } from 'react-hook-form';

interface UseAutoSaveProps<T> {
  form: UseFormReturn<T>;
  onSave: (data: T) => Promise<void>;
  delay?: number;
  enabled?: boolean;
}

export const useAutoSave = <T extends Record<string, any>>({
  form,
  onSave,
  delay = 30000, // 30 seconds default
  enabled = true,
}: UseAutoSaveProps<T>) => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedRef = useRef<string>('');

  const triggerAutoSave = useCallback(async (data: T) => {
    if (!enabled) return;

    const currentData = JSON.stringify(data);
    
    // Only save if data has changed
    if (currentData !== lastSavedRef.current) {
      try {
        await onSave(data);
        lastSavedRef.current = currentData;
      } catch (error) {
        console.warn('Auto-save failed:', error);
      }
    }
  }, [onSave, enabled]);

  // Set up auto-save on form changes
  useEffect(() => {
    if (!enabled) return;

    const subscription = form.watch((data) => {
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        triggerAutoSave(data as T);
      }, delay);
    });

    return () => {
      subscription.unsubscribe();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [form, triggerAutoSave, delay, enabled]);

  // Manual save trigger
  const saveNow = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    const data = form.getValues();
    await triggerAutoSave(data);
  }, [form, triggerAutoSave]);

  return {
    saveNow,
  };
};