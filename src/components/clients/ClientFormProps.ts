
import { Client } from "@/types";

export interface ClientFormProps {
  initialData?: Partial<Client>;
  onSuccess: (client: Client) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}
