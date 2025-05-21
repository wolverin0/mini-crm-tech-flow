import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { MoreVertical, Edit, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import PageHeader from "@/components/layout/PageHeader";
import ClientForm from "@/components/clients/ClientForm";
import { Client } from "@/types";
import { getClients, createClient, updateClient, deleteClient } from "@/services/clientService";
import { getAllClientBalances } from "@/services/paymentService";

const ClientAccounts = () => {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);

  // Fetch clients and client balances
  const { data: clients = [], isLoading: isLoadingClients, refetch: refetchClients } = useQuery({
    queryKey: ["clients"],
    queryFn: getClients,
  });

  const { data: balances = [] } = useQuery({
    queryKey: ["clientBalances"],
    queryFn: getAllClientBalances
  });

  // Client CRUD mutations
  const createClientMutation = createClient;
  const updateClientMutation = updateClient;
  const deleteClientMutation = deleteClient;

  // Handlers for client CRUD operations
  const handleCreateClient = async (data: Partial<Client>) => {
    try {
      await createClientMutation(data as Omit<Client, "id" | "created_at" | "updated_at">);
      toast.success("Cliente creado exitosamente");
      refetchClients(); // Refresh client list
    } catch (error: any) {
      toast.error(`Error al crear cliente: ${error.message}`);
    } finally {
      setOpen(false); // Close the dialog
    }
  };

  const handleUpdateClient = async (id: string, data: Partial<Client>) => {
    try {
      await updateClientMutation(id, data);
      toast.success("Cliente actualizado exitosamente");
      refetchClients(); // Refresh client list
    } catch (error: any) {
      toast.error(`Error al actualizar cliente: ${error.message}`);
    } finally {
      setEditClient(null); // Close the edit form
    }
  };

  const handleDeleteClient = async (id: string) => {
    try {
      await deleteClientMutation(id);
      toast.success("Cliente eliminado exitosamente");
      refetchClients(); // Refresh client list
    } catch (error: any) {
      toast.error(`Error al eliminar cliente: ${error.message}`);
    }
  };

  // Filter clients based on search input
  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(search.toLowerCase())
  );

  // Find client data and balance for selected client ID
  const clientData = clients.find(client => client.id === clientId);
  const clientBalance = balances.find(balance => balance.client_id === clientId);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Cuentas de Clientes"
        description="Administrar cuentas de clientes y saldos."
      />

      <div className="md:flex md:items-center md:justify-between space-y-3 md:space-y-0">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Clientes</h2>
          <p className="text-sm text-muted-foreground">
            Administrar clientes y ver sus saldos.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>Agregar Cliente</Button>
      </div>

      <div className="flex items-center space-x-2">
        <Input
          type="search"
          placeholder="Buscar clientes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {isLoadingClients ? (
          <div className="text-center py-8">Cargando clientes...</div>
        ) : filteredClients.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <p className="text-muted-foreground mb-4">
                No se encontraron clientes.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredClients.map((client) => (
            <Card key={client.id} onClick={() => setClientId(client.id)} className="cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{client.name}</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Abrir menú</span>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setEditClient(client)}>
                      <Edit className="mr-2 h-4 w-4" /> Editar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleDeleteClient(client.id)}>
                      <Trash className="mr-2 h-4 w-4" /> Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={`https://avatar.vercel.sh/${client.name}.png`} />
                    <AvatarFallback>{client.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium leading-none">{client.email}</p>
                    <p className="text-sm text-muted-foreground">
                      {client.phone}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {clientId && clientData ? (
        <Card>
          <CardHeader>
            <CardTitle>Detalles del Cliente</CardTitle>
            <CardDescription>Información detallada del cliente.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Nombre</Label>
                <Input type="text" value={clientData.name} readOnly />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={clientData.email || "N/A"} readOnly />
              </div>
              <div>
                <Label>Teléfono</Label>
                <Input type="tel" value={clientData.phone || "N/A"} readOnly />
              </div>
              <div>
                <Label>Dirección</Label>
                <Input type="text" value={clientData.address || "N/A"} readOnly />
              </div>
              <div>
                <Label>Identificación</Label>
                <Input type="text" value={clientData.identification || "N/A"} readOnly />
              </div>
            </div>
            <div className="border rounded-md p-4 bg-muted/50">
              <h3 className="font-medium mb-2">Saldo del Cliente</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Saldo actual del cliente.
              </p>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-lg font-bold">
                    ${clientBalance ? clientBalance.balance?.toLocaleString('es-AR') : '0'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Total Invertido: ${clientBalance ? clientBalance.total_invoiced?.toLocaleString('es-AR') : '0'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Total Pagado: ${clientBalance ? clientBalance.total_paid?.toLocaleString('es-AR') : '0'}
                  </p>
                </div>
                <Badge variant="outline">
                  {clientBalance && clientBalance.balance !== null && clientBalance.balance > 0 ? 'Deudor' : 'Al día'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Alert>
          <AlertTitle>Seleccione un Cliente</AlertTitle>
          <AlertDescription>
            Seleccione un cliente para ver sus detalles.
          </AlertDescription>
        </Alert>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Crear Cliente</DialogTitle>
            <DialogDescription>
              Crear un nuevo cliente para administrar sus cuentas.
            </DialogDescription>
          </DialogHeader>
          <ClientForm
            onSubmit={handleCreateClient}
            onCancel={() => setOpen(false)}
            isSubmitting={false}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editClient} onOpenChange={(open) => !open && setEditClient(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
            <DialogDescription>
              Editar la información del cliente.
            </DialogDescription>
          </DialogHeader>
          <ClientForm
            initialData={editClient}
            onSubmit={(data) => editClient && handleUpdateClient(editClient.id, data)}
            onCancel={() => setEditClient(null)}
            isSubmitting={false}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientAccounts;
