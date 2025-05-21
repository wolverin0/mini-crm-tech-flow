import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, FileText, Package2, Users, Wrench, AlertTriangle, CreditCard, TrendingUp } from "lucide-react";
import { format, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Button } from "@/components/ui/button";
import { getRepairOrders } from "@/services/repairOrderService";
import { getAllClientBalances } from "@/services/paymentService";
import { getItems } from "@/services/inventoryService";
import PageHeader from "@/components/layout/PageHeader";
import { Order } from "@/types";
import { Link, useNavigate } from "react-router-dom";

interface DashboardCardProps {
  title: string;
  description: string;
  value: string | number;
  icon: React.ReactNode;
  badgeColor?: string;
  navigateTo: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  description,
  value,
  icon,
  badgeColor = "bg-secondary",
  navigateTo,
}) => {
  const navigate = useNavigate();
  
  return (
    <Card 
      className="cursor-pointer transition-all hover:shadow-md"
      onClick={() => navigate(navigateTo)}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
      <div className="px-4 pb-4">
        <Badge 
          className={`${badgeColor} hover:opacity-80 cursor-pointer`}
          onClick={(e) => {
            e.stopPropagation();
            navigate(navigateTo);
          }}
        >
          <ArrowRight className="h-4 w-4 mr-2" />
          Ver detalles
        </Badge>
      </div>
    </Card>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [overdueOrders, setOverdueOrders] = useState<Order[]>([]);
  const [recentSalesData, setRecentSalesData] = useState<
    { date: string; sales: number }[]
  >([]);
  const [statusDistribution, setStatusDistribution] = useState<{ name: string; value: number }[]>([]);
  const [lowStockItems, setLowStockItems] = useState<number>(0);

  // Fetch overdue repair orders
  const { data: orders, isLoading: isLoadingOrders } = useQuery({
    queryKey: ["overdueOrders"],
    queryFn: () => getRepairOrders(),
  });

  // Fetch client balances
  const { data: balances, isLoading: isLoadingBalances } = useQuery({
    queryKey: ["clientBalances"],
    queryFn: () => getAllClientBalances(),
  });

  // Fetch inventory data
  const { data: inventoryItems, isLoading: isLoadingInventory } = useQuery({
    queryKey: ["inventory"],
    queryFn: () => getItems(),
  });

  // Status distribution data for pie chart
  useEffect(() => {
    if (orders) {
      const statusCount: Record<string, number> = {};
      
      orders.forEach(order => {
        const status = order.status;
        statusCount[status] = (statusCount[status] || 0) + 1;
      });
      
      const statusData = Object.keys(statusCount).map(status => ({
        name: status,
        value: statusCount[status]
      }));
      
      setStatusDistribution(statusData);
    }
  }, [orders]);

  // Set low stock items
  useEffect(() => {
    if (inventoryItems) {
      const itemsWithLowStock = inventoryItems.filter(item => 
        item.quantity <= (item.minimum_stock || 0)
      );
      setLowStockItems(itemsWithLowStock.length);
    }
  }, [inventoryItems]);

  useEffect(() => {
    if (orders) {
      // Check for overdue orders (more than 30 days in service)
      const thresholdDays = 30;
      const today = new Date();

      const overdue = orders
        .filter((order) => {
          const entryDate = new Date(order.entry_date);
          const daysInService = Math.floor(
            (today.getTime() - entryDate.getTime()) / (1000 * 3600 * 24)
          );
          return daysInService > thresholdDays && order.status !== "Entregado";
        })
        .map(order => {
          const entryDate = new Date(order.entry_date);
          const daysInService = Math.floor(
            (today.getTime() - entryDate.getTime()) / (1000 * 3600 * 24)
          );
          
          return {
            ...order,
            client_name: 'Cliente', // This will be updated later when we implement proper client name fetching
            days_in_service: daysInService
          };
        });

      setOverdueOrders(overdue as Order[]);
    }
  }, [orders]);

  useEffect(() => {
    if (balances) {
      // Generate sales data for the last 7 days
      const numberOfDays = 7;
      const salesData: { date: string; sales: number }[] = [];

      for (let i = numberOfDays - 1; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const formattedDate = format(date, 'yyyy-MM-dd');
        // Generate random sales data for demonstration
        const sales = Math.floor(Math.random() * 500) + 100;
        salesData.push({ date: formattedDate, sales });
      }

      setRecentSalesData(salesData);
    }
  }, [balances]);

  const totalOverdueOrders = overdueOrders.length;
  const totalClientBalances = balances?.length || 0;
  const totalPendingInvoices = 25; // Dummy data - should be replaced with real data from API
  const totalMonthlyRevenue = 12500; // Dummy data - should be replaced with real data from API

  // For pie chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Panel de Control"
        description="Resumen general de la actividad del taller."
      />

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Órdenes de Reparación Pendientes</CardTitle>
            <CardDescription>
              Lista de órdenes de reparación que requieren atención.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            {isLoadingOrders ? (
              <p>Cargando órdenes...</p>
            ) : totalOverdueOrders === 0 ? (
              <p>No hay órdenes de reparación pendientes.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nº Orden
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Equipo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Días en Servicio
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {overdueOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/ordenes/${order.id}`)}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{order.order_number}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{order.client_name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{order.equipment_type}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                            {order.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{order.days_in_service}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {totalOverdueOrders > 0 && (
              <Button variant="outline" className="mt-4" onClick={() => navigate("/ordenes")}>
                Ver todas las órdenes
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stock y Alertas</CardTitle>
            <CardDescription>
              Resumen del estado del inventario y alertas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-950/30 rounded-md border border-orange-200 dark:border-orange-900">
                  <div className="flex items-center">
                    <AlertTriangle className="h-6 w-6 text-orange-500 dark:text-orange-400 mr-3" />
                    <div>
                      <h4 className="font-medium">Alertas de stock bajo</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {lowStockItems} {lowStockItems === 1 ? 'producto requiere' : 'productos requieren'} reposición
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => navigate("/inventario")}>
                    Ver inventario
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950/30 rounded-md border border-blue-200 dark:border-blue-900">
                  <div className="flex items-center">
                    <Package2 className="h-6 w-6 text-blue-500 dark:text-blue-400 mr-3" />
                    <div>
                      <h4 className="font-medium">Total de productos</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {inventoryItems?.length || 0} productos en inventario
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => navigate("/inventario")}>
                    Gestionar
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/30 rounded-md border border-green-200 dark:border-green-900">
                  <div className="flex items-center">
                    <TrendingUp className="h-6 w-6 text-green-500 dark:text-green-400 mr-3" />
                    <div>
                      <h4 className="font-medium">Valor del inventario</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        ${inventoryItems?.reduce((total, item) => total + (item.quantity * item.cost_price), 0).toLocaleString() || 0}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => navigate("/inventario")}>
                    Ver detalle
                  </Button>
                </div>
              </div>

          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Órdenes de Reparación"
          description="Órdenes de reparación pendientes."
          value={isLoadingOrders ? "Cargando..." : totalOverdueOrders}
          icon={<Wrench className="h-4 w-4 text-gray-500" />}
          badgeColor={totalOverdueOrders > 5 ? "bg-red-500" : "bg-green-500"}
          navigateTo="/ordenes"
        />
        <DashboardCard
          title="Clientes"
          description="Total de clientes registrados."
          value={isLoadingBalances ? "Cargando..." : totalClientBalances}
          icon={<Users className="h-4 w-4 text-gray-500" />}
          badgeColor="bg-blue-500"
          navigateTo="/clientes"
        />
        <DashboardCard
          title="Facturas Pendientes"
          description="Facturas que requieren atención."
          value={isLoadingBalances ? "Cargando..." : totalPendingInvoices}
          icon={<FileText className="h-4 w-4 text-gray-500" />}
          badgeColor="bg-yellow-500"
          navigateTo="/facturacion"
        />
        <DashboardCard
          title="Ingresos Mensuales"
          description="Ingresos totales del mes actual."
          value={isLoadingBalances ? "Cargando..." : `$${totalMonthlyRevenue.toLocaleString()}`}
          icon={<CreditCard className="h-4 w-4 text-gray-500" />}
          badgeColor="bg-green-500"
          navigateTo="/cuentas"
        />
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ventas Recientes</CardTitle>
            <CardDescription>
              Resumen de las ventas de los últimos 7 días.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={recentSalesData}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(date) => format(new Date(date), 'dd MMM', { locale: es })} />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, 'Ventas']} />
                <Area type="monotone" dataKey="sales" stroke="#8884d8" fill="#8884d8" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Órdenes por Estado</CardTitle>
            <CardDescription>
              Distribución de órdenes según su estado actual.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip formatter={(value) => [value, 'Cantidad']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

    </div>
  );
};

export default Dashboard;
