
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown, Loader2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Provider, ProviderSearchProps } from "@/types";
import { searchProviders } from "@/services/providerService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ProviderForm from "./ProviderForm";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const ProviderSearch = ({
  onSelectProvider,
  buttonText = "Seleccionar Proveedor",
  showCreateButton = true,
  disabled = false,
  selectedProviderId
}: ProviderSearchProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const queryClient = useQueryClient();

  const handleSelect = (provider: Provider) => {
    setSelectedProvider(provider);
    if (onSelectProvider) onSelectProvider(provider);
    setOpen(false);
  };

  const searchForProviders = async (query: string) => {
    setIsLoading(true);
    try {
      const results = await searchProviders(query);
      setProviders(results);
    } catch (error) {
      console.error("Error searching providers:", error);
      toast.error("Error al buscar proveedores");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search to prevent too many requests
    const timeoutId = setTimeout(() => {
      if (searchQuery.length > 1) {
        searchForProviders(searchQuery);
      } else if (searchQuery === "") {
        searchForProviders("");
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleCreateProvider = async (data: Partial<Provider>) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/providers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) throw new Error("Error creating provider");
      
      const newProvider = await response.json();
      
      queryClient.invalidateQueries({ queryKey: ["providers"] });
      setIsCreateDialogOpen(false);
      toast.success("Proveedor creado exitosamente");
      
      // Automatically select the newly created provider
      handleSelect(newProvider);
      
    } catch (error) {
      console.error("Error creating provider:", error);
      toast.error("Error al crear el proveedor");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            {selectedProvider ? selectedProvider.name : buttonText}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" style={{ width: "var(--radix-popover-trigger-width)" }}>
          <Command>
            <CommandInput 
              placeholder="Buscar proveedor..." 
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            {isLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <CommandList>
                <CommandEmpty>
                  No se encontraron proveedores.
                  {showCreateButton && (
                    <div className="pt-2">
                      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" className="mt-2 w-full">
                            <Plus className="mr-2 h-4 w-4" />
                            Crear Nuevo Proveedor
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[550px]">
                          <DialogHeader>
                            <DialogTitle>Crear Nuevo Proveedor</DialogTitle>
                          </DialogHeader>
                          <ProviderForm
                            onSubmit={handleCreateProvider}
                            onCancel={() => setIsCreateDialogOpen(false)}
                            isSubmitting={isSubmitting}
                          />
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </CommandEmpty>
                <CommandGroup>
                  {providers.map((provider) => (
                    <CommandItem
                      key={provider.id}
                      value={provider.id}
                      onSelect={() => handleSelect(provider)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedProviderId === provider.id || selectedProvider?.id === provider.id
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span>{provider.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {provider.tax_id && `CUIT/DNI: ${provider.tax_id}`}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            )}
            {showCreateButton && !isLoading && providers.length > 0 && (
              <div className="p-1 border-t">
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full text-sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Crear Nuevo Proveedor
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[550px]">
                    <DialogHeader>
                      <DialogTitle>Crear Nuevo Proveedor</DialogTitle>
                    </DialogHeader>
                    <ProviderForm
                      onSubmit={handleCreateProvider}
                      onCancel={() => setIsCreateDialogOpen(false)}
                      isSubmitting={isSubmitting}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ProviderSearch;
