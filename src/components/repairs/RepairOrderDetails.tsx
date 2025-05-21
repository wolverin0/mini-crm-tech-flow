
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RepairOrder } from "@/types";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface RepairOrderDetailsProps {
  repairOrder: RepairOrder & { clients: { name: string } };
}

const RepairOrderDetails = ({ repairOrder }: RepairOrderDetailsProps) => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return '-';
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "En diagnóstico":
        return "bg-blue-100 text-blue-700";
      case "Esperando repuesto":
        return "bg-yellow-100 text-yellow-700";
      case "Esperando aprobación":
        return "bg-purple-100 text-purple-700";
      case "Reparado":
        return "bg-green-100 text-green-700";
      case "Ingresado":
        return "bg-gray-100 text-gray-700";
      case "Entregado":
        return "bg-sky-100 text-sky-700";
      case "No reparado/Cancelado":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Orden #{repairOrder.order_number}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Cliente: {repairOrder.clients.name}</p>
            </div>
            <Badge className={getStatusBadgeClass(repairOrder.status)}>
              {repairOrder.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Equipo</p>
              <p className="text-base font-medium">{repairOrder.equipment_type}</p>
            </div>
            
            {repairOrder.equipment_brand && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Marca</p>
                <p className="text-base">{repairOrder.equipment_brand}</p>
              </div>
            )}
            
            {repairOrder.equipment_model && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Modelo</p>
                <p className="text-base">{repairOrder.equipment_model}</p>
              </div>
            )}
            
            {repairOrder.serial_number && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">No. Serie</p>
                <p className="text-base">{repairOrder.serial_number}</p>
              </div>
            )}
            
            {repairOrder.reported_issue && (
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-muted-foreground">Problema Reportado</p>
                <p className="text-base">{repairOrder.reported_issue}</p>
              </div>
            )}
            
            {repairOrder.technical_diagnosis && (
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-muted-foreground">Diagnóstico Técnico</p>
                <p className="text-base">{repairOrder.technical_diagnosis}</p>
              </div>
            )}
            
            {repairOrder.assigned_technician && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Técnico Asignado</p>
                <p className="text-base">{repairOrder.assigned_technician}</p>
              </div>
            )}
            
            <div>
              <p className="text-sm font-medium text-muted-foreground">Fecha de Ingreso</p>
              <p className="text-base">{formatDate(repairOrder.entry_date)}</p>
            </div>
            
            {repairOrder.estimated_delivery_date && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fecha Estimada de Entrega</p>
                <p className="text-base">{formatDate(repairOrder.estimated_delivery_date)}</p>
              </div>
            )}
          </div>
          
          <div className="border-t border-border pt-4 mt-4">
            <h3 className="text-lg font-medium mb-3">Costos</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Repuestos</p>
                <p className="text-base">{formatCurrency(repairOrder.parts_cost)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Mano de Obra</p>
                <p className="text-base">{formatCurrency(repairOrder.labor_cost)}</p>
              </div>
              <div className="font-medium">
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-base">{formatCurrency(repairOrder.total_cost)}</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-border pt-4 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>Creada: {formatDate(repairOrder.created_at)}</span>
              <span>Última actualización: {formatDate(repairOrder.updated_at)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RepairOrderDetails;
