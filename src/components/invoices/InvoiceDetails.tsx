import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Invoice, Client, RepairOrder } from '@/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { FileText, Mail, Printer, MessageCircle } from 'lucide-react';

interface InvoiceDetailsProps {
  invoice: Invoice;
  onUpdate: (updates: Partial<Invoice>) => void; // Although not used in this read-only view, keep for potential future editing
  onGenerateAfip: (invoiceId: string) => void;
  onPrint: (invoiceId: string) => void;
  onSendEmail: (invoiceId: string) => void;
  isUpdating: boolean; // Keep for consistency, though not used in this read-only view
}

const InvoiceDetails = ({
  invoice,
  onUpdate,
  onGenerateAfip,
  onPrint,
  onSendEmail,
  isUpdating,
}: InvoiceDetailsProps) => {
  // Assuming invoice object includes nested client and repair_order data
  const client = invoice.client as Client; // Cast as Client type
  const repairOrder = invoice.repair_order as RepairOrder | null; // Cast as RepairOrder or null

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: es });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  const formatCurrency = (amount?: number | null) => {
    if (amount === undefined || amount === null) return '-';
    return `$${amount.toFixed(2)}`;
  };

  const handleSendWhatsapp = (phone: string | undefined | null) => {
    if (phone) {
      const cleanPhone = phone.replace(/\D/g, '');
      window.open(`https://wa.me/${cleanPhone}`, '_blank');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Factura #{invoice.invoice_number || invoice.id?.substring(0, 6)}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Cliente</p>
            <p>{client?.name || '-'}</p>
          </div>
          {client?.phone && (
             <div>
               <p className="text-sm font-medium text-muted-foreground">Teléfono Cliente</p>
               <div className="flex items-center gap-2">
                 <p>{client.phone}</p>
                 <Button 
                   variant="outline" 
                   size="sm" 
                   className="flex items-center gap-1 px-2 h-7 text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700"
                   onClick={() => handleSendWhatsapp(client.phone)}
                 >
                   <MessageCircle className="h-4 w-4" />
                   WhatsApp
                 </Button>
               </div>
             </div>
           )}
          {client?.email && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email Cliente</p>
              <p>{client.email}</p>
            </div>
          )}

          {repairOrder && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Orden de Reparación</p>
              <p>#{repairOrder.order_number || repairOrder.id?.substring(0, 6)} - {repairOrder.equipment_type}</p>
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-muted-foreground">Fecha de Emisión</p>
            <p>{formatDate(invoice.issue_date)}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Estado</p>
            <p>{invoice.status}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Subtotal</p>
            <p>{formatCurrency(invoice.subtotal)}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">IVA ({invoice.tax_rate * 100}%)</p>{/* Assuming a tax_rate field exists */}
            <p>{formatCurrency(invoice.tax)}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Total</p>
            <p className="text-lg font-bold">{formatCurrency(invoice.total)}</p>
          </div>

          {invoice.notes && (
            <div className="md:col-span-2">
              <p className="text-sm font-medium text-muted-foreground">Notas</p>
              <p className="whitespace-pre-line">{invoice.notes}</p>
            </div>
          )}

          {/* AFIP Details */}
          {invoice.afip_status && (
            <div className="md:col-span-2 space-y-2">
              <h4 className="text-md font-medium">Detalles AFIP</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Estado AFIP</p>
                  <p>{invoice.afip_status}</p>
                </div>
                {invoice.afip_cae && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">CAE</p>
                    <p>{invoice.afip_cae}</p>
                  </div>
                )}
                {invoice.afip_expiration && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Vencimiento CAE</p>
                    <p>{formatDate(invoice.afip_expiration)}</p>
                  </div>
                )}
                 {invoice.afip_doc_type && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tipo Doc. AFIP</p>
                    <p>{invoice.afip_doc_type}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 pt-4">
           {/* Action Buttons */}
           {invoice.afip_status !== 'Autorizada' && (
             <Button 
               variant="outline" 
               onClick={() => onGenerateAfip(invoice.id)}
               disabled={isUpdating} // Assuming isUpdating covers AFIP generation
             >
               <FileText className="mr-2 h-4 w-4"/>
               Generar AFIP
             </Button>
           )}
           <Button variant="outline" onClick={() => onPrint(invoice.id)}>
             <Printer className="mr-2 h-4 w-4"/>
             Imprimir
           </Button>
           <Button variant="outline" onClick={() => onSendEmail(invoice.id)}>
             <Mail className="mr-2 h-4 w-4"/>
             Enviar Email
           </Button>
         </div>
      </CardContent>
    </Card>
  );
};

export default InvoiceDetails;
