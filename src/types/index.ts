export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  identification?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Provider {
  id: string;
  name: string;
  type: "persona" | "company";
  tax_id?: string;
  business_name?: string;
  contact_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ProviderSearchProps {
  onSelectProvider?: (provider: Provider) => void;
  onProviderSelect?: (provider: Provider) => void;
  buttonText?: string;
  showCreateButton?: boolean;
  disabled?: boolean;
  selectedProviderId?: string;
}

export interface Order {
  id: string;
  order_number: string;
  client_id: string;
  equipment_type: string;
  brand: string;
  model: string;
  serial_number?: string;
  reported_issue: string;
  diagnosis?: string;
  repair_status?: string;
  notes?: string;
  entry_date: string;
  estimated_completion_date?: string;
  completion_date?: string;
  warranty_expiration_date?: string;
  status: string;
  technician_id?: string;
  created_at: string;
  updated_at: string;
  client_name?: string;
  days_in_service?: number;
}

export interface RepairOrder {
  id: string;
  order_number: number | null; // Changed to number | null
  client_id: string;
  equipment_type: string;
  equipment_brand?: string | null;
  equipment_model?: string | null;
  serial_number?: string | null;
  reported_issue?: string | null;
  technical_diagnosis?: string | null;
  status: string;
  entry_date: string;
  estimated_delivery_date?: string | null;
  completion_date?: string | null;
  budget?: number | null;
  labor_cost?: number | null;
  parts_cost?: number | null;
  total_cost?: number | null;
  assigned_technician?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  client_id: string;
  issue_date: string;
  due_date?: string;
  amount?: number;
  subtotal: number;
  tax?: number;
  total: number;
  status: string;
  notes?: string;
  repair_order_id?: string | null;
  created_at: string;
  updated_at: string;
  afip_status?: string | null;
  afip_cae?: string | null;
  afip_expiration?: string | null;
  afip_doc_type?: string | null;
}

export interface Receipt {
  id: string;
  receipt_number: string;
  client_id: string;
  issue_date: string;
  amount: number;
  status: string;
  notes?: string | null;
  repair_order_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  client_id: string;
  invoice_id?: string | null;
  receipt_id?: string | null;
  amount: number;
  payment_method: string;
  payment_date: string;
  notes?: string | null;
  created_at: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  description?: string | null;
  category?: string | null;
  sku?: string | null;
  barcode?: string | null;
  quantity: number;
  cost_price: number;
  selling_price: number;
  minimum_stock?: number | null;
  supplier_id?: string | null;
  supplier?: string | null;
  location?: string | null;
  status?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  client_id?: string | null;
  assigned_to?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Balance {
  id: string;
  client_id: string;
  amount: number;
  updated_at: string;
}

export interface ClientSearchProps {
  onSelectClient?: (client: Client) => void;
  onClientSelect?: (client: Client) => void;
  buttonText?: string;
  showCreateButton?: boolean;
  disabled?: boolean;
  selectedClientId?: string | null;
}

export interface StockAdjustmentFormProps {
  item: InventoryItem;
  onSubmit: (adjustment: { quantity: number; operation: "add" | "subtract" }) => Promise<any>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  from_email: string;
  from_name: string;
}

export interface InventoryDetailsProps {
  item: InventoryItem;
  onEdit: () => void;
  onClose: () => void;
  onDelete?: () => void;
}

export interface InvoiceFormProps {
  initialData?: Partial<Invoice>;
  clientId?: string | null;
  repairOrderId?: string | null;
  onSubmit: (data: Partial<Invoice>) => Promise<any>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export interface ReceiptFormProps {
  initialData?: Partial<Receipt>;
  clientId?: string | null;
  repairOrderId?: string | null;
  onSubmit: (data: Partial<Receipt>) => Promise<any>;
  onCancel: () => void;
  isSubmitting: boolean;
}
