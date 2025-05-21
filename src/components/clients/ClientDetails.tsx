
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Client } from "@/types";
import { format } from "date-fns";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ClientDetailsProps {
  client: Client;
}

const ClientDetails = ({ client }: ClientDetailsProps) => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  const openWhatsApp = (phone: string) => {
    // Clean the phone number (remove spaces, dashes, etc.)
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información del Cliente</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Nombre</p>
            <p className="text-base font-medium">{client.name}</p>
          </div>
          
          {client.identification && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">DNI/CUIT</p>
              <p className="text-base">{client.identification}</p>
            </div>
          )}
          
          {client.phone && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Teléfono</p>
              <div className="flex items-center gap-2">
                <p className="text-base">{client.phone}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1 px-2 h-7 text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700"
                  onClick={() => openWhatsApp(client.phone || '')}
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </Button>
              </div>
            </div>
          )}
          
          {client.email && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-base">{client.email}</p>
            </div>
          )}
          
          {client.address && (
            <div className="md:col-span-2">
              <p className="text-sm font-medium text-muted-foreground">Dirección</p>
              <p className="text-base">{client.address}</p>
            </div>
          )}
          
          <div>
            <p className="text-sm font-medium text-muted-foreground">Creado</p>
            <p className="text-sm">{formatDate(client.created_at)}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-muted-foreground">Última Actualización</p>
            <p className="text-sm">{formatDate(client.updated_at)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientDetails;
