import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Removed CardDescription as it's in PageHeader
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Loader2, Search, FileText, Plus, Mail, Printer, MessageCircle } from "lucide-react"; // Added MessageCircle
import { toast } from "sonner";
import InvoiceCard from "@/components/invoices/InvoiceCard";
import ReceiptCard from "@/components/invoices/ReceiptCard";
import InvoiceForm from "@/components/invoices/InvoiceForm";
import ReceiptForm from "@/components/invoices/ReceiptForm";
import InvoiceDetails from "@/components/invoices/InvoiceDetails"; // Import InvoiceDetails
import { 
  getInvoices, 
  updateInvoice, 
  generateAfipInvoice, 
  sendInvoiceByEmail, 
  createInvoice 
} from "@/services/invoiceService";
import { 
  getReceipts, 
  createReceipt, 
  updateReceipt, 
  sendReceiptEmail 
} from "@/services/receiptService";
import { Invoice, Receipt } from "@/types";
import PageHeader from "@/components/layout/PageHeader"; // Import PageHeader

const Facturacion = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [isCreateInvoiceDialogOpen, setIsCreateInvoiceDialogOpen] = useState(false);
  const [isCreateReceiptDialogOpen, setIsCreateReceiptDialogOpen] = useState(false);
  const [isInvoiceDetailsDialogOpen, setIsInvoiceDetailsDialogOpen] = useState(false);
  const [isReceiptDetailsDialogOpen, setIsReceiptDetailsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: invoices = [], isLoading: isLoadingInvoices } = useQuery({
    queryKey: ["invoices"],
    queryFn: getInvoices
  });

  const { data: receipts = [], isLoading: isLoadingReceipts } = useQuery({
    queryKey: ["receipts"],
    queryFn: getReceipts
  });

  const createInvoiceMutation = useMutation({
    mutationFn: (invoice: Omit<Invoice, "id" | "created_at" | "updated_at" | "invoice_number">) => createInvoice(invoice),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      setIsCreateInvoiceDialogOpen(false);
      toast.success("Factura creada exitosamente");
    },
    onError: (error) => {
      console.error("Error creating invoice:", error);
      toast.error("Error al crear la factura");
    }
  });

  const updateInvoiceMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Invoice> }) => 
      updateInvoice(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Factura actualizada exitosamente");
      setIsInvoiceDetailsDialogOpen(false); // Close details dialog on successful update
    },
    onError: (error) => {
      console.error("Error updating invoice:", error);
      toast.error("Error al actualizar la factura");
    }
  });

  const generateAfipMutation = useMutation({
    mutationFn: (invoiceId: string) => generateAfipInvoice(invoiceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Factura generada en AFIP exitosamente");
    },
    onError: (error) => {
      console.error("Error generating AFIP invoice:", error);
      toast.error("Error al generar la factura en AFIP");
    }
  });

  const sendInvoiceEmailMutation = useMutation({
    mutationFn: (invoiceId: string) => sendInvoiceByEmail(invoiceId),
    onSuccess: () => {
      toast.success("Correo enviado exitosamente");
    },
    onError: (error) => {
      console.error("Error sending email:", error);
      toast.error("Error al enviar el correo");
    }
  });

  const createReceiptMutation = useMutation({
    mutationFn: (receipt: Omit<Receipt, "id" | "created_at" | "updated_at" | "receipt_number">) => createReceipt(receipt),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receipts"] });
      setIsCreateReceiptDialogOpen(false);
      toast.success("Recibo creado exitosamente");
    },
    onError: (error) => {
      console.error("Error creating receipt:", error);
      toast.error("Error al crear el recibo");
    }
  });

  const updateReceiptMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Receipt> }) => 
      updateReceipt(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receipts"] });
      toast.success("Recibo actualizado exitosamente");
      setIsReceiptDetailsDialogOpen(false); // Close details dialog on successful update
    },
    onError: (error) => {
      console.error("Error updating receipt:", error);
      toast.error("Error al actualizar el recibo");
    }
  });

  const sendReceiptEmailMutation = useMutation({
    mutationFn: (receiptId: string) => sendReceiptEmail(receiptId),
    onSuccess: () => {
      toast.success("Correo enviado exitosamente");
    },
    onError: (error) => {
      console.error("Error sending email:", error);
      toast.error("Error al enviar el correo");
    }
  });

  const filteredInvoices = invoices.filter(invoice =>
    invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredReceipts = receipts.filter(receipt =>
    receipt.receipt_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateInvoice = async (data: Partial<Invoice>): Promise<any> => {
    const invoiceData: Omit<Invoice, "id" | "created_at" | "updated_at" | "invoice_number"> = {
      client_id: data.client_id!,
      repair_order_id: data.repair_order_id === '' ? null : data.repair_order_id,
      issue_date: data.issue_date || new Date().toISOString(),
      subtotal: data.subtotal!,
      tax: data.tax || 0,
      total: data.total!,
      status: data.status || "Pendiente",
      notes: data.notes,
      afip_status: data.afip_status,
      afip_cae: data.afip_cae,
      afip_expiration: data.afip_expiration,
      afip_doc_type: data.afip_doc_type,
    };
    return createInvoiceMutation.mutateAsync(invoiceData);
  };

  const handleUpdateInvoice = (updates: Partial<Invoice>) => {
    if (selectedInvoice) {
      updateInvoiceMutation.mutate({ id: selectedInvoice.id, updates });
    }
  };

  const handleGenerateAfip = async (invoiceId: string): Promise<void> => {
    await generateAfipMutation.mutateAsync(invoiceId);
  };

  const handlePrintInvoice = (invoiceId: string) => {
    console.log(`Printing invoice ${invoiceId}`);
    toast.info("Imprimiendo factura...");
    window.print(); // Basic print functionality
  };

  const handleSendInvoiceEmail = async (invoiceId: string): Promise<any> => {
    return sendInvoiceEmailMutation.mutateAsync(invoiceId);
  };

  const handleCreateReceipt = async (data: Partial<Receipt>): Promise<any> => {
    const receiptData: Omit<Receipt, "id" | "created_at" | "updated_at" | "receipt_number"> = {
      client_id: data.client_id!,
      repair_order_id: data.repair_order_id === '' ? null : data.repair_order_id,
      issue_date: data.issue_date || new Date().toISOString(),
      amount: data.amount!,
      status: data.status || "Emitido",
      notes: data.notes
    };
    return createReceiptMutation.mutateAsync(receiptData);
  };

  const handleUpdateReceipt = (updates: Partial<Receipt>) => {
    if (selectedReceipt) {
      updateReceiptMutation.mutate({ id: selectedReceipt.id, updates });
    }
  };

  const handlePrintReceipt = (receiptId: string) => {
    console.log(`Printing receipt ${receiptId}`);
    toast.info("Imprimiendo recibo...");
    window.print(); // Basic print functionality
  };

  const handleSendReceiptEmail = async (receiptId: string): Promise<any> => {
    return sendReceiptEmailMutation.mutateAsync(receiptId);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Facturación" description="Gestión de facturas y recibos." />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Listado Principal</CardTitle> {/* Updated CardTitle */}
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="invoices" className="space-y-4">
            <TabsList>
              <TabsTrigger value="invoices">Facturas</TabsTrigger>
              <TabsTrigger value="receipts">Recibos</TabsTrigger>
            </TabsList>
            <TabsContent value="invoices" className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="relative">
                  <Search className="absolute left-2 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar factura..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Dialog open={isCreateInvoiceDialogOpen} onOpenChange={setIsCreateInvoiceDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Nueva Factura
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Crear Nueva Factura</DialogTitle>
                    </DialogHeader>
                    <InvoiceForm 
                      onSubmit={handleCreateInvoice}
                      onCancel={() => setIsCreateInvoiceDialogOpen(false)}
                      isSubmitting={createInvoiceMutation.isPending}
                    />
                  </DialogContent>
                </Dialog>
              </div>
              
              {isLoadingInvoices ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {filteredInvoices.map((invoice) => (
                    <InvoiceCard
                      key={invoice.id}
                      invoice={invoice}
                      onView={() => {
                        setSelectedInvoice(invoice);
                        setIsInvoiceDetailsDialogOpen(true);
                      }}
                      onAfipGenerate={handleGenerateAfip}
                      onPrint={handlePrintInvoice}
                      onSendEmail={handleSendInvoiceEmail}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="receipts" className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="relative">
                  <Search className="absolute left-2 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar recibo..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Dialog open={isCreateReceiptDialogOpen} onOpenChange={setIsCreateReceiptDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Nuevo Recibo
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Crear Nuevo Recibo</DialogTitle>
                    </DialogHeader>
                    <ReceiptForm
                      onSubmit={handleCreateReceipt}
                      onCancel={() => setIsCreateReceiptDialogOpen(false)}
                      isSubmitting={createReceiptMutation.isPending}
                    />
                  </DialogContent>
                </Dialog>
              </div>

              {isLoadingReceipts ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {filteredReceipts.map((receipt) => (
                    <ReceiptCard
                      key={receipt.id}
                      receipt={receipt}
                      onView={() => {
                        setSelectedReceipt(receipt);
                        setIsReceiptDetailsDialogOpen(true);
                      }}
                      onPrint={handlePrintReceipt}
                      onSendEmail={handleSendReceiptEmail}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {selectedInvoice && (
        <Dialog open={isInvoiceDetailsDialogOpen} onOpenChange={setIsInvoiceDetailsDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Detalles de la Factura</DialogTitle>
            </DialogHeader>
            <InvoiceDetails
              invoice={selectedInvoice}
              onUpdate={handleUpdateInvoice}
              onGenerateAfip={handleGenerateAfip}
              onPrint={handlePrintInvoice}
              onSendEmail={handleSendInvoiceEmail}
              isUpdating={updateInvoiceMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      )}

      {selectedReceipt && (
        <Dialog open={isReceiptDetailsDialogOpen} onOpenChange={setIsReceiptDetailsDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Detalles del Recibo</DialogTitle>
            </DialogHeader>
            {/* Placeholder for ReceiptDetails component */}
            <div>Recibo ID: {selectedReceipt.id}</div>
            <Button onClick={() => handlePrintReceipt(selectedReceipt.id)}>Imprimir Recibo</Button>
            <Button onClick={() => handleSendReceiptEmail(selectedReceipt.id)}>Enviar Recibo por Email</Button>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Facturacion;
