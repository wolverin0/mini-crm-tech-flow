import PageHeader from "@/components/layout/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect, useCallback } from "react"; // Added useCallback
import { useQuery } from "@tanstack/react-query"; // This might not be used if fetching directly
import { getPaymentsByDateRange } from "@/services/paymentService";
import { getRepairOrdersByDateRange } from "@/services/repairOrderService";
import { getItems as getInventoryItems } from "@/services/inventoryService"; // Renamed for clarity
import { Payment, RepairOrder, InventoryItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const formatDateForInput = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const Reportes = () => {
  // Common State
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7); // Default to 7 days ago
    return formatDateForInput(date);
  });
  const [endDate, setEndDate] = useState(formatDateForInput(new Date()));

  // Revenue Report State
  const [revenueData, setRevenueData] = useState<{ totalRevenue: number } | null>(null);
  const [isLoadingRevenue, setIsLoadingRevenue] = useState(false);

  // Order Report State
  const [orderReportData, setOrderReportData] = useState<{ totalOrders: number; statusCounts: Record<string, number> } | null>(null);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Inventory Report State
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [isLoadingInventory, setIsLoadingInventory] = useState(false);

  // Fetch Revenue Data
  const fetchRevenue = useCallback(async () => {
    setIsLoadingRevenue(true);
    setRevenueData(null);
    try {
      const payments = await getPaymentsByDateRange(startDate, endDate);
      if (payments.length === 0) {
        // toast.info("No se encontraron ingresos en el período seleccionado.");
      }
      const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
      setRevenueData({ totalRevenue });
    } catch (error) {
      console.error("Error fetching revenue:", error);
      toast.error("Error al cargar el reporte de ingresos.");
    } finally {
      setIsLoadingRevenue(false);
    }
  }, [startDate, endDate]);

  // Fetch Order Data
  const fetchOrderReport = useCallback(async () => {
    setIsLoadingOrders(true);
    setOrderReportData(null);
    try {
      const orders = await getRepairOrdersByDateRange(startDate, endDate);
      const totalOrders = orders.length;
      const statusCounts: Record<string, number> = {};
      orders.forEach(order => {
        statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
      });
      setOrderReportData({ totalOrders, statusCounts });
      if (totalOrders === 0) {
        // toast.info("No se encontraron órdenes en el período seleccionado.");
      }
    } catch (error) {
      console.error("Error fetching order report:", error);
      toast.error("Error al cargar el reporte de órdenes.");
    } finally {
      setIsLoadingOrders(false);
    }
  }, [startDate, endDate]);

  // Fetch Inventory Data
  const fetchInventoryReport = useCallback(async () => {
    setIsLoadingInventory(true);
    try {
      const items = await getInventoryItems();
      setInventoryItems(items);
      if (items.length === 0) {
        toast.info("No hay productos en el inventario.");
      }
    } catch (error) {
      console.error("Error fetching inventory report:", error);
      toast.error("Error al cargar el reporte de inventario.");
    } finally {
      setIsLoadingInventory(false);
    }
  }, []);

  // Combined fetch for date-ranged reports
  const fetchAllDateRangedReports = useCallback(() => {
    fetchRevenue();
    fetchOrderReport();
  }, [fetchRevenue, fetchOrderReport]);

  // Initial fetch
  useEffect(() => {
    fetchAllDateRangedReports();
    fetchInventoryReport();
  }, [fetchAllDateRangedReports, fetchInventoryReport]);


  return (
    <div className="container mx-auto p-4 space-y-6">
      <PageHeader title="Reportes" description="Visualiza el rendimiento y estado de tu negocio." />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Seleccionar Período para Reportes</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="grid gap-2 flex-1">
            <Label htmlFor="startDate">Fecha de Inicio</Label>
            <Input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="grid gap-2 flex-1">
            <Label htmlFor="endDate">Fecha de Fin</Label>
            <Input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <Button onClick={fetchAllDateRangedReports} disabled={isLoadingRevenue || isLoadingOrders}>
            {(isLoadingRevenue || isLoadingOrders) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generar Reportes
          </Button>
        </CardContent>
      </Card>

      <Tabs defaultValue="revenue" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="revenue">Ingresos</TabsTrigger>
          <TabsTrigger value="orders">Órdenes</TabsTrigger>
          <TabsTrigger value="inventory">Inventario</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Reporte de Ingresos</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingRevenue ? (
                <div className="flex justify-center items-center h-24">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : revenueData ? (
                <p className="text-2xl font-semibold">
                  Total Ingresos: ${revenueData.totalRevenue.toFixed(2)}
                </p>
              ) : (
                <p>No se encontraron datos de ingresos para el período seleccionado o hubo un error.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Reporte de Órdenes</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingOrders ? (
                <div className="flex justify-center items-center h-24">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : orderReportData ? (
                <>
                  <p className="text-xl font-semibold mb-2">
                    Total de Órdenes: {orderReportData.totalOrders}
                  </p>
                  {orderReportData.totalOrders > 0 && (
                    <div>
                      <h4 className="font-medium mb-1">Desglose por Estado:</h4>
                      <ul className="list-disc pl-5">
                        {Object.entries(orderReportData.statusCounts).map(([status, count]) => (
                          <li key={status}>{status}: {count}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <p>No se encontraron datos de órdenes para el período seleccionado o hubo un error.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle>Reporte de Inventario</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingInventory ? (
                <div className="flex justify-center items-center h-24">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : inventoryItems.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead className="text-right">Stock Actual</TableHead>
                      <TableHead>Estado Stock</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventoryItems.map((item) => {
                      const lowStockThreshold = item.low_stock_threshold || 5;
                      return (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{item.sku || "-"}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell>
                            {item.quantity <= lowStockThreshold ? (
                              <Badge variant="destructive">Bajo Stock</Badge>
                            ) : (
                              <Badge variant="secondary">En Stock</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <p>No hay productos en el inventario o no se pudo cargar la información.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reportes;
