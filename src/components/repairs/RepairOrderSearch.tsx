import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Loader2, Check, Trash } from 'lucide-react'; // Added Trash icon
import { RepairOrder } from '@/types';
import { getClientRepairOrders } from '@/services/repairOrderService';
import { cn } from '@/lib/utils';
import { format } from 'date-fns'; // Imported format

interface RepairOrderSearchProps {
  clientId: string | null; // Client ID to filter orders by
  onOrderSelect: (order: RepairOrder | null) => void;
  selectedOrderId: string | null; // The currently selected order's UUID
  buttonText?: string;
}

const RepairOrderSearch = ({
  clientId,
  onOrderSelect,
  selectedOrderId,
  buttonText = "Seleccionar Orden de Reparación",
}: RepairOrderSearchProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch repair orders for the selected client
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['clientRepairOrders', clientId], // Query key includes clientId for caching
    queryFn: () => getClientRepairOrders(clientId!), // Fetch orders for the client
    enabled: !!clientId, // Only run the query if clientId is available
  });

  // Filter orders based on search query (optional, can be done on backend too)
  const filteredOrders = searchQuery
    ? orders.filter(order =>
        order.serial_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.reported_issue?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.equipment_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.equipment_brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.equipment_model?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : orders;

  const handleSelect = (order: RepairOrder | null) => {
    onOrderSelect(order);
    setIsOpen(false);
    setSearchQuery(''); // Clear search query on select
  };

  const selectedOrder = orders.find(order => order.id === selectedOrderId);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          className="w-full justify-between"
          disabled={!clientId || isLoading} // Disable if no client selected or loading
        >
          {selectedOrder ? 
             `#${selectedOrder.order_number || selectedOrder.id?.substring(0, 6)} - ${selectedOrder.equipment_type}` // Display order number or truncated ID
            : clientId ? (isLoading ? "Cargando ordenes..." : buttonText) : "Seleccionar Cliente Primero"}
          {isLoading && <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput
            placeholder="Buscar orden..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            {isLoading ? (
              <CommandEmpty>Cargando...</CommandEmpty>
            ) : filteredOrders.length === 0 ? (
              <CommandEmpty>No se encontraron ordenes</CommandEmpty>
            ) : (
              <CommandGroup>
                {filteredOrders.map((order) => (
                  <CommandItem
                    key={order.id}
                    value={order.id}
                    onSelect={() => handleSelect(order)}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        selectedOrderId === order.id
                          ? 'opacity-100'
                          : 'opacity-0'
                      )}
                    />
                    {`#${order.order_number || order.id?.substring(0, 6)} - ${order.equipment_type} (${format(new Date(order.entry_date), 'dd/MM/yyyy')})`}
                  </CommandItem>
                ))}
                 {/* Option to clear selection */}
                {selectedOrder && (
                   <CommandItem onSelect={() => handleSelect(null)}>
                     <Trash className="mr-2 h-4 w-4"/>
                     Limpiar selección
                   </CommandItem>
                )}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default RepairOrderSearch;
