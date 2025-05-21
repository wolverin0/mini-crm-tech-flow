
import { supabase } from "@/integrations/supabase/client";
import { Provider } from "@/types";
import { toast } from "sonner";

export const getProviders = async (): Promise<Provider[]> => {
  const { data, error } = await supabase
    .from("providers")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching providers:", error);
    throw error;
  }

  return data as Provider[];
};

export const getProviderById = async (id: string): Promise<Provider> => {
  const { data, error } = await supabase
    .from("providers")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching provider:", error);
    throw error;
  }

  return data as Provider;
};

export const createProvider = async (provider: Omit<Provider, "id" | "created_at" | "updated_at">): Promise<Provider> => {
  const { data, error } = await supabase
    .from("providers")
    .insert([provider])
    .select()
    .single();

  if (error) {
    console.error("Error creating provider:", error);
    throw error;
  }

  return data as Provider;
};

export const updateProvider = async (id: string, updates: Partial<Provider>): Promise<Provider> => {
  const { data, error } = await supabase
    .from("providers")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating provider:", error);
    throw error;
  }

  return data as Provider;
};

export const deleteProvider = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("providers")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting provider:", error);
    throw error;
  }
};

export const searchProviders = async (query: string): Promise<Provider[]> => {
  const { data, error } = await supabase
    .from("providers")
    .select("*")
    .or(`name.ilike.%${query}%, business_name.ilike.%${query}%, tax_id.ilike.%${query}%`)
    .order("name");

  if (error) {
    console.error("Error searching providers:", error);
    throw error;
  }

  return data as Provider[];
};
