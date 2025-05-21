
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Removed CardDescription
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Search, Trash } from "lucide-react";
import { toast } from "sonner";
import InventoryTable from "@/components/inventory/InventoryTable";
import InventoryForm from "@/components/inventory/InventoryForm";
import InventoryDetails from "@/components/inventory/InventoryDetails";
import StockAdjustmentForm from "@/components/inventory/StockAdjustmentForm";
import { 
  getItems, 
  createItem, 
  updateItem, 
  deleteItem, 
  adjustStock 
} from "@/services/inventoryService";
import { InventoryItem } from "@/types";
import PageHeader from "@/components/layout/PageHeader"; // Import PageHeader

const Inventario = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isStockAdjustmentDialogOpen, setIsStockAdjustmentDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["inventory"],
    queryFn: getItems
  });

  const createMutation = useMutation({
    mutationFn: (item: Omit<InventoryItem, "id" | "created_at" | "updated_at">) => createItem(item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      setIsCreateDialogOpen(false);
      toast.success("Producto creado exitosamente");
    },
    onError: (error) => {
      console.error("Error creating item:", error);
      toast.error("Error al crear el producto");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<InventoryItem> }) => 
      updateItem(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      setIsEditDialogOpen(false);
      setIsDetailsDialogOpen(false);
      toast.success("Producto actualizado exitosamente");
    },
    onError: (error) => {
      console.error("Error updating item:", error);
      toast.error("Error al actualizar el producto");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      setIsDetailsDialogOpen(false);
      toast.success("Producto eliminado exitosamente");
    },
    onError: (error) => {
      console.error("Error deleting item:", error);
      toast.error("Error al eliminar el producto");
    }
  });

  const adjustStockMutation = useMutation({
    mutationFn: ({ id, quantity, operation }: { id: string; quantity: number; operation: "add" | "subtract" }) => 
      adjustStock(id, quantity, operation),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      setIsStockAdjustmentDialogOpen(false);
      toast.success("Stock ajustado exitosamente");
    },
    onError: (error) => {
      console.error("Error adjusting stock:", error);
      toast.error("Error al ajustar el stock");
    }
  });

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.sku && item.sku.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (item.barcode && item.barcode.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCreateItem = async (data: Omit<InventoryItem, "id" | "created_at" | "updated_at">): Promise<void> => {
    await createMutation.mutateAsync(data);
  };

  const handleUpdateItem = async (id: string, updates: Partial<InventoryItem>): Promise<void> => {
    await updateMutation.mutateAsync({ id, updates });
  };

  const handleDeleteItem = async (id: string): Promise<void> => {
    await deleteMutation.mutateAsync(id);
  };

  const handleStockAdjustment = async (adjustment: { quantity: number; operation: "add" | "subtract" }): Promise<void> => {
    if (selectedItem) {
      await adjustStockMutation.mutateAsync({ 
        id: selectedItem.id, 
        quantity: adjustment.quantity, 
        operation: adjustment.operation 
      });
    }
  };

  const isUpdating = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending || adjustStockMutation.isPending;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Inventario" description="Gestiona los productos y el stock disponible." />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Listado de Productos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="relative">
              <Search className="absolute left-2 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar producto..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Producto
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Producto</DialogTitle>
                  <DialogDescription>
                    Añada un nuevo producto al inventario.
                  </DialogDescription>
                </DialogHeader>
                <InventoryForm 
                  initialData={{}}
                  onSubmit={handleCreateItem}
                  onCancel={() => setIsCreateDialogOpen(false)}
                  isSubmitting={createMutation.isPending}
                />
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <InventoryTable
              items={filteredItems}
              onView={(item) => {
                setSelectedItem(item);
                setIsDetailsDialogOpen(true);
              }}
            />
          )}
        </CardContent>
      </Card>

      {selectedItem && isDetailsDialogOpen && (
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Detalles del Producto</DialogTitle>
            </DialogHeader>
            <InventoryDetails
              item={selectedItem}
              onEdit={() => {
                setIsDetailsDialogOpen(false);
                setIsEditDialogOpen(true);
              }}
              onClose={() => setIsDetailsDialogOpen(false)}
              onDelete={async () => {
                if (selectedItem) {
                  await handleDeleteItem(selectedItem.id);
                  setSelectedItem(null);
                }
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {selectedItem && isEditDialogOpen && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Editar Producto</DialogTitle>
              <DialogDescription>
                Modifique la información del producto.
              </DialogDescription>
            </DialogHeader>
            <InventoryForm
              initialData={selectedItem}
              onSubmit={async (updates) => {
                if (selectedItem) {
                  await handleUpdateItem(selectedItem.id, updates);
                }
              }}
              onCancel={() => setIsEditDialogOpen(false)}
              isSubmitting={updateMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      )}

      {selectedItem && isStockAdjustmentDialogOpen && (
        <Dialog open={isStockAdjustmentDialogOpen} onOpenChange={setIsStockAdjustmentDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Ajuste de Inventario</DialogTitle>
              <DialogDescription>
                Ajuste la cantidad de stock para este producto.
              </DialogDescription>
            </DialogHeader>
            <StockAdjustmentForm
              item={selectedItem}
              onSubmit={handleStockAdjustment}
              onCancel={() => setIsStockAdjustmentDialogOpen(false)}
              isSubmitting={isUpdating}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Inventario;
