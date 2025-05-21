
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { InventoryItem, Provider } from "@/types";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import ProviderSearch from "../providers/ProviderSearch";

const formSchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
  description: z.string().optional(),
  supplier: z.string().optional(),
  quantity: z.coerce.number().int().min(0, { message: "La cantidad no puede ser negativa" }),
  cost_price: z.coerce.number().min(0, { message: "El precio de costo no puede ser negativo" }),
  selling_price: z.coerce.number().min(0, { message: "El precio de venta no puede ser negativo" }),
  minimum_stock: z.coerce.number().int().min(0, { message: "El stock mínimo no puede ser negativo" }).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface InventoryFormProps {
  initialData: Partial<InventoryItem>;
  onSubmit: (data: FormValues) => Promise<any>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const InventoryForm = ({ initialData, onSubmit, onCancel, isSubmitting }: InventoryFormProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      supplier: initialData?.supplier || "",
      quantity: initialData?.quantity || 0,
      cost_price: initialData?.cost_price || 0,
      selling_price: initialData?.selling_price || 0,
      minimum_stock: initialData?.minimum_stock || 1,
    }
  });

  const handleSubmit = async (data: FormValues) => {
    await onSubmit(data);
  };

  const handleProviderSelect = (provider: Provider) => {
    form.setValue("supplier", provider.name);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del Producto</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Batería para laptop" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="supplier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Proveedor</FormLabel>
                <FormControl>
                  <>
                    <Input {...field} placeholder="Proveedor" />
                    <ProviderSearch 
                      onSelectProvider={handleProviderSelect}
                      buttonText="Seleccionar"
                      className="mt-2"
                    />
                  </>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descripción detallada del producto..."
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cantidad</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="minimum_stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock Mínimo</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="cost_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio de Costo ($)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="selling_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio de Venta ($)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onCancel} type="button">
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : (initialData && initialData.id ? "Actualizar" : "Crear")}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default InventoryForm;
