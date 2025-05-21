
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Users, 
  Wrench, 
  Ticket, 
  Package2, 
  FileText, 
  Settings, 
  Menu, 
  CreditCard,
  Truck
} from "lucide-react";
import { SidebarProps } from "./AppSidebarProps";

export const AppSidebar = ({ collapsed, toggleSidebar }: { collapsed: boolean, toggleSidebar: () => void }) => {
  const { pathname } = useLocation();

  const isActive = (path: string) => pathname === path || pathname.startsWith(path);

  const menuItems = [
    { name: "Panel de Control", path: "/dashboard", icon: Home },
    { name: "Tickets", path: "/tickets", icon: Ticket },
    { name: "Clientes", path: "/clientes", icon: Users },
    { name: "Órdenes", path: "/ordenes", icon: Wrench },
    { name: "Inventario", path: "/inventario", icon: Package2 },
    { name: "Proveedores", path: "/proveedores", icon: Truck },
    { name: "Facturación", path: "/facturacion", icon: FileText },
    { name: "Cuentas", path: "/cuentas", icon: CreditCard },
    { name: "Reportes", path: "/reportes", icon: FileText },
    { name: "Configuración", path: "/configuracion", icon: Settings },
  ];

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-40 h-screen bg-sidebar dark:bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="h-full flex flex-col justify-between">
        <div>
          <div className="h-16 flex items-center justify-between px-4">
            {!collapsed && (
              <div className="flex items-center text-xl font-semibold text-sidebar-foreground">
                TechService
              </div>
            )}
            <button
              type="button"
              className="p-2 rounded-md text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={toggleSidebar}
            >
              <Menu size={20} />
              <span className="sr-only">Toggle sidebar</span>
            </button>
          </div>

          <div className="py-4 px-2">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center p-2 rounded-md text-sidebar-foreground hover:bg-sidebar-accent transition-colors",
                      isActive(item.path) && "bg-sidebar-accent font-medium",
                      collapsed ? "justify-center" : "px-4"
                    )}
                  >
                    <item.icon size={20} className={cn(collapsed ? "" : "mr-3")} />
                    {!collapsed && <span>{item.name}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="p-4 text-xs text-sidebar-foreground opacity-50 text-center">
          {!collapsed && <p>TechService v1.0.0</p>}
        </div>
      </div>
    </aside>
  );
};
