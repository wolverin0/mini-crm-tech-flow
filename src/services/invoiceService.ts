import { supabase } from "@/integrations/supabase/client";
import { Invoice } from "@/types";

export const getInvoices = async (): Promise<Invoice[]> => {
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching invoices:", error);
    throw error;
  }

  return data as Invoice[];
};

export const getInvoiceById = async (id: string): Promise<Invoice> => {
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching invoice:", error);
    throw error;
  }

  return data as Invoice;
};

export const getInvoicesByClient = async (clientId: string): Promise<Invoice[]> => {
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching client invoices:", error);
    throw error;
  }

  return data as Invoice[];
};

export const createInvoice = async (invoice: Omit<Invoice, "id" | "created_at" | "updated_at" | "invoice_number">): Promise<Invoice> => {
  // Generate a temporary invoice number for testing purposes
  // In a real app, this would be handled by the server or a dedicated service
  const tempInvoice = {
    ...invoice,
    invoice_number: `INV-${Date.now()}`, // Temporary solution
    repair_order_id: invoice.repair_order_id === '' ? null : invoice.repair_order_id, // Convert empty string to null
  };

  const { data, error } = await supabase
    .from("invoices")
    .insert([tempInvoice])
    .select()
    .single();

  if (error) {
    console.error("Error creating invoice:", error);
    throw error;
  }

  return data as Invoice;
};

export const updateInvoice = async (id: string, updates: Partial<Invoice>): Promise<Invoice> => {
  const { data, error } = await supabase
    .from("invoices")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating invoice:", error);
    throw error;
  }

  return data as Invoice;
};

export const generateAfipInvoice = async (invoiceId: string): Promise<void> => {
  // Normally this would make a call to AFIP API service
  // For now, we'll simulate success with a status update
  const updates = {
    afip_status: "Autorizada",
    afip_cae: "12345678901234",
    afip_expiration: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    status: "Emitida"
  };
  
  await updateInvoice(invoiceId, updates);
  
  return Promise.resolve();
};

export const sendInvoiceByEmail = async (invoiceId: string): Promise<void> => {
  // This would typically integrate with an email service
  // For now, just log and return
  console.log(`Sending email for invoice ${invoiceId}`);
  
  // Simulate delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return Promise.resolve();
};
