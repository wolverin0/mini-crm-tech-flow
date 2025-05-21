
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Client } from "@/types";
import { useState } from "react";

interface ClientFormProps {
  initialData?: Partial<Client>;
  onSubmit: (data: Partial<Client>) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const ClientForm = ({ initialData, onSubmit, onCancel, isSubmitting }: ClientFormProps) => {
  const [formData, setFormData] = useState<Partial<Client>>({
    name: initialData?.name || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    address: initialData?.address || '',
    identification: initialData?.identification || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
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
          required
        />
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
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
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
