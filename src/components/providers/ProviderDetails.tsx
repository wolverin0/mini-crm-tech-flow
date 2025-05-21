
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Building2, Edit, MessageCircle, Save, Trash, User } from "lucide-react";
import { Provider } from "@/types";
import { format } from "date-fns";

interface ProviderDetailsProps {
  provider: Provider;
  onUpdate: (updates: Partial<Provider>) => void;
  onDelete: () => void;
  isUpdating: boolean;
  isDeleting: boolean;
}

const ProviderDetails = ({
  provider,
  onUpdate,
  onDelete,
  isUpdating,
  isDeleting,
}: ProviderDetailsProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Provider>>(provider);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (value: "persona" | "company") => {
    setFormData((prev) => ({ ...prev, type: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  const openWhatsApp = (phone: string) => {
    // Clean the phone number (remove spaces, dashes, etc.)
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  return (
    <>
      <Card>
        <CardContent className="pt-6">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name || ""}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <RadioGroup
                    value={formData.type}
                    onValueChange={handleTypeChange as (value: string) => void}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="persona" id="persona" />
                      <Label htmlFor="persona" className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        Persona
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="company" id="company" />
                      <Label htmlFor="company" className="flex items-center">
                        <Building2 className="h-4 w-4 mr-1" />
                        Empresa
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {formData.type === "company" && (
                  <div className="space-y-2">
                    <Label htmlFor="business_name">Razón Social</Label>
                    <Input
                      id="business_name"
                      name="business_name"
                      value={formData.business_name || ""}
                      onChange={handleChange}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="tax_id">CUIT/DNI</Label>
                  <Input
                    id="tax_id"
                    name="tax_id"
                    value={formData.tax_id || ""}
                    onChange={handleChange}
                  />
                </div>

                {formData.type === "company" && (
                  <div className="space-y-2">
                    <Label htmlFor="contact_name">Nombre de Contacto</Label>
                    <Input
                      id="contact_name"
                      name="contact_name"
                      value={formData.contact_name || ""}
                      onChange={handleChange}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone || ""}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email || ""}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Dirección</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address || ""}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="notes">Notas</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes || ""}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Guardar
                    </>
                  )}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium">{provider.name}</h3>
                  {provider.business_name && (
                    <p className="text-sm text-muted-foreground">
                      {provider.business_name}
                    </p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Eliminar
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tipo</p>
                  <p className="flex items-center">
                    {provider.type === "persona" ? (
                      <>
                        <User className="h-4 w-4 mr-1.5" />
                        <span>Persona</span>
                      </>
                    ) : (
                      <>
                        <Building2 className="h-4 w-4 mr-1.5" />
                        <span>Empresa</span>
                      </>
                    )}
                  </p>
                </div>

                {provider.tax_id && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">CUIT/DNI</p>
                    <p>{provider.tax_id}</p>
                  </div>
                )}

                {provider.contact_name && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Contacto</p>
                    <p>{provider.contact_name}</p>
                  </div>
                )}

                {provider.phone && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Teléfono</p>
                    <div className="flex items-center gap-2">
                      <p>{provider.phone}</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center gap-1 px-2 h-7 text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700"
                        onClick={() => openWhatsApp(provider.phone || '')}
                      >
                        <MessageCircle className="h-4 w-4" />
                        WhatsApp
                      </Button>
                    </div>
                  </div>
                )}

                {provider.email && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p>{provider.email}</p>
                  </div>
                )}

                {provider.address && (
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-muted-foreground">Dirección</p>
                    <p>{provider.address}</p>
                  </div>
                )}

                {provider.notes && (
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-muted-foreground">Notas</p>
                    <p className="whitespace-pre-line">{provider.notes}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-muted-foreground">Creado</p>
                  <p className="text-sm">{formatDate(provider.created_at)}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">Última Actualización</p>
                  <p className="text-sm">{formatDate(provider.updated_at)}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el proveedor y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ProviderDetails;
