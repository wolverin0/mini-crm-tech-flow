import PageHeader from "@/components/layout/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MonthlySalesSummaryReport from "@/components/reports/sales/MonthlySalesSummaryReport";
import SalesByClientReport from "@/components/reports/sales/SalesByClientReport";
import InvoiceAgingReport from "@/components/reports/sales/InvoiceAgingReport";
import RevenueByServiceTypeReport from "@/components/reports/sales/RevenueByServiceTypeReport";
import OrderStatusReport from "@/components/reports/repairOrders/OrderStatusReport";
import AverageRepairTimeReport from "@/components/reports/repairOrders/AverageRepairTimeReport";
import TechnicianPerformanceReport from "@/components/reports/repairOrders/TechnicianPerformanceReport";
import OrdersByEquipmentReport from "@/components/reports/repairOrders/OrdersByEquipmentReport";
import StockStatusReport from "@/components/reports/inventory/StockStatusReport";
import NewClientAcquisitionReport from "@/components/reports/clients/NewClientAcquisitionReport";
import ClientActivitySummaryReport from "@/components/reports/clients/ClientActivitySummaryReport";
import TicketVolumeAndResolutionReport from '@/components/reports/tickets/TicketVolumeAndResolutionReport';

const Reportes = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Reportes"
        description="Generación y visualización de reportes."
      />
      <Tabs defaultValue="sales-revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales-revenue">Ventas y Finanzas</TabsTrigger>
          <TabsTrigger value="repair-orders">Órdenes de Reparación</TabsTrigger>
          <TabsTrigger value="inventory">Inventario</TabsTrigger>
          <TabsTrigger value="clients">Clientes</TabsTrigger>
          <TabsTrigger value="tickets">Tickets</TabsTrigger>
          {/* TODO: Add other report categories here as new TabsTrigger components */}
        </TabsList>

        <TabsContent value="sales-revenue" className="space-y-6">
          <MonthlySalesSummaryReport />
          <SalesByClientReport />
          <InvoiceAgingReport />
          <RevenueByServiceTypeReport />
        </TabsContent>
        
        <TabsContent value="repair-orders" className="space-y-6">
          <OrderStatusReport />
          <AverageRepairTimeReport />
          <TechnicianPerformanceReport />
          <OrdersByEquipmentReport />
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <StockStatusReport />
        </TabsContent>

        <TabsContent value="clients" className="space-y-6">
          <NewClientAcquisitionReport />
          <ClientActivitySummaryReport />
        </TabsContent>

        <TabsContent value="tickets" className="space-y-6">
          <TicketVolumeAndResolutionReport />
        </TabsContent>
        {/* TODO: Add other report category content here as new TabsContent components */}
      </Tabs>
    </div>
  );
};

export default Reportes;
