import { supabase } from "@/integrations/supabase/client";
import { RepairOrder } from "@/types";
import { validate as isUUID } from 'uuid'; // Import uuid validator

// Function to get all repair orders (alias for getRepairOrders for backward compatibility)
export const getOrders = async () => {
  return getRepairOrders();
};

// Function to get all repair orders
export const getRepairOrders = async () => {
  try {
    const { data, error } = await supabase
      .from('repair_orders')
      .select('*')
      .order('entry_date', { ascending: false });

    if (error) throw error;
    return data as RepairOrder[];
  } catch (error: any) {
    console.error('Error fetching repair orders:', error);
    return [];
  }
};

// Function to get repair orders by client ID
export const getClientRepairOrders = async (clientId: string) => {
  try {
    const { data, error } = await supabase
      .from('repair_orders')
      .select('*')
      .eq('client_id', clientId)
      .order('entry_date', { ascending: false });

    if (error) throw error;
    return data as RepairOrder[];
  } catch (error: any) {
    console.error('Error fetching client repair orders:', error);
    return [];
  }
};

// Function to get a repair order by ID (was called getRepairOrderById, adding alias getOrderById)
export const getOrderById = async (id?: string | null) => { // Accept null
  return getRepairOrderById(id);
};

// Function to get a repair order by ID
export const getRepairOrderById = async (id?: string | null) => { // Accept null
  if (!id || !isUUID(id)) { // Check if id is null, empty, or not a valid UUID
    console.warn(`Invalid or empty repair order ID provided: ${id}`);
    return null;
  }
  
  try {
    const { data, error } = await supabase
      .from('repair_orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Error fetching repair order:', error);
    return null;
  }
};

// Function to create a new repair order (alias for createRepairOrder)
export const createOrder = async (repairOrder: Omit<RepairOrder, "id" | "created_at" | "updated_at">) => {
  return createRepairOrder(repairOrder);
};

// Function to create a new repair order
export const createRepairOrder = async (repairOrder: Omit<RepairOrder, "id" | "created_at" | "updated_at">) => {
  try {
    const { data, error } = await supabase
      .from('repair_orders')
      .insert([repairOrder])
      .select()
      .single();

    if (error) throw error;
    return data as RepairOrder;
  } catch (error: any) {
    console.error('Error creating repair order:', error);
    throw error;
  }
};

// Function to update a repair order (alias for updateRepairOrder)
export const updateOrder = async (id: string, updates: Partial<RepairOrder>) => {
  return updateRepairOrder(id, updates);
};

// Function to update a repair order
export const updateRepairOrder = async (id: string, updates: Partial<RepairOrder>) => {
  try {
    const { data, error } = await supabase
      .from('repair_orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as RepairOrder;
  } catch (error: any) {
    console.error('Error updating repair order:', error);
    throw error;
  }
};

// Function to delete a repair order (alias for deleteRepairOrder)
export const deleteOrder = async (id: string) => {
  return deleteRepairOrder(id);
};

// Function to delete a repair order
export const deleteRepairOrder = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('repair_orders')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as RepairOrder;
  } catch (error: any) {
    console.error('Error deleting repair order:', error);
    throw error;
  }
};

// Alias for backward compatibility
export const fetchOrders = getRepairOrders;
