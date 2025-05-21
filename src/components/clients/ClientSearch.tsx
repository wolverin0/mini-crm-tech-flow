
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getClients } from "@/services/clientService";
import { Client, ClientSearchProps } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { UserPlus, Search, UserCheck } from "lucide-react";
import ClientForm from "./ClientForm";

const ClientSearch = ({
  onSelectClient,
  onClientSelect,
  buttonText = "Buscar Cliente",
  showCreateButton = true,
  disabled = false,
  selectedClientId,
}: ClientSearchProps) => {
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: getClients,
  });

  const filteredClients = clients.filter((client) => {
    const query = searchQuery.toLowerCase();
    return (
      client.name.toLowerCase().includes(query) ||
      (client.email && client.email.toLowerCase().includes(query)) ||
      (client.phone && client.phone.toLowerCase().includes(query))
    );
  });

  const handleSelectClient = (client: Client) => {
    // Support both prop names for backward compatibility
    if (onClientSelect) onClientSelect(client);
    if (onSelectClient) onSelectClient(client);
    setIsCommandOpen(false);
    setSearchQuery("");
  };

  const handleCreateClient = (data: Client) => {
    setIsCreateDialogOpen(false);
  };

  // Get the selected client if any
  const selectedClient = selectedClientId
    ? clients.find((client) => client.id === selectedClientId)
    : undefined;

  return (
    <div>
      {selectedClient ? (
        <div className="flex items-center gap-2 p-2 rounded-md border border-border bg-background">
          <UserCheck className="h-4 w-4 text-muted-foreground" />
          <span>{selectedClient.name}</span>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto"
            onClick={() => setIsCommandOpen(true)}
            disabled={disabled}
            type="button"
          >
            Cambiar
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => setIsCommandOpen(true)}
          disabled={disabled}
          type="button"
        >
          <Search className="mr-2 h-4 w-4" />
          {buttonText}
        </Button>
      )}

      <Dialog open={isCommandOpen} onOpenChange={setIsCommandOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Buscar Cliente</DialogTitle>
          </DialogHeader>
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Nombre, Email o Teléfono..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              className="border-none focus:ring-0 outline-none"
            />
            <CommandList>
              <CommandEmpty>
                No se encontraron clientes.
                {showCreateButton && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      setIsCommandOpen(false);
                      setIsCreateDialogOpen(true);
                    }}
                    type="button"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Crear Nuevo Cliente
                  </Button>
                )}
              </CommandEmpty>
              <CommandGroup>
                {filteredClients.map((client) => (
                  <CommandItem
                    key={client.id}
                    value={client.id}
                    onSelect={() => handleSelectClient(client)}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{client.name}</span>
                      {client.email && (
                        <span className="text-xs text-muted-foreground">
                          {client.email}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
          {showCreateButton && (
            <div className="mt-4 flex justify-end">
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  setIsCommandOpen(false);
                  setIsCreateDialogOpen(true);
                }}
                type="button"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Crear Nuevo Cliente
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Cliente</DialogTitle>
          </DialogHeader>
          <ClientForm
            initialData={undefined}
            onSubmit={(data) => handleCreateClient(data as Client)}
            onCancel={() => setIsCreateDialogOpen(false)}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientSearch;
