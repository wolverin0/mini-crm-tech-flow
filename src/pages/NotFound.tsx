
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-crm-primary">404</h1>
        <p className="text-xl text-gray-600 mt-4 mb-6">Página no encontrada</p>
        <p className="text-gray-500 max-w-md mx-auto mb-8">
          La página que estás buscando no existe o ha sido movida.
        </p>
        <Button asChild>
          <Link to="/">
            Volver al Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
