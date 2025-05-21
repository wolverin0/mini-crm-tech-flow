
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RepairOrder, Client } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getClients } from "@/services/clientService";
import { format } from "date-fns";

interface RepairOrderFormProps {
  initialData?: Partial<RepairOrder>;
  onSubmit: (data: Partial<RepairOrder>) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const STATUS_OPTIONS = [
  "Ingresado",
  "En diagnóstico",
  "Esperando repuesto",
  "Esperando aprobación",
  "Reparado",
  "Entregado",
  "No reparado/Cancelado"
];

const RepairOrderForm = ({ initialData, onSubmit, onCancel, isSubmitting }: RepairOrderFormProps) => {
  const [formData, setFormData] = useState<Partial<RepairOrder>>({
    equipment_type: initialData?.equipment_type || '',
    equipment_brand: initialData?.equipment_brand || '',
    equipment_model: initialData?.equipment_model || '',
    serial_number: initialData?.serial_number || '',
    reported_issue: initialData?.reported_issue || '',
    client_id: initialData?.client_id || '',
    status: initialData?.status || 'Ingresado',
    technical_diagnosis: initialData?.technical_diagnosis || '',
    estimated_delivery_date: initialData?.estimated_delivery_date ? format(new Date(initialData.estimated_delivery_date), 'yyyy-MM-dd') : '',
    assigned_technician: initialData?.assigned_technician || '',
    budget: initialData?.budget || undefined,
    labor_cost: initialData?.labor_cost || undefined,
  });

  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    const loadClients = async () => {
      const clientsData = await getClients();
      setClients(clientsData);
    };
    loadClients();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value === '' ? undefined : parseFloat(value) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="client_id">Cliente *</Label>
          <Select
            value={formData.client_id?.toString() || ''}
            onValueChange={(value) => handleSelectChange('client_id', value)}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccione un cliente" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="equipment_type">Tipo de Equipo *</Label>
          <Input
            id="equipment_type"
            name="equipment_type"
            value={formData.equipment_type || ''}
            onChange={handleChange}
            placeholder="Notebook, PC, Impresora, etc."
            required
          />
        </div>

        {/* Row for Marca, Modelo, Numero de Serie */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:col-span-2">
          <div className="space-y-2">
            <Label htmlFor="equipment_brand">Marca</Label>
            <Input
              id="equipment_brand"
              name="equipment_brand"
              value={formData.equipment_brand || ''}
              onChange={handleChange}
              placeholder="HP, Dell, Samsung, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="equipment_model">Modelo</Label>
            <Input
              id="equipment_model"
              name="equipment_model"
              value={formData.equipment_model || ''}
              onChange={handleChange}
              placeholder="Modelo del equipo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="serial_number">Número de Serie</Label>
            <Input
              id="serial_number"
              name="serial_number"
              value={formData.serial_number || ''}
              onChange={handleChange}
              placeholder="Número de serie o identificación"
            />
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="reported_issue">Problema Reportado</Label>
          <Textarea
            id="reported_issue"
            name="reported_issue"
            value={formData.reported_issue || ''}
            onChange={handleChange}
            placeholder="Descripción del problema según el cliente"
            rows={3}
          />
        </div>

        {initialData?.id && (
          <>
            {/* Row for Estado, Tecnico Asignado, Fecha Estimada de Entrega */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:col-span-2">
              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select
                  value={formData.status || 'Ingresado'}
                  onValueChange={(value) => handleSelectChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assigned_technician">Técnico Asignado</Label>
                <Input
                  id="assigned_technician"
                  name="assigned_technician"
                  value={formData.assigned_technician || ''}
                  onChange={handleChange}
                  placeholder="Nombre del técnico"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimated_delivery_date">Fecha Estimada de Entrega</Label>
                <Input
                  id="estimated_delivery_date"
                  name="estimated_delivery_date"
                  type="date"
                  value={formData.estimated_delivery_date || ''}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="technical_diagnosis">Diagnóstico Técnico</Label>
              <Textarea
                id="technical_diagnosis"
                name="technical_diagnosis"
                value={formData.technical_diagnosis || ''}
                onChange={handleChange}
                placeholder="Diagnóstico técnico del problema"
                rows={3}
              />
            </div>

            {/* Row for Presupuesto, Costo de Mano de Obra */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2">
              <div className="space-y-2">
                <Label htmlFor="budget">Presupuesto</Label>
                <Input
                  id="budget"
                  name="budget"
                  type="number"
                  step="0.01"
                  value={formData.budget === undefined ? '' : formData.budget}
                  onChange={handleNumberChange}
                  placeholder="Presupuesto total"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="labor_cost">Costo de Mano de Obra</Label>
                <Input
                  id="labor_cost"
                  name="labor_cost"
                  type="number"
                  step="0.01"
                  value={formData.labor_cost === undefined ? '' : formData.labor_cost}
                  onChange={handleNumberChange}
                  placeholder="Costo de mano de obra"
                />
              </div>
            </div>
          </>
        )}
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

export default RepairOrderForm;
