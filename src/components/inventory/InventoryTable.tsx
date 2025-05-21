
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { InventoryItem } from "@/types";
import { Eye } from "lucide-react";

interface InventoryTableProps {
  items: InventoryItem[];
  onView: (item: InventoryItem) => void;
}

const InventoryTable = ({ items, onView }: InventoryTableProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(amount);
  };

  return (
    <div className="mt-4 rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Cantidad</TableHead>
            <TableHead>Precio de Venta</TableHead>
            <TableHead>Proveedor</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                No hay productos en el inventario
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>
                  <span className={item.minimum_stock && item.quantity <= item.minimum_stock ? "text-red-500 font-medium" : ""}>
                    {item.quantity}
                  </span>
                </TableCell>
                <TableCell>{formatCurrency(item.selling_price)}</TableCell>
                <TableCell>{item.supplier || "-"}</TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onView(item)}
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">Ver detalles</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default InventoryTable;
