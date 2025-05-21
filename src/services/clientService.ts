
import { supabase } from "@/integrations/supabase/client";
import { Client } from "@/types";
import { toast } from "sonner";

export const getClients = async () => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('name');

    if (error) throw error;
    return data as Client[];
  } catch (error: any) {
    toast.error(`Error fetching clients: ${error.message}`);
    console.error('Error fetching clients:', error);
    return [];
  }
};

export const getClientById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Client;
  } catch (error: any) {
    toast.error(`Error fetching client: ${error.message}`);
    console.error('Error fetching client:', error);
    return null;
  }
};

export const createClient = async (client: Omit<Client, 'id' | 'created_at' | 'updated_at'>) => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .insert([client])
      .select()
      .single();

    if (error) throw error;
    toast.success('Cliente creado exitosamente');
    return data as Client;
  } catch (error: any) {
    toast.error(`Error creating client: ${error.message}`);
    console.error('Error creating client:', error);
    return null;
  }
};

export const updateClient = async (id: string, client: Partial<Omit<Client, 'id' | 'created_at' | 'updated_at'>>) => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .update(client)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    toast.success('Cliente actualizado exitosamente');
    return data as Client;
  } catch (error: any) {
    toast.error(`Error updating client: ${error.message}`);
    console.error('Error updating client:', error);
    return null;
  }
};

export const deleteClient = async (id: string) => {
  try {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);

    if (error) throw error;
    toast.success('Cliente eliminado exitosamente');
    return true;
  } catch (error: any) {
    toast.error(`Error deleting client: ${error.message}`);
    console.error('Error deleting client:', error);
    return false;
  }
};
