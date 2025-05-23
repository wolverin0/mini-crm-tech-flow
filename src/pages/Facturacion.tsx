import { useState, useMemo } from "react"; // Added useMemo
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Loader2, Search, FileText, Plus, Mail, Printer, MessageCircle } from "lucide-react"; // Added MessageCircle
import { toast } from "sonner";
import InvoiceCard from "@/components/invoices/InvoiceCard";
// import ReceiptCard from "@/components/invoices/ReceiptCard"; // Will be replaced by a generic DocumentCard or similar
import InvoiceForm from "@/components/invoices/InvoiceForm"; // This will be our DocumentForm
// import ReceiptForm from "@/components/invoices/ReceiptForm"; // Removed
import InvoiceDetails from "@/components/invoices/InvoiceDetails"; // Import InvoiceDetails
import { 
  getInvoices, 
  updateInvoice, 
  generateAfipInvoice, 
  sendInvoiceByEmail, 
  createInvoice 
} from "@/services/invoiceService";
// import { 
//   getReceipts, 
//   createReceipt, 
//   updateReceipt, 
//   sendReceiptEmail 
// } from "@/services/receiptService"; // Removed
import { Invoice, Receipt } from "@/types"; // Receipt type might still be used for data structure if invoices table holds them
import PageHeader from "@/components/layout/PageHeader"; // Import PageHeader

