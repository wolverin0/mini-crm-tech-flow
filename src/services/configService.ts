
import { supabase } from "@/integrations/supabase/client";

export const getSystemConfig = async (key: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('system_configuration')
      .select('value')
      .eq('key', key)
      .maybeSingle(); // Changed from .single() to .maybeSingle()
    
    if (error && error.code !== 'PGRST116') { // PGRST116: 0 rows, not an error for maybeSingle()
        throw error;
    }
    return data?.value || null;
  } catch (error) {
    console.error(`Error fetching config for key ${key}:`, error);
    return null;
  }
};

export const setSystemConfig = async (key: string, value: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('system_configuration')
      .upsert({ key, value }, { onConflict: 'key' }) // Use upsert to create if not exists, or update if exists
      //.update({ value })
      //.eq('key', key);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Error updating config for key ${key}:`, error);
    return false;
  }
};

export const getOverdueThreshold = async (): Promise<number> => {
  const defaultThreshold = 7;
  try {
    const value = await getSystemConfig('overdue_days_threshold');
    return value ? parseInt(value, 10) : defaultThreshold;
  } catch (error) {
    return defaultThreshold;
  }
};
