
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Plus, Loader2, Building2, User } from "lucide-react";
import { Provider } from "@/types";
import { toast } from "sonner";
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
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
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
    onSuccess: () => {
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["providers"] });
      setIsDetailsDialogOpen(false);
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["providers"] });
      setIsDetailsDialogOpen(false);
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

  const handleProviderClick = (provider: Provider) => {
    setSelectedProvider(provider);
    setIsDetailsDialogOpen(true);
  };

  const handleCreateProvider = async (data: Partial<Provider>): Promise<any> => {
    if (!data.name) {
      toast.error("Por favor, complete el nombre del proveedor");
      return Promise.reject("Missing required fields");
    }
    
    const providerToCreate = {
      ...data,
      name: data.name,
      type: data.type || "persona",
    } as Omit<Provider, "id" | "created_at" | "updated_at">;
    
    return createProviderMutation.mutateAsync(providerToCreate);
  };

  const handleUpdateProvider = (updates: Partial<Provider>) => {
    if (selectedProvider) {
      updateProviderMutation.mutate({ id: selectedProvider.id, updates });
    }
  };

  const handleDeleteProvider = () => {
    if (selectedProvider) {
      deleteProviderMutation.mutate(selectedProvider.id);
    }
  };

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
                onSubmit={handleCreateProvider}
                onCancel={() => setIsCreateDialogOpen(false)}
                isSubmitting={createProviderMutation.isPending}
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
            <div className="rounded-md border overflow-x-auto"> {/* Added overflow-x-auto */}
              <div className="grid grid-cols-12 gap-4 p-4 font-medium text-muted-foreground bg-muted min-w-[600px]"> {/* Added min-width */} 
                <div className="col-span-4">Nombre</div>
                <div className="col-span-2">Tipo</div>
                <div className="col-span-2">CUIT/DNI</div>
                <div className="col-span-2">Teléfono</div>
                <div className="col-span-2">Email</div>
              </div>
              <div className="divide-y min-w-[600px]"> {/* Added min-width */} 
                {filteredProviders.length > 0 ? (
                  filteredProviders.map((provider) => (
                    <div
                      key={provider.id}
                      className="grid grid-cols-12 gap-4 p-4 hover:bg-muted/50 cursor-pointer"
                      onClick={() => handleProviderClick(provider)}
                    >
                      <div className="col-span-4">
                        <div>{provider.name}</div>
                        {provider.business_name && (
                          <div className="text-xs text-muted-foreground">{provider.business_name}</div>
                        )}
                      </div>
                      <div className="col-span-2 flex items-center">
                        {provider.type === "persona" ? (
                          <>
                            <User className="h-4 w-4 mr-1.5" />
                            <span>Persona</span>
                          </>
                        ) : (
                          <>
                            <Building2 className="h-4 w-4 mr-1.5" />
                            <span>Empresa</span>
                          </>
                        )}
                      </div>
                      <div className="col-span-2">{provider.tax_id || "-"}</div>
                      <div className="col-span-2">{provider.phone || "-"}</div>
                      <div className="col-span-2">{provider.email || "-"}</div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    No se encontraron proveedores
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {selectedProvider && (
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Detalles del Proveedor</DialogTitle>
            </DialogHeader>
            <ProviderDetails
              provider={selectedProvider}
              onUpdate={handleUpdateProvider}
              onDelete={handleDeleteProvider}
              isUpdating={updateProviderMutation.isPending}
              isDeleting={deleteProviderMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Proveedores;
