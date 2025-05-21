export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      action_history: {
        Row: {
          action_type: string
          created_at: string
          description: string
          entity_id: string
          entity_type: string
          id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          description: string
          entity_id: string
          entity_type: string
          id?: string
        }
        Update: {
          action_type?: string
          created_at?: string
          description?: string
          entity_id?: string
          entity_type?: string
          id?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          identification: string | null
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          identification?: string | null
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          identification?: string | null
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      inventory: {
        Row: {
          cost_price: number
          created_at: string
          description: string | null
          id: string
          minimum_stock: number | null
          name: string
          quantity: number
          selling_price: number
          supplier: string | null
          updated_at: string
        }
        Insert: {
          cost_price: number
          created_at?: string
          description?: string | null
          id?: string
          minimum_stock?: number | null
          name: string
          quantity?: number
          selling_price: number
          supplier?: string | null
          updated_at?: string
        }
        Update: {
          cost_price?: number
          created_at?: string
          description?: string | null
          id?: string
          minimum_stock?: number | null
          name?: string
          quantity?: number
          selling_price?: number
          supplier?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          client_id: string
          created_at: string
          id: string
          invoice_number: string
          issue_date: string
          repair_order_id: string
          status: string
          subtotal: number
          tax: number | null
          total: number
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          invoice_number: string
          issue_date?: string
          repair_order_id: string
          status?: string
          subtotal: number
          tax?: number | null
          total: number
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          invoice_number?: string
          issue_date?: string
          repair_order_id?: string
          status?: string
          subtotal?: number
          tax?: number | null
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_balances"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_repair_order_id_fkey"
            columns: ["repair_order_id"]
            isOneToOne: false
            referencedRelation: "repair_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          inventory_item_id: string
          quantity: number
          repair_order_id: string
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          inventory_item_id: string
          quantity: number
          repair_order_id: string
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          inventory_item_id?: string
          quantity?: number
          repair_order_id?: string
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_repair_order_id_fkey"
            columns: ["repair_order_id"]
            isOneToOne: false
            referencedRelation: "repair_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          client_id: string
          created_at: string
          id: string
          invoice_id: string
          notes: string | null
          payment_date: string
          payment_method: string
        }
        Insert: {
          amount: number
          client_id: string
          created_at?: string
          id?: string
          invoice_id: string
          notes?: string | null
          payment_date?: string
          payment_method: string
        }
        Update: {
          amount?: number
          client_id?: string
          created_at?: string
          id?: string
          invoice_id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_payments_clients"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_balances"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "fk_payments_clients"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_payments_invoices"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_balances"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      providers: {
        Row: {
          address: string | null
          business_name: string | null
          contact_name: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          tax_id: string | null
          type: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          business_name?: string | null
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          tax_id?: string | null
          type?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          business_name?: string | null
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          tax_id?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      receipts: {
        Row: {
          amount: number
          client_id: string
          created_at: string
          id: string
          issue_date: string
          notes: string | null
          receipt_number: string
          repair_order_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          client_id: string
          created_at?: string
          id?: string
          issue_date?: string
          notes?: string | null
          receipt_number: string
          repair_order_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          client_id?: string
          created_at?: string
          id?: string
          issue_date?: string
          notes?: string | null
          receipt_number?: string
          repair_order_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "receipts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_balances"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "receipts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receipts_repair_order_id_fkey"
            columns: ["repair_order_id"]
            isOneToOne: false
            referencedRelation: "repair_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      repair_orders: {
        Row: {
          assigned_technician: string | null
          budget: number | null
          client_id: string
          created_at: string
          entry_date: string
          equipment_brand: string | null
          equipment_model: string | null
          equipment_type: string
          estimated_delivery_date: string | null
          id: string
          labor_cost: number | null
          order_number: string
          parts_cost: number | null
          reported_issue: string | null
          serial_number: string | null
          status: string
          technical_diagnosis: string | null
          total_cost: number | null
          updated_at: string
        }
        Insert: {
          assigned_technician?: string | null
          budget?: number | null
          client_id: string
          created_at?: string
          entry_date?: string
          equipment_brand?: string | null
          equipment_model?: string | null
          equipment_type: string
          estimated_delivery_date?: string | null
          id?: string
          labor_cost?: number | null
          order_number: string
          parts_cost?: number | null
          reported_issue?: string | null
          serial_number?: string | null
          status?: string
          technical_diagnosis?: string | null
          total_cost?: number | null
          updated_at?: string
        }
        Update: {
          assigned_technician?: string | null
          budget?: number | null
          client_id?: string
          created_at?: string
          entry_date?: string
          equipment_brand?: string | null
          equipment_model?: string | null
          equipment_type?: string
          estimated_delivery_date?: string | null
          id?: string
          labor_cost?: number | null
          order_number?: string
          parts_cost?: number | null
          reported_issue?: string | null
          serial_number?: string | null
          status?: string
          technical_diagnosis?: string | null
          total_cost?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "repair_orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_balances"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "repair_orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      system_configuration: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
    }
    Views: {
      client_balances: {
        Row: {
          balance: number | null
          client_id: string | null
          client_name: string | null
          total_invoiced: number | null
          total_paid: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_overdue_orders: {
        Args: { threshold_days: number }
        Returns: {
          id: string
          order_number: string
          client_id: string
          client_name: string
          equipment_type: string
          status: string
          entry_date: string
          days_in_service: number
        }[]
      }
      search_providers: {
        Args: { search_query: string }
        Returns: {
          address: string | null
          business_name: string | null
          contact_name: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          tax_id: string | null
          type: string
          updated_at: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
