
import { InventoryItem, InventoryDetailsProps } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

const InventoryDetails = ({ 
  item, 
  onEdit, 
  onClose, 
  onDelete 
}: InventoryDetailsProps) => {
  const isLowStock = item.minimum_stock !== null && item.quantity < item.minimum_stock;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{item.name}</h3>
          {item.supplier && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Proveedor: {item.supplier}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Badge 
            variant={isLowStock ? "destructive" : "default"} 
            className={`text-xs px-3 py-1 ${isLowStock ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'}`}
          >
            {isLowStock ? "Stock Bajo" : "Stock OK"}
          </Badge>
        </div>
      </div>

      <Separator className="bg-gray-200 dark:bg-gray-700" />

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Cantidad</h4>
          <p className="text-xl font-semibold text-gray-800 dark:text-gray-100 mt-1">{item.quantity} unidades</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Stock Mínimo</h4>
          <p className="text-xl font-semibold text-gray-800 dark:text-gray-100 mt-1">{item.minimum_stock} unidades</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Precio de Costo</h4>
          <p className="text-xl font-semibold text-indigo-600 dark:text-indigo-400 mt-1">{formatCurrency(item.cost_price)}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Precio de Venta</h4>
          <p className="text-xl font-semibold text-indigo-600 dark:text-indigo-400 mt-1">{formatCurrency(item.selling_price)}</p>
        </div>
      </div>

      {item.description && (
        <>
          <Separator className="bg-gray-200 dark:bg-gray-700" />
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Descripción</h4>
            <p className="text-base whitespace-pre-line bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg text-gray-700 dark:text-gray-300">{item.description}</p>
          </div>
        </>
      )}

      <Separator className="bg-gray-200 dark:bg-gray-700" />

      <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
        <div>
          <p>Creado: {formatDate(item.created_at)}</p>
        </div>
        <div>
          <p>Actualizado: {formatDate(item.updated_at)}</p>
        </div>
      </div>

      {/* Add action buttons if handlers are provided */}
      {(onEdit || onDelete) && (
        <div className="flex justify-end gap-2 pt-4">
          {onEdit && (
            <Button 
              variant="default" 
              onClick={onEdit}
            >
              Editar
            </Button>
          )}
          {onDelete && (
            <Button 
              variant="destructive" 
              onClick={onDelete}
            >
              Eliminar
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default InventoryDetails;