const Facturacion = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [documentTypeToCreateForDialog, setDocumentTypeToCreateForDialog] = useState<'factura_a' | 'factura_b' | 'factura_c' | 'recibo' | 'presupuesto' | null>(null);
  const [isCreateDocumentDialogOpen, setIsCreateDocumentDialogOpen] = useState(false);
  const [initialDataForDialog, setInitialDataForDialog] = useState<Partial<Invoice> | null>(null); // New state
  const [selectedDocument, setSelectedDocument] = useState<Invoice | null>(null); // Invoice type now represents all documents
  const [isDocumentDetailsDialogOpen, setIsDocumentDetailsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: allDocumentsData = [], isLoading: isLoadingDocuments } = useQuery({
    queryKey: ["invoices"], // This query now fetches all documents
    queryFn: getInvoices 
  });

  const createDocumentMutation = useMutation({ // Renamed from createInvoiceMutation
    mutationFn: (document: Omit<Invoice, "id" | "created_at" | "updated_at" | "invoice_number">) => createInvoice(document),
    onSuccess: (data, variables) => { // Added data, variables to access submitted values if needed
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      setIsCreateDocumentDialogOpen(false);
      toast.success("Documento creado exitosamente");

      // Check if this creation was a conversion from a presupuesto
      if (initialDataForDialog && initialDataForDialog.doc_type === 'presupuesto' && initialDataForDialog.id) {
        updateDocumentMutation.mutate({ 
          id: initialDataForDialog.id, 
          updates: { status: 'Facturado' } 
        });
      }
      setInitialDataForDialog(null); // Clear initial data after successful creation/conversion
      setDocumentTypeToCreateForDialog(null); // Clear specific type after dialog closes
    },
    onError: (error) => {
      console.error("Error creating document:", error);
      toast.error("Error al crear el documento");
    }
  });

  const updateDocumentMutation = useMutation({ // Renamed from updateInvoiceMutation
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Invoice> }) => 
      updateInvoice(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Documento actualizado exitosamente");
      setIsDocumentDetailsDialogOpen(false); 
    },
    onError: (error) => {
      console.error("Error updating document:", error);
      toast.error("Error al actualizar el documento");
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

  // const createReceiptMutation = useMutation({
  //   mutationFn: (receipt: Omit<Receipt, "id" | "created_at" | "updated_at" | "receipt_number">) => createReceipt(receipt), // This service is removed
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ["receipts"] });
  //     setIsCreateReceiptDialogOpen(false);
  //     toast.success("Recibo creado exitosamente");
  //   },
  //   onError: (error) => {
  //     console.error("Error creating receipt:", error);
  //     toast.error("Error al crear el recibo");
  //   }
  // });

  // const updateReceiptMutation = useMutation({
  //   mutationFn: ({ id, updates }: { id: string; updates: Partial<Receipt> }) => 
  //     updateReceipt(id, updates), // This service is removed
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ["receipts"] });
  //     toast.success("Recibo actualizado exitosamente");
  //     setIsReceiptDetailsDialogOpen(false); // Close details dialog on successful update
  //   },
  //   onError: (error) => {
  //     console.error("Error updating receipt:", error);
  //     toast.error("Error al actualizar el recibo");
  //   }
  // });

  // const sendReceiptEmailMutation = useMutation({
  //   mutationFn: (receiptId: string) => sendReceiptEmail(receiptId), // This service is removed
  //   onSuccess: () => {
  //     toast.success("Correo enviado exitosamente");
  //   },
  //   onError: (error) => {
  //     console.error("Error sending email:", error);
  //     toast.error("Error al enviar el correo");
  //   }
  // });

  // Memoized filtered lists
  const filteredFacturas = useMemo(() => 
    allDocumentsData.filter(doc => 
      ['factura_a', 'factura_b', 'factura_c'].includes(doc.doc_type) && 
      (doc.invoice_number?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    ), [allDocumentsData, searchQuery]);

  const filteredRecibos = useMemo(() => 
    allDocumentsData.filter(doc => 
      doc.doc_type === 'recibo' && 
      (doc.invoice_number?.toLowerCase() || '').includes(searchQuery.toLowerCase()) // Assuming recibos also use invoice_number for now
    ), [allDocumentsData, searchQuery]);

  const filteredPresupuestos = useMemo(() => 
    allDocumentsData.filter(doc => 
      doc.doc_type === 'presupuesto' && 
      (doc.invoice_number?.toLowerCase() || '').includes(searchQuery.toLowerCase()) // Assuming presupuestos also use invoice_number
    ), [allDocumentsData, searchQuery]);

  const handleOpenConvertToFactura = (presupuesto: Invoice) => {
    setDocumentTypeToCreateForDialog('factura_b'); // Default to Factura B for conversion
    setInitialDataForDialog({
      ...presupuesto,
      // Important: Clear fields that should NOT be copied directly or should be re-evaluated
      invoice_number: "", // New factura should get a new number
      afip_cae: undefined,
      afip_expiration: undefined,
      afip_status: undefined, 
      status: 'Pendiente', // New factura starts as Pendiente
      // Keep client_id, items, amounts etc.
    });
    setIsCreateDocumentDialogOpen(true);
  };

  const handleCreateDocument = async (data: Partial<Invoice>): Promise<any> => { // Renamed from handleCreateInvoice
    // doc_type should be set within the form or passed via documentTypeToCreateForDialog
    // The form (InvoiceForm/DocumentForm) now handles setting doc_type correctly
    const documentData = {
      ...data,
      // Ensure other required fields from Invoice type that are not in Partial<Invoice> are handled if necessary
      // For now, assuming 'data' from form is shaped correctly by DocumentForm
    } as Omit<Invoice, "id" | "created_at" | "updated_at" | "invoice_number">;
    return createDocumentMutation.mutateAsync(documentData);
  };

  const handleUpdateDocument = (updates: Partial<Invoice>) => { // Renamed from handleUpdateInvoice
    if (selectedDocument) {
      updateDocumentMutation.mutate({ id: selectedDocument.id, updates });
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

  // const handleCreateReceipt = async (data: Partial<Receipt>): Promise<any> => {
  //   const receiptData: Omit<Receipt, "id" | "created_at" | "updated_at" | "receipt_number"> = {
  //     client_id: data.client_id!,
  //     repair_order_id: data.repair_order_id === '' ? null : data.repair_order_id,
  //     issue_date: data.issue_date || new Date().toISOString(),
  //     amount: data.amount!,
  //     status: data.status || "Emitido",
  //     notes: data.notes
  //   };
  //   // return createReceiptMutation.mutateAsync(receiptData); // This mutation is removed
  // };

  // const handleUpdateReceipt = (updates: Partial<Receipt>) => {
  //   if (selectedReceipt) {
  //     // updateReceiptMutation.mutate({ id: selectedReceipt.id, updates }); // This mutation is removed
  //   }
  // };

  // const handlePrintReceipt = (receiptId: string) => {
  //   console.log(`Printing receipt ${receiptId}`);
  //   toast.info("Imprimiendo recibo...");
  //   window.print(); // Basic print functionality
  // };

  // const handleSendReceiptEmail = async (receiptId: string): Promise<any> => {
  //   // return sendReceiptEmailMutation.mutateAsync(receiptId); // This mutation is removed
  // };

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
              <TabsTrigger value="presupuestos">Presupuestos</TabsTrigger> {/* New TabTrigger */}
            </TabsList>
            <TabsContent value="invoices" className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="relative">
                  <Search className="absolute left-2 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por N°..." // Unified search placeholder
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button size="sm" onClick={() => {
                  setDocumentTypeToCreateForDialog('factura_b'); // Default to factura_b
                  setIsCreateDocumentDialogOpen(true);
                }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva Factura
                </Button>
              </div>
              
              {isLoadingDocuments ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {filteredFacturas.map((factura) => (
                    <InvoiceCard
                      key={factura.id}
                      invoice={factura} // InvoiceCard expects 'invoice' prop
                      onView={() => {
                        setSelectedDocument(factura);
                        setIsDocumentDetailsDialogOpen(true);
                      }}
                      onAfipGenerate={handleGenerateAfip} 
                      onPrint={handlePrintInvoice}
                      onSendEmail={handleSendInvoiceEmail}
                      // onConvertToFactura is not for facturas
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
                    placeholder="Buscar por N°..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button size="sm" onClick={() => {
                  setDocumentTypeToCreateForDialog('recibo');
                  setIsCreateDocumentDialogOpen(true);
                }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Recibo
                </Button>
              </div>

              {isLoadingDocuments ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {filteredRecibos.map((recibo) => (
                    <InvoiceCard // Reusing InvoiceCard
                      key={recibo.id}
                      invoice={recibo} // InvoiceCard expects 'invoice' prop
                      onView={() => {
                        setSelectedDocument(recibo);
                        setIsDocumentDetailsDialogOpen(true);
                      }}
                      onPrint={handlePrintInvoice} 
                      onSendEmail={handleSendInvoiceEmail}
                      // onConvertToFactura is not for recibos
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="presupuestos" className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="relative">
                  <Search className="absolute left-2 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por N°..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                 <Button size="sm" onClick={() => {
                  setDocumentTypeToCreateForDialog('presupuesto');
                  setIsCreateDocumentDialogOpen(true);
                }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Presupuesto
                </Button>
              </div>
              
              {isLoadingDocuments ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {filteredPresupuestos.map((presupuesto) => (
                    <InvoiceCard // Reusing InvoiceCard
                      key={presupuesto.id}
                      invoice={presupuesto} // InvoiceCard expects 'invoice' prop
                      onView={() => {
                        setSelectedDocument(presupuesto);
                        setIsDocumentDetailsDialogOpen(true);
                      }}
                      onPrint={handlePrintInvoice}
                      onConvertToFactura={handleOpenConvertToFactura} // Add this handler
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Unified Create Document Dialog */}
      
      <Dialog 
        open={isCreateDocumentDialogOpen} 
        onOpenChange={(open) => {
          setIsCreateDocumentDialogOpen(open);
          if (!open) {
            setInitialDataForDialog(null); // Clear initial data when dialog closes
            setDocumentTypeToCreateForDialog(null); // Clear specific type
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              Crear Nuevo {documentTypeToCreateForDialog === 'factura_a' || documentTypeToCreateForDialog === 'factura_b' || documentTypeToCreateForDialog === 'factura_c' ? 'Factura' : documentTypeToCreateForDialog === 'recibo' ? 'Recibo' : 'Presupuesto'}
              {initialDataForDialog?.doc_type === 'presupuesto' && ' (desde Presupuesto)'}
            </DialogTitle>
          </DialogHeader>
          {documentTypeToCreateForDialog && ( // Ensure type is set before rendering form
            <InvoiceForm // This is our DocumentForm
              documentTypeToCreate={documentTypeToCreateForDialog}
              onSubmit={handleCreateDocument}
              onCancel={() => {
                setIsCreateDocumentDialogOpen(false);
                setInitialDataForDialog(null); // Clear initial data on cancel
                setDocumentTypeToCreateForDialog(null);
              }}
              isSubmitting={createDocumentMutation.isPending}
              initialData={initialDataForDialog || {}} // Pass initial data for conversion
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Unified Document Details Dialog */}
      {selectedDocument && (
        <Dialog open={isDocumentDetailsDialogOpen} onOpenChange={setIsDocumentDetailsDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Detalles del Documento</DialogTitle> {/* Generic Title */}
            </DialogHeader>
            <InvoiceDetails // InvoiceDetails needs to handle different doc_types
              invoice={selectedDocument}
              onUpdate={handleUpdateDocument}
              onGenerateAfip={handleGenerateAfip} // Conditional in InvoiceDetails
              onPrint={handlePrintInvoice}
              onSendEmail={handleSendInvoiceEmail} // Conditional in InvoiceDetails
              isUpdating={updateDocumentMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Facturacion;
