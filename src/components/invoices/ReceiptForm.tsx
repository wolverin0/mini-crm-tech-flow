
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { ReceiptFormProps, Client } from "@/types";
import ClientSearch from "../clients/ClientSearch";
import { useQuery } from "@tanstack/react-query";
import { getClientById } from "@/services/clientService";
import { getOrderById } from "@/services/repairOrderService";

// Validation schema
const formSchema = z.object({
  client_id: z.string().min(1, "Cliente es requerido"),
  repair_order_id: z.string().optional(),
  issue_date: z.date(),
  amount: z.number().min(0, "El monto debe ser mayor o igual a 0"),
  status: z.string().default("Emitido"),
  notes: z.string().optional(),
});

const ReceiptForm = ({
  initialData,
  clientId,
  repairOrderId,
  onSubmit,
  onCancel,
  isSubmitting,
}: ReceiptFormProps) => {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Initialize form with default values or initial data
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      client_id: initialData?.client_id || clientId || "",
      repair_order_id: initialData?.repair_order_id || repairOrderId || "",
      issue_date: initialData?.issue_date
        ? new Date(initialData.issue_date)
        : new Date(),
      amount: initialData?.amount || 0,
      status: initialData?.status || "Emitido",
      notes: initialData?.notes || "",
    },
  });

  // Fetch client and repair order data if IDs are provided
  const { data: clientData } = useQuery({
    queryKey: ["client", form.watch("client_id")],
    queryFn: () => getClientById(form.watch("client_id")),
    enabled: !!form.watch("client_id"),
  });

  const { data: orderData } = useQuery({
    queryKey: ["repairOrder", form.watch("repair_order_id")],
    queryFn: () => getOrderById(form.watch("repair_order_id")),
    enabled: !!form.watch("repair_order_id"),
  });

  // Update selected client and order when data is fetched
  useEffect(() => {
    if (clientData && !selectedClient) {
      setSelectedClient(clientData);
    }
    if (orderData && !selectedOrder) {
      setSelectedOrder(orderData);
      // If we have order data and no existing amount, update form with order costs
      if (orderData.total_cost && form.getValues("amount") === 0) {
        form.setValue("amount", orderData.total_cost);
      }
    }
  }, [clientData, orderData, form, selectedClient, selectedOrder]);

  // Handle client selection
  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    form.setValue("client_id", client.id);
  };

  // Handle form submission
  const handleFormSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Prepare data for submission
      const formData = {
        ...values,
        issue_date: values.issue_date.toISOString(),
      };
      
      await onSubmit(formData);
    } catch (error: any) {
      toast.error(`Error al guardar recibo: ${error.message}`);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Client Selection */}
        <div className="mb-4">
          <FormLabel>Cliente</FormLabel>
          <ClientSearch
            onClientSelect={handleClientSelect}
            selectedClientId={form.watch("client_id")}
            buttonText="Seleccionar Cliente"
          />
          {form.formState.errors.client_id && (
            <p className="text-sm font-medium text-destructive mt-1">
              {form.formState.errors.client_id.message}
            </p>
          )}
        </div>

        {/* Repair Order Selection - Optional for receipts */}
        <FormField
          control={form.control}
          name="repair_order_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Orden de Reparación (Opcional)</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="ID de la Orden de Reparación"
                  disabled={isSubmitting} 
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
              <FormLabel>Fecha de Emisión</FormLabel>
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

        {/* Amount */}
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monto</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    field.onChange(value);
                  }}
                  disabled={isSubmitting}
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

export default ReceiptForm;
