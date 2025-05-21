
import { supabase } from "@/integrations/supabase/client";

export const logAction = async (
  actionType: string,
  entityType: string,
  entityId: string,
  description: string
) => {
  try {
    await supabase.from('action_history').insert([
      { action_type: actionType, entity_type: entityType, entity_id: entityId, description }
    ]);
  } catch (error) {
    console.error('Error logging action:', error);
  }
};
