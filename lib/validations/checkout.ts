import { z } from "zod";

export const checkoutItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  size: z.string().optional(),
  price: z.number().positive("Price must be greater than 0"),
  quantity: z.number().int().positive("Quantity must be greater than 0"),
});

export const checkoutSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  phone: z.string().trim().min(7, "Phone must be at least 7 characters"),
  items: z.array(checkoutItemSchema).min(1, "Cart is empty"),
  shippingCost: z.number().nonnegative().default(0),
  subtotal: z.number().nonnegative(),
  total: z.number().nonnegative(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
