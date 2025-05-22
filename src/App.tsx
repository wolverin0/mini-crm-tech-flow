
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Clientes from "./pages/Clientes";
import Ordenes from "./pages/Ordenes";
import Tickets from "./pages/Tickets";
import Inventario from "./pages/Inventario";
import Facturacion from "./pages/Facturacion";
import Proveedores from "./pages/Proveedores";
import Configuracion from "./pages/Configuracion";
import NotFound from "./pages/NotFound";
import ClientAccounts from "./pages/ClientAccounts";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
        <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
        <Route path="/clientes" element={<AppLayout><Clientes /></AppLayout>} />
        <Route path="/ordenes" element={<AppLayout><Ordenes /></AppLayout>} />
        <Route path="/tickets" element={<AppLayout><Tickets /></AppLayout>} />
        <Route path="/inventario" element={<AppLayout><Inventario /></AppLayout>} />
        <Route path="/proveedores" element={<AppLayout><Proveedores /></AppLayout>} />
        <Route path="/facturacion" element={<AppLayout><Facturacion /></AppLayout>} />
        <Route path="/cuentas" element={<AppLayout><ClientAccounts /></AppLayout>} />
        <Route path="/configuracion" element={<AppLayout><Configuracion /></AppLayout>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
