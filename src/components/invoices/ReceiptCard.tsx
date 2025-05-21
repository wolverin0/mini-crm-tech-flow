
import { Receipt, Client } from "@/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Mail, Printer } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getClientById } from "@/services/clientService";

interface ReceiptCardProps {
  receipt: Receipt;
  onView: (receipt: Receipt) => void;
  onPrint?: (receiptId: string) => void;
  onSendEmail?: (receiptId: string) => Promise<void>;
}

const ReceiptCard = ({ receipt, onView, onPrint, onSendEmail }: ReceiptCardProps) => {
  // Fetch client info
  const { data: client } = useQuery({
    queryKey: ["client", receipt.client_id],
    queryFn: () => getClientById(receipt.client_id),
  });

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Emitido":
        return "bg-green-500";
      case "Cancelado":
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
            <CardTitle className="text-base">{receipt.receipt_number}</CardTitle>
            <p className="text-xs text-muted-foreground">
              {format(new Date(receipt.issue_date), "PPP", { locale: es })}
            </p>
          </div>
          <Badge className={getStatusColor(receipt.status)}>{receipt.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid gap-1">
          <div className="text-sm font-medium">Cliente:</div>
          <div className="text-sm">{client?.name || 'Cargando...'}</div>
          
          <div className="text-sm font-medium mt-2">Monto:</div>
          <div className="text-lg font-bold">${receipt.amount.toLocaleString('es-AR')}</div>
        </div>
      </CardContent>
      <CardFooter className="bg-muted-foreground/5 pt-3 flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => onView(receipt)}>
          <FileText className="h-4 w-4 mr-1" /> Ver
        </Button>
        
        {onPrint && (
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => onPrint(receipt.id)}
          >
            <Printer className="h-4 w-4 mr-1" /> Imprimir
          </Button>
        )}
        
        {onSendEmail && (
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => onSendEmail(receipt.id)}
          >
            <Mail className="h-4 w-4 mr-1" /> Enviar
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ReceiptCard;
