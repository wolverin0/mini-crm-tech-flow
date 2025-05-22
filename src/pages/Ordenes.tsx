import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchOrders,
  createOrder,
  updateOrder,
  deleteOrder,
} from "@/services/repairOrderService";
import { RepairOrder } from "@/types";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import OrderForm from "@/components/repairs/OrderForm";
import PageHeader from "@/components/layout/PageHeader";
import { FullScreenCard, DetailItem } from "@/components/ui/FullScreenCard";

const Ordenes = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<RepairOrder | null>(null);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const queryClient = useQueryClient();

  const {
    data: orders = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
  });

  const createOrderMutation = useMutation({
    mutationFn: (data: Omit<RepairOrder, "created_at" | "id" | "updated_at" | "order_number">) => createOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Orden creada exitosamente");
      setIsDialogOpen(false);
    },
    onError: (error) => {
      console.error("Error al crear orden:", error);
      toast.error("No se pudo crear la orden. Por favor, inténtalo de nuevo.");
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: (params: { id: string, updates: Partial<RepairOrder> }) => 
      updateOrder(params.id, params.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Orden actualizada exitosamente");
      setIsEditDialogOpen(false);
    },
    onError: (error) => {
      console.error("Error al actualizar orden:", error);
      toast.error("No se pudo actualizar la orden. Por favor, inténtalo de nuevo.");
    },
  });

  const deleteOrderMutation = useMutation({
    mutationFn: (id: string) => deleteOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Orden eliminada exitosamente");
    },
    onError: (error) => {
      console.error("Error al eliminar orden:", error);
      toast.error("No se pudo eliminar la orden. Por favor, inténtalo de nuevo.");
    },
  });

  const handleEditOrder = (order: RepairOrder) => {
    setSelectedOrder(order);
    setIsEditDialogOpen(true);
  };

  const handleDeleteOrder = (id: string) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta orden?")) {
      deleteOrderMutation.mutate(id);
    }
  };

  const handleCreateOrder = (data: Partial<RepairOrder>) => {
    const { order_number, ...dataWithoutOrderNumber } = data;
    createOrderMutation.mutate(dataWithoutOrderNumber as Omit<RepairOrder, "created_at" | "id" | "updated_at" | "order_number">);
  };

  const handleUpdateOrder = (data: Partial<RepairOrder>) => {
    if (selectedOrder) {
      updateOrderMutation.mutate({
        id: selectedOrder.id,
        updates: data
      });
    }
  };

  const filteredOrders = orders.filter(order => {
    if (!searchText) return true;
    const searchLower = searchText.toLowerCase();
    
    return (
      order.order_number?.toString().toLowerCase().includes(searchLower) ||
      order.equipment_type.toLowerCase().includes(searchLower) ||
      (order.equipment_brand && order.equipment_brand.toLowerCase().includes(searchLower)) ||
      (order.equipment_model && order.equipment_model.toLowerCase().includes(searchLower)) ||
      (order.status && order.status.toLowerCase().includes(searchLower))
    );
  });

  const pageCount = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    const statuses: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      "Ingresado": "default",
      "En diagnóstico": "secondary",
      "Esperando repuesto": "outline",
      "Esperando aprobación": "outline",
      "Reparado": "default",
      "Entregado": "secondary",
      "No reparado/Cancelado": "destructive"
    };
    return statuses[status] || "default";
  };

  return (
    <div className="container mx-auto py-10">
      <PageHeader
        title="Órdenes de Reparación"
        description="Gestión completa de órdenes de reparación."
      />
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-2xl font-bold">Listado de Órdenes</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar órdenes..."
                  className="pl-8 w-64"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="default">
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Orden
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[700px]">
                  <DialogHeader>
                    <DialogTitle>Crear Nueva Orden</DialogTitle>
                    <DialogDescription>
                      Completa los siguientes datos para crear una nueva orden de reparación.
                    </DialogDescription>
                  </DialogHeader>
                  <OrderForm
                    onSubmit={handleCreateOrder}
                    onCancel={() => setIsDialogOpen(false)}
                    isSubmitting={createOrderMutation.isPending}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin h-8 w-8 border-t-2 border-primary rounded-full" />
            </div>
          ) : isError ? (
            <div className="text-center py-8 text-destructive">
              Error al cargar las órdenes. Por favor, intenta nuevamente.
            </div>
          ) : (
            <>
              {paginatedOrders.length === 0 ? (
                <div className="text-center py-8">
                  No se encontraron órdenes
                </div>
              ) : (
                <div className="space-y-4 mt-4">
                  {paginatedOrders.map((order) => {
                    const details: DetailItem[] = [
                      { label: "Fecha", value: format(new Date(order.entry_date), "dd/MM/yyyy", { locale: es }) },
                      { label: "Equipo", value: `${order.equipment_type} ${order.equipment_brand || ""} ${order.equipment_model || ""}`.trim() },
                      { label: "Estado", value: <Badge variant={getStatusBadgeVariant(order.status)}>{order.status}</Badge> },
                      { label: "Presupuesto", value: order.budget ? `$${order.budget}` : "Pendiente" },
                      { label: "Cliente", value: order.client_name || "No especificado" }, // Assuming client_name exists
                    ];
                    return (
                      <FullScreenCard
                        key={order.id}
                        title={`Orden Nº ${order.order_number}`}
                        details={details}
                        onClick={() => {
                          setSelectedOrder(order);
                          setIsEditDialogOpen(true);
                        }}
                      />
                    );
                  })}
                </div>
              )}
              
              {/* Edit Order Dialog (triggered by FullScreenCard click) */}
              {selectedOrder && (
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                  <DialogContent className="sm:max-w-[700px]">
                    <DialogHeader>
                      <DialogTitle>Editar Orden {selectedOrder.order_number}</DialogTitle>
                      <DialogDescription>
                        Actualiza los datos de esta orden de reparación.
                      </DialogDescription>
                    </DialogHeader>
                    <OrderForm
                      initialData={selectedOrder}
                      onSubmit={handleUpdateOrder}
                      onCancel={() => setIsEditDialogOpen(false)}
                      isSubmitting={updateOrderMutation.isPending}
                    />
                  </DialogContent>
                </Dialog>
              )}

              {pageCount > 1 && (
                <div className="flex items-center justify-end space-x-2 py-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Página anterior</span>
                  </Button>
                  <div className="text-sm">
                    Página {currentPage} de {pageCount}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(pageCount, prev + 1))}
                    disabled={currentPage >= pageCount}
                  >
                    <ChevronRight className="h-4 w-4" />
                    <span className="sr-only">Página siguiente</span>
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Ordenes;
