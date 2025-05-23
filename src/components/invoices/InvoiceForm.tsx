import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { CalendarIcon, Trash } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label"; // Added Label import
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { InvoiceFormProps, Client, RepairOrder } from "@/types"; // Added RepairOrder type
import ClientSearch from "../clients/ClientSearch";
import RepairOrderSearch from "../repairs/RepairOrderSearch"; // Imported RepairOrderSearch
import { useQuery } from "@tanstack/react-query";
import { getClientById } from "@/services/clientService";
import { getOrderById } from "@/services/repairOrderService";

// Validation schema
const formSchema = z.object({
  doc_type: z.string(), // Added doc_type
  client_id: z.string().optional(), // Made client_id optional
  // repair_order_id is now populated via selection, schema updated to reflect this
  repair_order_id: z.union([z.literal(''), z.string().uuid("Formato de UUID inválido")]).optional(),
  issue_date: z.date(),
  subtotal: z.number().min(0, "El subtotal debe ser mayor o igual a 0"),
  tax: z.number().min(0, "El IVA debe ser mayor o igual a 0"),
  total: z.number().min(0, "El total debe ser mayor o igual a 0"),
  status: z.string().default("Pendiente"),
  notes: z.string().optional(),
  afip_doc_type: z.string().optional(),
});

// This will become DocumentFormProps conceptually
interface DocumentFormProps extends InvoiceFormProps { 
  documentTypeToCreate: 'factura_a' | 'factura_b' | 'factura_c' | 'recibo' | 'presupuesto';
}

