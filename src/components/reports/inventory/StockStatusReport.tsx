"use client";

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getStockStatus } from '@/services/reportingService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock filter options - in a real app, these might come from a service
const mockCategories = ["Electrónicos", "Repuestos", "Accesorios", "Software"];
const mockSuppliers = [
  { id: "SUP001", name: "Proveedor A" },
  { id: "SUP002", name: "Proveedor B" },
  { id: "SUP003", name: "Proveedor C" },
];

const StockStatusReport: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | undefined>(undefined);
  const [queryEnabled, setQueryEnabled] = useState<boolean>(false);

  const { data, isLoading, error, refetch } = useQuery(
    ['stockStatus', selectedCategory, selectedSupplierId],
    () => getStockStatus({ category: selectedCategory, supplierId: selectedSupplierId }),
    { enabled: queryEnabled }
  );

  useEffect(() => {
    if (queryEnabled) {
      refetch();
    }
  }, [selectedCategory, selectedSupplierId, queryEnabled, refetch]);

  const handleGenerateReport = () => {
    setQueryEnabled(true);
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold">Reporte de Estado de Stock</h3>
      <div className="flex flex-wrap gap-2 items-center">
        <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value === "all" ? undefined : value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las Categorías</SelectItem>
            {mockCategories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedSupplierId} onValueChange={(value) => setSelectedSupplierId(value === "all" ? undefined : value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Proveedor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los Proveedores</SelectItem>
            {mockSuppliers.map(sup => (
              <SelectItem key={sup.id} value={sup.id}>{sup.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleGenerateReport} disabled={isLoading && queryEnabled}>
          {isLoading && queryEnabled ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Generar Reporte
        </Button>
      </div>

      {queryEnabled && isLoading && (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2">Cargando reporte...</p>
        </div>
      )}

      {queryEnabled && error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            No se pudo cargar el reporte de estado de stock. {(error as Error)?.message}
          </AlertDescription>
        </Alert>
      )}

      {queryEnabled && !isLoading && !error && data && (
        <Card>
          <CardHeader>
            <CardTitle>Estado Actual del Inventario</CardTitle>
          </CardHeader>
          <CardContent>
            {data.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                    <TableHead className="text-right">Costo</TableHead>
                    <TableHead className="text-right">Venta</TableHead>
                    <TableHead className="text-right">Valor Total (Costo)</TableHead>
                    <TableHead className="text-right">Stock Mínimo</TableHead>
                    <TableHead className="text-center">Alerta</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item) => (
                    <TableRow key={item.itemId} className={cn(item.isLowStock && "bg-yellow-100 dark:bg-yellow-900/50")}>
                      <TableCell>{item.itemName}</TableCell>
                      <TableCell>{item.sku || 'N/A'}</TableCell>
                      <TableCell>{item.category || 'N/A'}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">${item.costPrice.toLocaleString()}</TableCell>
                      <TableCell className="text-right">${item.sellingPrice.toLocaleString()}</TableCell>
                      <TableCell className="text-right">${item.totalValue.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{item.minimumStock || 'N/A'}</TableCell>
                      <TableCell className="text-center">
                        {item.isLowStock && <AlertTriangle className="h-5 w-5 text-yellow-500 inline-block" />}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p>No hay datos de inventario para los filtros seleccionados.</p>
            )}
          </CardContent>
        </Card>
      )}
      {!queryEnabled && !isLoading && !error && (
        <div className="p-4 text-center text-gray-500">
          Seleccione filtros (opcional) y haga clic en "Generar Reporte".
        </div>
      )}
    </div>
  );
};

export default StockStatusReport;
