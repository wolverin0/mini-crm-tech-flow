
import { supabase } from "@/integrations/supabase/client";
import { InventoryItem } from "@/types";

export const getItems = async (): Promise<InventoryItem[]> => {
  const { data, error } = await supabase
    .from("inventory")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching inventory items:", error);
    throw error;
  }

  return data as InventoryItem[];
};

export const getItemById = async (id: string): Promise<InventoryItem> => {
  const { data, error } = await supabase
    .from("inventory")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching inventory item:", error);
    throw error;
  }

  return data as InventoryItem;
};

export const createItem = async (item: Omit<InventoryItem, "id" | "created_at" | "updated_at">): Promise<InventoryItem> => {
  const { data, error } = await supabase
    .from("inventory")
    .insert([item])
    .select()
    .single();

  if (error) {
    console.error("Error creating inventory item:", error);
    throw error;
  }

  return data as InventoryItem;
};

export const updateItem = async (id: string, updates: Partial<InventoryItem>): Promise<InventoryItem> => {
  const { data, error } = await supabase
    .from("inventory")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating inventory item:", error);
    throw error;
  }

  return data as InventoryItem;
};

export const deleteItem = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("inventory")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting inventory item:", error);
    throw error;
  }
};

export const adjustStock = async (id: string, quantity: number, operation: "add" | "subtract"): Promise<InventoryItem> => {
  // First, get the current item
  const item = await getItemById(id);
  
  // Calculate new quantity
  const newQuantity = operation === "add" 
    ? item.quantity + quantity 
    : item.quantity - quantity;
  
  // Update with new quantity
  return updateItem(id, { quantity: newQuantity });
};