const InvoiceForm = ({ // Will be renamed to DocumentForm
  initialData,
  clientId,
  repairOrderId,
  onSubmit,
  onCancel,
  isSubmitting,
  documentTypeToCreate, // Added new prop
}: DocumentFormProps) => {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  // selectedOrder state is now managed by the form's repair_order_id and fetched via useQuery
  // const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const IVA_RATE = 0.21;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      doc_type: documentTypeToCreate, // Set doc_type from prop
      client_id: initialData?.client_id || clientId || "",
      repair_order_id: initialData?.repair_order_id || repairOrderId || "",
      issue_date: initialData?.issue_date
        ? new Date(initialData.issue_date)
        : new Date(),
      subtotal: initialData?.subtotal || 0,
      tax: initialData?.tax || 0,
      total: initialData?.total || 0,
      status: initialData?.status || "Pendiente",
      notes: initialData?.notes || "",
      afip_doc_type: initialData?.afip_doc_type || (documentTypeToCreate === 'factura_a' || documentTypeToCreate === 'factura_b' || documentTypeToCreate === 'factura_c' ? "B" : ""), // Default AFIP type for facturas
    },
  });

  // Watch relevant form values
  const subtotal = form.watch("subtotal");
  const currentClientId = form.watch("client_id");
  const currentRepairOrderId = form.watch("repair_order_id");

  // Effect to update tax and total when subtotal changes
  useEffect(() => {
    const calculatedTax = subtotal * IVA_RATE;
    form.setValue("tax", calculatedTax);
    form.setValue("total", subtotal + calculatedTax);
  }, [subtotal, form]);

  // Fetch client data
  const { data: clientData } = useQuery({
    queryKey: ["client", currentClientId],
    queryFn: () => getClientById(currentClientId!),
    enabled: !!currentClientId,
  });

  // Fetch repair order data if a repair order is selected
  const { data: orderData, isLoading: isLoadingOrder } = useQuery({
    queryKey: ["repairOrder", currentRepairOrderId],
    queryFn: () => getOrderById(currentRepairOrderId),
    enabled: !!currentRepairOrderId && currentRepairOrderId !== "",
  });

  // Effect to update selected client state when clientData is fetched
  useEffect(() => {
    if (clientData) {
      setSelectedClient(clientData);
    } else if (!currentClientId) { 
      setSelectedClient(null);    
    }
  }, [clientData, currentClientId]); 

  // Effect to update form fields when orderData is fetched (e.g., on initial load with initialData)
  useEffect(() => {
    if (orderData) {
      // If we have order data and the subtotal is 0, update form with order costs
      if (orderData.total_cost && form.getValues("subtotal") === 0) {
        form.setValue("subtotal", orderData.total_cost);
        // Tax and Total will be calculated by the subtotal watcher effect
      }
    }
  }, [orderData, form]);


  // Handle client selection from ClientSearch
  const handleClientSelect = (client: Client | null) => {
    setSelectedClient(client);
    form.setValue("client_id", client ? client.id : "");
    // Clear selected repair order when client changes
    form.setValue("repair_order_id", "");
  };

  // Handle repair order selection from RepairOrderSearch
  const handleRepairOrderSelect = (order: RepairOrder | null) => {
    form.setValue("repair_order_id", order ? order.id : "");
    // Optionally update subtotal based on selected order here as well
    if (order?.total_cost) {
       form.setValue("subtotal", order.total_cost);
    } else if (order === null) {
       // Clear subtotal if order selection is cleared
       form.setValue("subtotal", 0);
    }
  };


  // Handle form submission
  const handleFormSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const isFactura = documentTypeToCreate === 'factura_a' || documentTypeToCreate === 'factura_b' || documentTypeToCreate === 'factura_c';
      if (isFactura && !values.client_id) {
        form.setError("client_id", { type: "manual", message: "Cliente es requerido para facturas." });
        return;
      }

      const formData = {
        ...values,
        doc_type: documentTypeToCreate, // Ensure doc_type is explicitly set from the prop
        issue_date: values.issue_date.toISOString(),
        repair_order_id: values.repair_order_id === '' ? null : values.repair_order_id,
        client_id: values.client_id === '' ? null : values.client_id, // Handle optional client_id
        afip_doc_type: isFactura ? values.afip_doc_type : null, // Set afip_doc_type to null if not a factura
      };

      await onSubmit(formData as any);
    } catch (error: any) {
      toast.error(`Error al guardar el documento: ${error.message}`);
    }
  };

  const afipDocumentTypes = [
    { value: "B", label: "Factura B" }, // Default often B
    { value: "A", label: "Factura A" },
    { value: "C", label: "Factura C" },
    // Add other AFIP types if necessary, e.g., Nota de Crédito, etc.
  ];
  
  const clientLabel = 
    documentTypeToCreate === 'recibo' || documentTypeToCreate === 'presupuesto' 
    ? "Cliente (Opcional)" 
    : "Cliente *";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Client Selection */}
        <div className="mb-4 space-y-2"> {/* Added space-y-2 for better layout with checkbox */}
          <FormLabel>{clientLabel}</FormLabel>
          
          {(documentTypeToCreate === 'recibo' || documentTypeToCreate === 'presupuesto') && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="consumidorFinalCheckbox"
                checked={!currentClientId} 
                onCheckedChange={(checked) => {
                  if (checked) {
                    form.setValue("client_id", ""); 
                    // setSelectedClient(null); // This will be handled by the useEffect watching currentClientId
                  }
                  // Unchecking allows manual selection via ClientSearch, no specific action needed here
                }}
              />
              <Label htmlFor="consumidorFinalCheckbox" className="text-sm font-medium">
                Emitir como Consumidor Final
              </Label>
            </div>
          )}

          <ClientSearch
            onClientSelect={handleClientSelect}
            selectedClientId={currentClientId}
            buttonText="Seleccionar Cliente"
            disabled={isSubmitting || (!currentClientId && (documentTypeToCreate === 'recibo' || documentTypeToCreate === 'presupuesto'))}
          />
          {form.formState.errors.client_id && 
            (documentTypeToCreate === 'factura_a' || documentTypeToCreate === 'factura_b' || documentTypeToCreate === 'factura_c') && (
              <p className="text-sm font-medium text-destructive mt-1">
                {form.formState.errors.client_id.message}
              </p>
          )}
        </div>

        {/* Repair Order Selection */}
        <FormField
          control={form.control}
          name="repair_order_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Orden de Reparación (Opcional)</FormLabel>
              <FormControl>
                 <RepairOrderSearch
                   clientId={currentClientId} // Pass the selected client ID
                   onOrderSelect={handleRepairOrderSelect} // Handle order selection
                   selectedOrderId={field.value || null} // Pass current form value
                   buttonText="Seleccionar o buscar Orden de Reparación"
                 />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Issue Date */}
        <FormField
          control={form.control}
          name="issue_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Fecha de Emisión *</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                      disabled={isSubmitting}
                    >
                      {field.value ? (
                        format(field.value, "PPP", { locale: es })
                      ) : (
                        <span>Seleccionar fecha</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date > new Date()}
                    initialFocus
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* AFIP Document Type - Conditional Rendering */}
        {(documentTypeToCreate === 'factura_a' || documentTypeToCreate === 'factura_b' || documentTypeToCreate === 'factura_c') && (
          <FormField
            control={form.control}
            name="afip_doc_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Documento AFIP</FormLabel>
                <FormControl>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    {...field}
                    disabled={isSubmitting}
                  >
                    {afipDocumentTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Subtotal */}
        <FormField
          control={form.control}
          name="subtotal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subtotal *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    field.onChange(value);
                    // Tax and Total are now calculated by the subtotal watcher effect
                  }}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Tax */}
        <FormField
          control={form.control}
          name="tax"
          render={({ field }) => (
            <FormItem>
              <FormLabel>IVA ({IVA_RATE * 100}%)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  disabled={true} // Tax is calculated automatically
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Total */}
        <FormField
          control={form.control}
          name="total"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  disabled={true} // Total is calculated automatically
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Notas adicionales"
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Form Actions */}
        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default InvoiceForm;
