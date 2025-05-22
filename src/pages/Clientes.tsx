import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import ClientForm from "@/components/clients/ClientForm";
import ClientDetails from "@/components/clients/ClientDetails";
import { FullScreenCard, DetailItem } from "@/components/ui/FullScreenCard";
import { createClient, deleteClient, getClients, updateClient } from "@/services/clientService";
import { logAction } from "@/services/historyService";
import { Client } from "@/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PlusCircle, Search, Trash2, Pencil, Eye, MessageCircle } from "lucide-react"; 
import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import PageHeader from "@/components/layout/PageHeader"; // Import PageHeader

const Clientes = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: getClients,
  });

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (client.identification && client.identification.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (client.phone && client.phone.includes(searchQuery)) ||
    (client.email && client.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCreateClient = async (clientData: Partial<Client>) => {
    setIsSubmitting(true);
    try {
      const newClient = await createClient(clientData as Omit<Client, 'id' | 'created_at' | 'updated_at'>);
      if (newClient) {
        await logAction('create', 'client', newClient.id, `Cliente ${newClient.name} creado`);
        await queryClient.invalidateQueries({ queryKey: ["clients"] });
        setIsCreateDialogOpen(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClient = async (clientData: Partial<Client>) => {
    if (!selectedClient) return;
    setIsSubmitting(true);
    try {
      const updatedClient = await updateClient(selectedClient.id, clientData);
      if (updatedClient) {
        await logAction('update', 'client', updatedClient.id, `Cliente ${updatedClient.name} actualizado`);
        await queryClient.invalidateQueries({ queryKey: ["clients"] });
        setIsEditDialogOpen(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClient = async () => {
    if (!selectedClient) return;
    setIsSubmitting(true);
    try {
      const success = await deleteClient(selectedClient.id);
      if (success) {
        await logAction('delete', 'client', selectedClient.id, `Cliente ${selectedClient.name} eliminado`);
        await queryClient.invalidateQueries({ queryKey: ["clients"] });
        setIsDeleteDialogOpen(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const openWhatsApp = (phone: string | null) => {
    if (phone) {
      const cleanPhone = phone.replace(/\D/g, '');
      window.open(`https://wa.me/${cleanPhone}`, '_blank');
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <PageHeader title="Clientes" description="Gestiona la información de tus clientes" />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl">Listado de Clientes</CardTitle>
          <Button onClick={() => setIsCreateDialogOpen(true)} size="sm">
            <PlusCircle className="mr-2 h-4 w-4" /> Nuevo Cliente
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar cliente por nombre, DNI, teléfono o email..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <p>Cargando clientes...</p>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="flex justify-center py-8">
              <p>No se encontraron clientes.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredClients.map((client) => {
                const details: DetailItem[] = [
                  { label: "Teléfono", value: client.phone || "-" },
                  { label: "Email", value: client.email || "-" },
                  { label: "Identificación", value: client.identification || "-" },
                ];
                return (
                  <FullScreenCard
                    key={client.id}
                    title={client.name}
                    details={details}
                    onClick={() => {
                      setSelectedClient(client);
                      setIsViewDialogOpen(true);
                    }}
                  />
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Client Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo Cliente</DialogTitle>
            <DialogDescription>
              Ingresa los datos del nuevo cliente
            </DialogDescription>
          </DialogHeader>
          <ClientForm
            onSubmit={handleCreateClient}
            onCancel={() => setIsCreateDialogOpen(false)}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Client Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
            <DialogDescription>
              Actualiza los datos del cliente
            </DialogDescription>
          </DialogHeader>
          {selectedClient && (
            <ClientForm
              initialData={selectedClient}
              onSubmit={handleEditClient}
              onCancel={() => setIsEditDialogOpen(false)}
              isSubmitting={isSubmitting}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Client Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalles del Cliente</DialogTitle>
          </DialogHeader>
          {selectedClient && <ClientDetails client={selectedClient} />}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el cliente
              {selectedClient ? ` ${selectedClient.name}` : ''} de la base de datos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
                                 onClick={(e) => {
                e.preventDefault();
                handleDeleteClient();
              }}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Clientes;
