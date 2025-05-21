
import { useState } from "react";

interface UseFormSubmitOptions<T, R> {
  onSubmit: (data: T) => Promise<R | null>;
  onSuccess?: (result: R) => void;
  onError?: (error: Error) => void;
}

export function useFormSubmit<T, R>({ 
  onSubmit, 
  onSuccess, 
  onError 
}: UseFormSubmitOptions<T, R>) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: T) => {
    setIsSubmitting(true);
    try {
      const result = await onSubmit(data);
      if (result && onSuccess) {
        onSuccess(result);
      }
      return result;
    } catch (error) {
      if (onError) {
        onError(error as Error);
      }
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleSubmit
  };
}
