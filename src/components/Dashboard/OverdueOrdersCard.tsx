
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { Clock, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getOverdueThreshold } from "@/services/configService";

interface OverdueOrder {
  id: string;
  order_number: string;
  client_name: string;
  equipment_type: string;
  status: string;
  days_in_service: number;
}

const OverdueOrdersCard = () => {
  const [overdueOrders, setOverdueOrders] = useState<OverdueOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [threshold, setThreshold] = useState(7);
  const { toast } = useToast();

  useEffect(() => {
    const fetchOverdueOrders = async () => {
      try {
        setLoading(true);
        
        // Get threshold from configuration
        const thresholdDays = await getOverdueThreshold();
        setThreshold(thresholdDays);
        
        // Fetch overdue orders using the DB function
        const { data, error } = await supabase
          .rpc('get_overdue_orders', { threshold_days: thresholdDays });
        
        if (error) throw error;
        
        setOverdueOrders(data || []);
      } catch (error) {
        console.error('Error fetching overdue orders:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar las órdenes atrasadas",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOverdueOrders();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  if (overdueOrders.length === 0) {
    return (
      <div className="p-2">
        <Alert className="bg-green-50 dark:bg-green-900/20">
          <Clock className="h-4 w-4" />
          <AlertTitle>Todo al día</AlertTitle>
          <AlertDescription>
            No hay órdenes atrasadas (más de {threshold} días).
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-2">
      <Alert className="bg-amber-50 dark:bg-amber-900/20">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Atención requerida</AlertTitle>
        <AlertDescription>
          {overdueOrders.length} {overdueOrders.length === 1 ? 'orden tiene' : 'órdenes tienen'} más de {threshold} días en el taller.
        </AlertDescription>
      </Alert>
      
      <div className="space-y-3">
        {overdueOrders.map((order) => (
          <div key={order.id} className="rounded-lg border bg-card p-3 text-card-foreground shadow-sm">
            <div className="grid grid-cols-2 gap-1">
              <div>
                <p className="text-sm font-medium">Orden #{order.order_number}</p>
                <p className="text-xs text-muted-foreground">Cliente: {order.client_name}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{order.equipment_type}</p>
                <p className="text-xs text-muted-foreground">
                  <span className="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 text-xs text-amber-800 dark:text-amber-200">
                    {order.days_in_service} días
                  </span>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OverdueOrdersCard;
