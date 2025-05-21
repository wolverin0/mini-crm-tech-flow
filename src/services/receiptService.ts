
import { supabase } from "@/integrations/supabase/client";
import { Receipt } from "@/types";

export const getReceipts = async (): Promise<Receipt[]> => {
  const { data, error } = await supabase
    .from("receipts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching receipts:", error);
    throw error;
  }

  return data as Receipt[];
};

export const getReceiptById = async (id: string): Promise<Receipt> => {
  const { data, error } = await supabase
    .from("receipts")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching receipt:", error);
    throw error;
  }

  return data as Receipt;
};

export const getReceiptsByClient = async (clientId: string): Promise<Receipt[]> => {
  const { data, error } = await supabase
    .from("receipts")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching client receipts:", error);
    throw error;
  }

  return data as Receipt[];
};

export const createReceipt = async (receipt: Omit<Receipt, "id" | "created_at" | "updated_at" | "receipt_number">): Promise<Receipt> => {
  // Generate a temporary receipt number
  const receiptData = {
    ...receipt,
    receipt_number: `REC-${Date.now()}` // Temporary receipt number
  };

  const { data, error } = await supabase
    .from("receipts")
    .insert(receiptData)
    .select()
    .single();

  if (error) {
    console.error("Error creating receipt:", error);
    throw error;
  }

  return data as Receipt;
};

export const updateReceipt = async (id: string, updates: Partial<Receipt>): Promise<Receipt> => {
  const { data, error } = await supabase
    .from("receipts")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating receipt:", error);
    throw error;
  }

  return data as Receipt;
};

export const sendReceiptEmail = async (receiptId: string): Promise<void> => {
  // Mock implementation - this should be replaced with a real email service call
  console.log(`Sending email for receipt ${receiptId}`);
  
  // Simulate delay like a real API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return Promise.resolve();
};
