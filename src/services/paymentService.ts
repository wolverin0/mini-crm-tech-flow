
import { supabase } from "@/integrations/supabase/client";
import { Payment } from "@/types";

// Function to get all payments
export const getPayments = async () => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('payment_date', { ascending: false });

    if (error) throw error;
    return data as Payment[];
  } catch (error: any) {
    console.error('Error fetching payments:', error);
    return [];
  }
};

// Function to get payments by client ID
export const getClientPayments = async (clientId: string) => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('client_id', clientId)
      .order('payment_date', { ascending: false });

    if (error) throw error;
    return data as Payment[];
  } catch (error: any) {
    console.error('Error fetching client payments:', error);
    return [];
  }
};

// Function to get payment by ID
export const getPaymentById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Payment;
  } catch (error: any) {
    console.error('Error fetching payment:', error);
    return null;
  }
};

// Function to create a new payment
export const createPayment = async (payment: Omit<Payment, "id" | "created_at">) => {
  try {
    // Ensure invoice_id is set to null if not provided
    const paymentData = {
      ...payment,
      invoice_id: payment.invoice_id || null,
      receipt_id: payment.receipt_id || null
    };
    
    const { data, error } = await supabase
      .from("payments")
      .insert(paymentData)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error("Error creating payment:", error);
    throw error;
  }
};

// Function to update a payment
export const updatePayment = async (id: string, updates: Partial<Payment>) => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Error updating payment:', error);
    throw error;
  }
};

// Function to delete a payment
export const deletePayment = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Error deleting payment:', error);
    throw error;
  }
};

// Function to get all client balances
export const getAllClientBalances = async () => {
  try {
    const { data, error } = await supabase
      .from('client_balances')
      .select('*');

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Error fetching client balances:', error);
    return [];
  }
};
