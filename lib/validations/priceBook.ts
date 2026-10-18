import { z } from "zod";

export const priceItemSchema = z.object({
  name: z.string().trim().min(1, "Item name is required"),
  category: z.string().trim().default("General"),
  unit: z.string().trim().min(1, "Unit is required").default("each"),
  unit_price: z.coerce
    .number({ invalid_type_error: "Price must be a number" })
    .min(0, "Price cannot be negative"),
});

export type PriceItemInput = z.infer<typeof priceItemSchema>;

export const companySettingsSchema = z.object({
  labor_rate: z.coerce
    .number({ invalid_type_error: "Labor rate must be a number" })
    .min(1, "Labor rate must be at least $1/hr"),
  markup_percent: z.coerce
    .number({ invalid_type_error: "Markup must be a number" })
    .min(0, "Markup cannot be negative"),
  min_margin_percent: z.coerce
    .number({ invalid_type_error: "Minimum margin must be a number" })
    .min(0, "Margin cannot be negative")
    .max(100, "Margin cannot exceed 100%"),
});

export type CompanySettingsInput = z.infer<typeof companySettingsSchema>;
