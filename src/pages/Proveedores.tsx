
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/dialog";
import { Search, Plus, Loader2, Building2, User, Eye, Pencil, Trash2, MessageCircle } from "lucide-react";
import { Provider } from "@/types";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { logAction } from "@/services/historyService";
import PageHeader from "@/components/layout/PageHeader";
import ProviderForm from "@/components/providers/ProviderForm";
import ProviderDetails from "@/components/providers/ProviderDetails";
import { 
  getProviders,
  createProvider,
  updateProvider,
  deleteProvider
} from "@/services/providerService";

const Proveedores = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch providers
  const { data: providers = [], isLoading } = useQuery({
    queryKey: ["providers"],
    queryFn: getProviders
  });

  // Create provider mutation
  const createProviderMutation = useMutation({
    mutationFn: (provider: Omit<Provider, "id" | "created_at" | "updated_at">) => 
      createProvider(provider),
    onSuccess: async (newProviderData) => {
      // Assuming createProvider returns the full provider object including its ID
      // If not, this logging might need adjustment or be moved to where ID is available
      // For now, let's assume `newProviderData` has `id` and `name`
      if (newProviderData && newProviderData.id && newProviderData.name) {
        await logAction('create', 'provider', newProviderData.id, `Proveedor ${newProviderData.name} creado`);
      } else {
        // Fallback logging if full object isn't returned, though less ideal
        await logAction('create', 'provider', 'unknown', `Nuevo proveedor creado (ID pendiente)`);
      }
      queryClient.invalidateQueries({ queryKey: ["providers"] });
      setIsCreateDialogOpen(false);
      toast.success("Proveedor creado exitosamente");
    },
    onError: (error) => {
      console.error("Error creating provider:", error);
      toast.error("Error al crear el proveedor");
    }
  });

  // Update provider mutation
  const updateProviderMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Provider> }) => 
      updateProvider(id, updates),
    onSuccess: async (updatedProviderData, variables) => {
      // Assuming updateProvider returns the updated provider object or we use variables
      // For logging, we might prefer the name from the updated data or fallback to variables.id
      const providerName = updatedProviderData?.name || variables.updates?.name || 'desconocido';
      await logAction('update', 'provider', variables.id, `Proveedor ${providerName} (ID: ${variables.id}) actualizado`);
      queryClient.invalidateQueries({ queryKey: ["providers"] });
      setIsEditDialogOpen(false);
      setIsViewDialogOpen(false); // Also close view dialog if open
      toast.success("Proveedor actualizado exitosamente");
    },
    onError: (error) => {
      console.error("Error updating provider:", error);
      toast.error("Error al actualizar el proveedor");
    }
  });

  // Delete provider mutation
  const deleteProviderMutation = useMutation({
    mutationFn: (id: string) => deleteProvider(id),
    onSuccess: async (_data, id) => {
      // We need a way to get the provider's name for logging, might need to fetch it before delete or pass it
      // For now, using ID. Ideally, find a way to log name.
      await logAction('delete', 'provider', id, `Proveedor ID: ${id} eliminado`);
      queryClient.invalidateQueries({ queryKey: ["providers"] });
      setIsDeleteDialogOpen(false);
      setIsViewDialogOpen(false); // Also close view dialog if open
      toast.success("Proveedor eliminado exitosamente");
    },
    onError: (error) => {
      console.error("Error deleting provider:", error);
      toast.error("Error al eliminar el proveedor");
    }
  });

  // Filter providers based on search query
  const filteredProviders = providers.filter(provider => 
    provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (provider.business_name && provider.business_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (provider.tax_id && provider.tax_id.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // --- Handler Functions for Dialogs & Actions ---
  const handleViewProvider = (provider: Provider) => {
    setSelectedProvider(provider);
    setIsViewDialogOpen(true);
  };

  const handleEditProvider = (provider: Provider) => {
    setSelectedProvider(provider);
    setIsEditDialogOpen(true);
  };

  const handleOpenDeleteDialog = (provider: Provider) => {
    setSelectedProvider(provider);
    setIsDeleteDialogOpen(true);
  };

  const handleCreateProviderSubmit = async (data: Omit<Provider, "id" | "created_at" | "updated_at">) => {
    // The type for data from ProviderForm should match what createProviderMutation expects
    // ProviderForm's onSubmit is (data: FormValues) => Promise<any>;
    // FormValues is z.infer<typeof formSchema> from ProviderForm
    // This function's signature matches the expected data type for the mutation.
    createProviderMutation.mutate(data);
  };
  
  const handleEditProviderSubmit = async (data: Partial<Provider>) => {
    if (!selectedProvider || !selectedProvider.id) {
      toast.error("No hay un proveedor seleccionado para actualizar.");
      return;
    }
    // Assuming data is of type FormValues from ProviderForm
    // We need to pass id and updates separately
    updateProviderMutation.mutate({ id: selectedProvider.id, updates: data });
  };

  const handleDeleteProviderConfirm = () => {
    if (selectedProvider && selectedProvider.id) {
      deleteProviderMutation.mutate(selectedProvider.id);
    } else {
      toast.error("No hay un proveedor seleccionado para eliminar.");
      setIsDeleteDialogOpen(false); // Close dialog if no provider is selected for some reason
    }
  };

  const openWhatsApp = (phone: string | null | undefined) => {
    if (phone) {
      // Ensure phone is treated as string before replace
      const phoneString = String(phone);
      // Basic cleaning: remove non-digits. More robust cleaning might be needed for various formats.
      let cleanedPhone = phoneString.replace(/\D/g, "");
      
      // Argentina specific: if it's 10 digits and doesn't start with 9, add 9 (for mobile)
      // This is a common case for numbers like "11 12345678" -> "91112345678"
      if (cleanedPhone.length === 10 && !cleanedPhone.startsWith("9")) {
         // Heuristic: if it's a common city code like 11 (Buenos Aires), 341 (Rosario), 351 (Cordoba), etc.
         // it's likely a mobile without the leading 9. This is very approximative.
         // A more robust solution would require a library or better validation.
        const commonCityCodes = ["11", "221", "223", "261", "299", "341", "342", "343", "351", "381", "387"];
        if (commonCityCodes.some(code => cleanedPhone.startsWith(code))) {
            // This is still a guess; not all 10-digit numbers are mobiles missing a 9.
        }
        // For now, let's assume if it's 10 digits, it might be a mobile missing the '9' after country code.
        // The safest bet is to just prepend 54 if it's not there.
        // The user might have stored it as 15XXXXXXXX or 11XXXXXXXX.
      }

      // Prepend 54 if not already present (international code for Argentina)
      if (!cleanedPhone.startsWith("54")) {
        cleanedPhone = "54" + cleanedPhone;
      }
      // Remove leading zeros after country code if any (e.g. 54011 -> 5411)
      if (cleanedPhone.startsWith("540")) {
        cleanedPhone = "54" + cleanedPhone.substring(3);
      }


      const whatsappUrl = `https://wa.me/${cleanedPhone}`;
      window.open(whatsappUrl, "_blank");
    } else {
      toast.error("El proveedor no tiene un número de teléfono registrado.");
    }
  };

  // --- Render ---
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Proveedores"
        description="Gestión de proveedores para productos y servicios."
      />
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Listado de Proveedores</CardTitle>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Proveedor
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Proveedor</DialogTitle>
              </DialogHeader>
              <ProviderForm 
                onSubmit={handleCreateProviderSubmit as any} // onSubmit expects Promise<any>, mutate is void
                onCancel={() => setIsCreateDialogOpen(false)}
                isSubmitting={createProviderMutation.isPending}
                initialData={undefined} // Explicitly pass undefined for clarity
              />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar proveedores..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead className="hidden md:table-cell">Email</TableHead>
                    <TableHead className="hidden lg:table-cell">CUIT/DNI</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProviders.length > 0 ? (
                    filteredProviders.map((provider) => (
                      <TableRow key={provider.id}>
                        <TableCell>
                          <div>{provider.name}</div>
                          {provider.business_name && (
                            <div className="text-xs text-muted-foreground">{provider.business_name}</div>
                          )}
                           <div className="text-xs text-muted-foreground flex items-center sm:hidden mt-1">
                            {provider.type === "persona" ? (
                              <><User className="h-3 w-3 mr-1" /> Persona</>
                            ) : (
                              <><Building2 className="h-3 w-3 mr-1" /> Empresa</>
                            )}
                            {provider.tax_id && <span className="ml-2">| CUIT/DNI: {provider.tax_id}</span>}
                          </div>
                        </TableCell>
                        <TableCell>{provider.phone || "-"}</TableCell>
                        <TableCell className="hidden md:table-cell">{provider.email || "-"}</TableCell>
                        <TableCell className="hidden lg:table-cell">{provider.tax_id || "-"}</TableCell>
                        <TableCell className="text-right space-x-1">
                          {provider.phone && (
                            <Button variant="ghost" size="icon" onClick={() => openWhatsApp(provider.phone)} title="WhatsApp">
                              <MessageCircle className="h-4 w-4 text-green-600" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => handleViewProvider(provider)} title="Ver">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleEditProvider(provider)} title="Editar">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleOpenDeleteDialog(provider)} title="Eliminar">
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-24">
                        No se encontraron proveedores.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* View Provider Dialog */}
      {selectedProvider && (
        <Dialog open={isViewDialogOpen} onOpenChange={(isOpen) => {
          setIsViewDialogOpen(isOpen);
          if (!isOpen) setSelectedProvider(null); // Clear selection when closing
        }}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Detalles del Proveedor</DialogTitle>
            </DialogHeader>
            <ProviderDetails
              provider={selectedProvider}
              onUpdate={(updates) => {
                // This allows ProviderDetails to directly trigger an update
                // Ensure it also closes the view dialog and potentially the edit dialog if open from here
                updateProviderMutation.mutate({ id: selectedProvider.id, updates });
              }}
              onDelete={() => {
                // This allows ProviderDetails to trigger delete confirmation
                setIsViewDialogOpen(false); // Close view dialog first
                handleOpenDeleteDialog(selectedProvider);
              }}
              isUpdating={updateProviderMutation.isPending}
              isDeleting={deleteProviderMutation.isPending}
              onOpenWhatsApp={openWhatsApp}
              // To control if ProviderDetails' own edit/delete buttons are shown,
              // or if we rely solely on table actions. For now, let them be.
              // We might add a prop like `showInternalActions={false}` if needed.
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Provider Dialog */}
      {selectedProvider && (
        <Dialog open={isEditDialogOpen} onOpenChange={(isOpen) => {
          setIsEditDialogOpen(isOpen);
          if (!isOpen) setSelectedProvider(null); // Clear selection when closing
        }}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Editar Proveedor</DialogTitle>
            </DialogHeader>
            <ProviderForm
              initialData={selectedProvider}
              onSubmit={handleEditProviderSubmit as any} // onSubmit expects Promise<any>, mutate is void
              onCancel={() => {
                setIsEditDialogOpen(false);
                setSelectedProvider(null);
              }}
              isSubmitting={updateProviderMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Provider Confirmation Dialog */}
      {selectedProvider && (
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={(isOpen) => {
            setIsDeleteDialogOpen(isOpen);
            if (!isOpen && !isViewDialogOpen && !isEditDialogOpen) { // Only clear if no other dialog is keeping it
                 setSelectedProvider(null);
            }
        }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Eliminación</AlertDialogTitle>
              <AlertDialogDescription>
                ¿Está seguro de que desea eliminar al proveedor "{selectedProvider.name}"? 
                Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setIsDeleteDialogOpen(false);
                // Check if we came from ViewDialog, if so, re-open it or handle state appropriately
                // For simplicity now, just closing delete dialog. If ViewDialog was open, it remains closed.
                // A more sophisticated approach might involve a state like 'originDialog'
                setSelectedProvider(null); // Clear selection on cancel
              }}>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteProviderConfirm}
                disabled={deleteProviderMutation.isPending}
                className="bg-destructive hover:bg-destructive/90"
              >
                {deleteProviderMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default Proveedores;
