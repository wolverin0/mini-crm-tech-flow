
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { StockAdjustmentFormProps } from "@/types";
import { toast } from "sonner";

const StockAdjustmentForm = ({ 
  item, 
  onSubmit, 
  onCancel, 
  isSubmitting 
}: StockAdjustmentFormProps) => {
  const [quantity, setQuantity] = useState(1);
  const [operation, setOperation] = useState<"add" | "subtract">("add");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (quantity <= 0) {
      toast.error("La cantidad debe ser mayor a cero");
      return;
    }

    // If operation is subtract, check if there's enough stock
    if (operation === "subtract" && quantity > item.quantity) {
      toast.error(`No hay suficiente stock. Stock actual: ${item.quantity}`);
      return;
    }

    try {
      await onSubmit({ quantity, operation });
    } catch (error) {
      console.error("Error adjusting stock:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Producto</Label>
        <div className="text-sm font-medium mt-1">{item.name}</div>
      </div>
      
      <div>
        <Label>Stock Actual</Label>
        <div className="text-sm font-medium mt-1">{item.quantity}</div>
      </div>
      
      <RadioGroup
        value={operation}
        onValueChange={(value) => setOperation(value as "add" | "subtract")}
        className="flex space-x-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="add" id="add" />
          <Label htmlFor="add">Agregar</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="subtract" id="subtract" />
          <Label htmlFor="subtract">Quitar</Label>
        </div>
      </RadioGroup>
      
      <div className="space-y-2">
        <Label htmlFor="quantity">Cantidad</Label>
        <Input
          id="quantity"
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
          required
        />
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Procesando..." : "Confirmar Ajuste"}
        </Button>
      </div>
    </form>
  );
};

export default StockAdjustmentForm;
