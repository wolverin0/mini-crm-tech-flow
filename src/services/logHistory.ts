
import { supabase } from "@/integrations/supabase/client";

export interface HistoryLogEntry {
  table_name: string;
  record_id: string;
  action: string;
  details: string;
  user_id: string;
}

export const logHistory = async (data: HistoryLogEntry) => {
  try {
    const { error } = await supabase
      .from('action_history')
      .insert({
        entity_type: data.table_name,
        entity_id: data.record_id,
        action_type: data.action,
        description: data.details
      });

    if (error) {
      console.error("Error logging history:", error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error in logHistory:", error);
    // Don't throw here to prevent blocking main operations
    return false;
  }
};
