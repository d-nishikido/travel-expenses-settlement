import { useEffect, useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';

interface UseFormStorageProps<T> {
  form: UseFormReturn<T>;
  storageKey: string;
  excludeFields?: (keyof T)[];
}

export const useFormStorage = <T extends Record<string, any>>({
  form,
  storageKey,
  excludeFields = [],
}: UseFormStorageProps<T>) => {
  // Save form data to localStorage
  const saveToStorage = useCallback((data: T) => {
    try {
      const filteredData = Object.entries(data).reduce((acc, [key, value]) => {
        if (!excludeFields.includes(key as keyof T)) {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>);
      
      localStorage.setItem(storageKey, JSON.stringify(filteredData));
    } catch (error) {
      console.warn('Failed to save form data to localStorage:', error);
    }
  }, [storageKey, excludeFields]);

  // Load form data from localStorage
  const loadFromStorage = useCallback((): Partial<T> | null => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load form data from localStorage:', error);
    }
    return null;
  }, [storageKey]);

  // Clear form data from localStorage
  const clearStorage = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.warn('Failed to clear form data from localStorage:', error);
    }
  }, [storageKey]);

  // Auto-save on form changes
  useEffect(() => {
    const subscription = form.watch((data) => {
      saveToStorage(data as T);
    });

    return () => subscription.unsubscribe();
  }, [form, saveToStorage]);

  // Load data on mount
  useEffect(() => {
    const storedData = loadFromStorage();
    if (storedData) {
      Object.entries(storedData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          form.setValue(key as any, value);
        }
      });
    }
  }, [form, loadFromStorage]);

  return {
    saveToStorage,
    loadFromStorage,
    clearStorage,
  };
};