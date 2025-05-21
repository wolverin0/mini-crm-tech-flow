import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import PageHeader from "@/components/layout/PageHeader";
import { toast } from "sonner";
import { getOrders } from "@/services/repairOrderService"; // Fixed: use getOrders instead of getRepairOrders
import { format } from "date-fns";
import { Calendar, Clock, Ticket, Filter, Plus, Search, ArrowUpDown, Loader2 } from "lucide-react";
import { getClients } from "@/services/clientService";
import ClientSearch from "@/components/clients/ClientSearch";
import { Client } from "@/types";

const Tickets = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    equipment_type: "",
    equipment_brand: "",
    equipment_model: "",
    serial_number: "",
    reported_issue: "",
    status: "Pendiente"
  });
  
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["repair_orders"],
    queryFn: getOrders
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: getClients
  });

  const filteredOrders = Array.isArray(orders) ? orders.filter(order => {
    const orderNumberString = order.order_number ? order.order_number.toString().toLowerCase() : "";
    const matchesSearch = 
      orderNumberString.includes(searchQuery.toLowerCase()) ||
      order.equipment_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.equipment_brand && order.equipment_brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.equipment_model && order.equipment_model.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) : [];

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : "Cliente no encontrado";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Ingresado":
        return <Badge className="bg-blue-500">Ingresado</Badge>;
      case "En Diagnóstico":
        return <Badge className="bg-purple-500">En Diagnóstico</Badge>;
      case "En Reparación":
        return <Badge className="bg-yellow-500 text-black">En Reparación</Badge>;
      case "Finalizado":
        return <Badge className="bg-green-500">Finalizado</Badge>;
      case "Entregado":
        return <Badge className="bg-gray-500">Entregado</Badge>;
      case "Cancelado":
        return <Badge className="bg-red-500">Cancelado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleClientSelect = (client: Client | null) => {
    setSelectedClientId(client ? client.id : null);
  };

  const handleCreateTicket = () => {
    if (!selectedClientId) {
      toast.error("Por favor seleccione un cliente");
      return;
    }
    
    if (!formData.equipment_type || !formData.reported_issue) {
      toast.error("Por favor complete los campos requeridos");
      return;
    }
    
    toast.success("Ticket creado exitosamente (simulado)");
    setIsCreateDialogOpen(false);
    
    setFormData({
      equipment_type: "",
      equipment_brand: "",
      equipment_model: "",
      serial_number: "",
      reported_issue: "",
      status: "Pendiente"
    });
    setSelectedClientId(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader 
        title="Tickets de Servicio"
        description="Gestión detallada de tickets de servicio técnico."
      />
      
      <Tabs defaultValue="all" className="w-full">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4">
          <TabsList className="mb-4 sm:mb-0">
            <TabsTrigger value="all" onClick={() => setStatusFilter("all")}>Todos</TabsTrigger>
            <TabsTrigger value="pendientes" onClick={() => setStatusFilter("Ingresado")}>Pendientes</TabsTrigger>
            <TabsTrigger value="en_proceso" onClick={() => setStatusFilter("En Reparación")}>En Proceso</TabsTrigger>
            <TabsTrigger value="finalizados" onClick={() => setStatusFilter("Finalizado")}>Finalizados</TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Ticket
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Ticket</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="client">Cliente</Label>
                    <ClientSearch 
                      onClientSelect={handleClientSelect} 
                      buttonText="Seleccionar Cliente" 
                      selectedClientId={selectedClientId || undefined}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="equipment_type">Tipo de Equipo *</Label>
                      <Select 
                        name="equipment_type" 
                        value={formData.equipment_type} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, equipment_type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Laptop">Laptop</SelectItem>
                          <SelectItem value="PC de Escritorio">PC de Escritorio</SelectItem>
                          <SelectItem value="Tablet">Tablet</SelectItem>
                          <SelectItem value="Smartphone">Smartphone</SelectItem>
                          <SelectItem value="Impresora">Impresora</SelectItem>
                          <SelectItem value="Monitor">Monitor</SelectItem>
                          <SelectItem value="Otro">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="equipment_brand">Marca</Label>
                      <Input
                        id="equipment_brand"
                        name="equipment_brand"
                        value={formData.equipment_brand}
                        onChange={handleInputChange}
                        placeholder="Marca del equipo"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="equipment_model">Modelo</Label>
                      <Input
                        id="equipment_model"
                        name="equipment_model"
                        value={formData.equipment_model}
                        onChange={handleInputChange}
                        placeholder="Modelo del equipo"
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="serial_number">Número de Serie</Label>
                      <Input
                        id="serial_number"
                        name="serial_number"
                        value={formData.serial_number}
                        onChange={handleInputChange}
                        placeholder="Número de serie"
                      />
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="reported_issue">Problema Reportado *</Label>
                    <Textarea
                      id="reported_issue"
                      name="reported_issue"
                      value={formData.reported_issue}
                      onChange={handleInputChange}
                      placeholder="Descripción del problema"
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateTicket}>
                    Crear Ticket
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <div className="mb-4 flex gap-2 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar tickets..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <TabsContent value="all" className="mt-0">
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredOrders.length > 0 ? (
                <div className="rounded-md border overflow-x-auto"> {/* Added overflow-x-auto */}
                  <div className="grid grid-cols-12 gap-2 p-4 text-sm font-medium text-muted-foreground bg-muted min-w-[700px]"> {/* Added min-width */} 
                    <div className="col-span-1">#</div>
                    <div className="col-span-2">Cliente</div>
                    <div className="col-span-2">Equipo</div>
                    <div className="col-span-3">Problema</div>
                    <div className="col-span-2">Fecha</div>
                    <div className="col-span-2">Estado</div>
                  </div>
                  <div className="divide-y min-w-[700px]"> {/* Added min-width */} 
                    {filteredOrders.map((order) => (
                      <div
                        key={order.id}
                        className="grid grid-cols-12 gap-2 p-4 text-sm hover:bg-muted/50 cursor-pointer items-center"
                      >
                        <div className="col-span-1 flex items-center">
                          <Ticket className="h-4 w-4 mr-2 text-muted-foreground" />
                          {order.order_number}
                        </div>
                        <div className="col-span-2 truncate">{getClientName(order.client_id)}</div>
                        <div className="col-span-2 truncate">
                          {order.equipment_type}
                          {order.equipment_brand && ` / ${order.equipment_brand}`}
                        </div>
                        <div className="col-span-3 truncate">{order.reported_issue || "No especificado"}</div>
                        <div className="col-span-2 flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          {format(new Date(order.entry_date), 'dd/MM/yyyy')}
                        </div>
                        <div className="col-span-2">{getStatusBadge(order.status)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  No se encontraron tickets
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Tickets;
