
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Client } from "@/types";
import { useState, useEffect } from "react";
import { z } from "zod";

// Zod Schema for Client Validation
const clientSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
  phone: z.string().refine(value => /^[+]?[0-9]{9,15}$/.test(value), {
    message: "Número de teléfono inválido."
  }).optional().or(z.literal('')),
  email: z.string().email({ message: "Email inválido." }).optional().or(z.literal('')),
  address: z.string().optional(),
  identification: z.string().refine(value => {
    const cleaned = value.replace(/-/g, "");
    return (cleaned.length >= 7 && cleaned.length <= 8) || cleaned.length === 11; // DNI or CUIT
  }, {
    message: "DNI (7-8 dígitos) o CUIT (11 dígitos) inválido."
  }).optional().or(z.literal('')),
});

type ClientFormValues = z.infer<typeof clientSchema>;
type ClientFormErrors = z.ZodFormattedError<ClientFormValues> | null;

interface ClientFormProps {
  initialData?: Partial<Client>;
  onSubmit: (data: ClientFormValues) => void; // Ensure data matches schema
  onCancel: () => void;
  isSubmitting: boolean;
}

const ClientForm = ({ initialData, onSubmit, onCancel, isSubmitting }: ClientFormProps) => {
  const [formData, setFormData] = useState<Partial<Client>>({
    name: '',
    phone: '',
    email: '',
    address: '',
    identification: '',
    ...initialData, // Spread initialData to overwrite defaults if provided
  });
  const [errors, setErrors] = useState<ClientFormErrors>(null);

  useEffect(() => {
    // If initialData changes, update formData. This is useful for edit forms.
    setFormData({
      name: initialData?.name || '',
      phone: initialData?.phone || '',
      email: initialData?.email || '',
      address: initialData?.address || '',
      identification: initialData?.identification || '',
      ...initialData,
    });
    setErrors(null); // Clear errors when initialData changes
  }, [initialData]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear errors for the field being changed
    if (errors && errors[name as keyof ClientFormValues]) {
      setErrors(prevErrors => {
        if (!prevErrors) return null;
        const newErrors = { ...prevErrors };
        delete newErrors[name as keyof ClientFormValues];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors(null); // Clear previous errors

    const result = clientSchema.safeParse(formData);

    if (!result.success) {
      setErrors(result.error.format());
    } else {
      onSubmit(result.data);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre *</Label>
        <Input
          id="name"
          name="name"
          value={formData.name || ''}
          onChange={handleChange}
          placeholder="Nombre completo"
        />
        {errors?.name && <p className="text-red-500 text-sm">{errors.name._errors[0]}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="phone">Teléfono</Label>
        <Input
          id="phone"
          name="phone"
          value={formData.phone || ''}
          onChange={handleChange}
          placeholder="Teléfono de contacto"
        />
        {errors?.phone && <p className="text-red-500 text-sm">{errors.phone._errors[0]}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email || ''}
          onChange={handleChange}
          placeholder="correo@ejemplo.com"
        />
        {errors?.email && <p className="text-red-500 text-sm">{errors.email._errors[0]}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="address">Dirección</Label>
        <Input
          id="address"
          name="address"
          value={formData.address || ''}
          onChange={handleChange}
          placeholder="Dirección"
        />
        {/* No validation for address currently */}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="identification">DNI/CUIT</Label>
        <Input
          id="identification"
          name="identification"
          value={formData.identification || ''}
          onChange={handleChange}
          placeholder="Número de identificación"
        />
        {errors?.identification && <p className="text-red-500 text-sm">{errors.identification._errors[0]}</p>}
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : initialData?.id ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </form>
  );
};

export default ClientForm;
