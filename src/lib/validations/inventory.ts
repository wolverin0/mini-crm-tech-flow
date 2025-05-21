
import { z } from "zod";

export const inventorySchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  description: z.string().optional(),
  quantity: z.coerce.number().int().min(0, "La cantidad no puede ser negativa"),
  minimum_stock: z.coerce.number().int().min(0, "El stock mínimo no puede ser negativo"),
  cost_price: z.coerce.number().min(0, "El precio de costo no puede ser negativo"),
  selling_price: z.coerce.number().min(0, "El precio de venta no puede ser negativo"),
  supplier: z.string().optional(),
});

export const stockAdjustmentSchema = z.object({
  quantity: z.coerce.number().int().min(1, "La cantidad debe ser al menos 1"),
  operation: z.enum(["add", "subtract"], {
    required_error: "Debe seleccionar una operación",
  }),
});

export type StockAdjustment = z.infer<typeof stockAdjustmentSchema>;
