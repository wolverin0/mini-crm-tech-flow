
import { Invoice, Client } from "@/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, CreditCard, Mail, Printer } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getClientById } from "@/services/clientService";

interface InvoiceCardProps {
  invoice: Invoice;
  onView: (invoice: Invoice) => void;
  onAfipGenerate?: (invoiceId: string) => Promise<void>;
  onPrint?: (invoiceId: string) => void;
  onSendEmail?: (invoiceId: string) => Promise<void>;
  onConvertToFactura?: (invoice: Invoice) => void; // New prop
}

const InvoiceCard = ({ invoice, onView, onAfipGenerate, onPrint, onSendEmail, onConvertToFactura }: InvoiceCardProps) => {
  // Fetch client info
  const { data: client } = useQuery<Client>({
    queryKey: ["client", invoice.client_id],
    queryFn: () => getClientById(invoice.client_id),
  });

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pendiente":
        return "bg-yellow-500";
      case "Emitida":
        return "bg-green-500";
      case "Pagada":
        return "bg-blue-500";
      case "Cancelada":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  // Get AFIP status badge color
  const getAfipStatusColor = (status: string | undefined) => {
    if (!status) return "bg-gray-500";
    switch (status) {
      case "Pendiente":
        return "bg-yellow-500";
      case "Autorizada":
        return "bg-green-500";
      case "Rechazada":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base">{invoice.invoice_number}</CardTitle>
            <p className="text-xs text-muted-foreground">
              {format(new Date(invoice.issue_date), "PPP", { locale: es })}
            </p>
          </div>
          <div className="flex flex-col items-end">
            <Badge className={getStatusColor(invoice.status)}>{invoice.status}</Badge>
            {invoice.afip_status && (
              <Badge className={`mt-1 ${getAfipStatusColor(invoice.afip_status)}`}>
                AFIP: {invoice.afip_status}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid gap-1">
          <div className="text-sm font-medium">Cliente:</div>
          <div className="text-sm">{client?.name || 'Cargando...'}</div>
          
          <div className="text-sm font-medium mt-2">Monto:</div>
          <div className="text-lg font-bold">${invoice.total.toLocaleString('es-AR')}</div>
          
          {invoice.afip_cae && (
            <>
              <div className="text-sm font-medium mt-2">CAE:</div>
              <div className="text-sm">{invoice.afip_cae}</div>
            </>
          )}
        </div>
      </CardContent>
      <CardFooter className="bg-muted-foreground/5 pt-3 flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => onView(invoice)}>
          <FileText className="h-4 w-4 mr-1" /> Ver
        </Button>
        
        {onAfipGenerate && !invoice.afip_cae && (
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => onAfipGenerate(invoice.id)}
            className="text-blue-600 hover:text-blue-800"
          >
            <CreditCard className="h-4 w-4 mr-1" /> AFIP
          </Button>
        )}
        
        {onPrint && (
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => onPrint(invoice.id)}
          >
            <Printer className="h-4 w-4 mr-1" /> Imprimir
          </Button>
        )}
        
        {onSendEmail && (
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => onSendEmail(invoice.id)}
          >
            <Mail className="h-4 w-4 mr-1" /> Enviar
          </Button>
        )}

        {invoice.doc_type === 'presupuesto' && onConvertToFactura && (
          <Button 
            size="sm" 
            variant="default" // Or "outline" or "secondary" depending on desired emphasis
            onClick={() => onConvertToFactura(invoice)}
            className="bg-orange-500 hover:bg-orange-600 text-white" // Example styling
          >
            <FileText className="h-4 w-4 mr-1" /> Convertir a Factura
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default InvoiceCard;
