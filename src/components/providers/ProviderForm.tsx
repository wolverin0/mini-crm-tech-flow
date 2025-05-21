
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Provider } from "@/types";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
  type: z.enum(["persona", "company"], { 
    message: "Debe seleccionar un tipo: Persona física o Empresa" 
  }),
  tax_id: z.string().min(5, { message: "El CUIT/DNI debe tener al menos 5 caracteres" }),
  business_name: z.string().optional(), // Stays optional here, handled by superRefine
  contact_name: z.string().optional(), // Stays optional here, handled by superRefine
  phone: z.string().min(7, { message: "El teléfono debe tener al menos 7 caracteres" }),
  email: z.string().min(1, { message: "El email es requerido" }).email({ message: "Email inválido" }),
  address: z.string().min(5, { message: "La dirección debe tener al menos 5 caracteres" }),
  notes: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.type === "company") {
    if (!data.business_name || data.business_name.trim().length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La Razón Social debe tener al menos 2 caracteres para empresas.",
        path: ["business_name"],
      });
    }
    if (!data.contact_name || data.contact_name.trim().length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El Nombre de Contacto debe tener al menos 2 caracteres para empresas.",
        path: ["contact_name"],
      });
    }
  }
});

type FormValues = z.infer<typeof formSchema>;

interface ProviderFormProps {
  initialData?: Partial<Provider>;
  onSubmit: (data: FormValues) => Promise<any>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const ProviderForm = ({ initialData, onSubmit, onCancel, isSubmitting }: ProviderFormProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      type: initialData?.type || "persona",
      tax_id: initialData?.tax_id || "",
      business_name: initialData?.business_name || "",
      contact_name: initialData?.contact_name || "",
      phone: initialData?.phone || "",
      email: initialData?.email || "",
      address: initialData?.address || "",
      notes: initialData?.notes || "",
    }
  });

  const handleSubmit = async (data: FormValues) => {
    await onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Tipo de Proveedor</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="persona" id="persona" />
                    <Label htmlFor="persona">Persona física</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="company" id="company" />
                    <Label htmlFor="company">Empresa</Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre *</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre del proveedor" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="tax_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CUIT/DNI *</FormLabel>
                <FormControl>
                  <Input placeholder="CUIT o DNI" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {form.watch("type") === "company" && (
          <FormField
            control={form.control}
            name="business_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Razón Social *</FormLabel>
                <FormControl>
                  <Input placeholder="Razón social de la empresa" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {form.watch("type") === "company" && (
          <FormField
            control={form.control}
            name="contact_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre de Contacto *</FormLabel>
                <FormControl>
                  <Input placeholder="Persona de contacto" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono *</FormLabel>
                <FormControl>
                  <Input placeholder="Número de teléfono" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email *</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dirección *</FormLabel>
              <FormControl>
                <Input placeholder="Dirección completa" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Notas o información adicional"
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onCancel} type="button">
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : (initialData?.id ? "Actualizar" : "Crear")}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProviderForm;
