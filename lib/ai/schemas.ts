import { z } from "zod";

export const priceItemForAiSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string().optional().default("General"),
  unit: z.string().optional().default("each"),
  unit_price: z.number().min(0),
  cost: z.number().optional().default(0),
});

export type PriceItemForAi = z.infer<typeof priceItemForAiSchema>;

export const companySettingsForAiSchema = z.object({
  labor_rate: z.number().min(1).default(95),
  markup_percent: z.number().min(0).default(20),
  min_margin_percent: z.number().min(0).max(100).default(25),
});

export type CompanySettingsForAi = z.infer<typeof companySettingsForAiSchema>;

export const photoInputForAiSchema = z.object({
  base64: z.string().optional(),
  mimeType: z.string().optional().default("image/jpeg"),
  url: z.string().optional(),
});

export type PhotoInputForAi = z.infer<typeof photoInputForAiSchema>;

export const generateQuoteInputSchema = z.object({
  jobType: z.enum(["repair", "replacement", "maintenance"]),
  notes: z.string().default(""),
  photos: z.array(photoInputForAiSchema).optional().default([]),
  priceBook: z.array(priceItemForAiSchema),
  companySettings: companySettingsForAiSchema,
});

export type GenerateQuoteInput = z.infer<typeof generateQuoteInputSchema>;

export const aiQuoteLineOutputSchema = z.object({
  price_item_id: z.string().nullable().default(null),
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(0.1).default(1),
  unit_price: z.number().min(0).default(0),
  cost: z.number().min(0).default(0),
  is_unpriced: z.boolean().default(false),
  reason: z.string().min(1, "Reason is required"),
  confidence: z.enum(["low", "medium", "high"]).default("high"),
});

export type AiQuoteLineOutput = z.infer<typeof aiQuoteLineOutputSchema>;

export const aiQuoteDraftOutputSchema = z.object({
  summary: z.string().min(1, "Summary is required"),
  lines: z.array(aiQuoteLineOutputSchema).min(1, "At least one line item is required"),
  labor_hours: z.number().min(0.25, "Labor hours must be at least 0.25"),
  labor_reason: z.string().min(1, "Labor reason is required"),
  questions: z.array(z.string()).default([]),
});

export type AiQuoteDraftOutput = z.infer<typeof aiQuoteDraftOutputSchema>;

export interface CalculatedQuoteSummary {
  subtotal: number;
  labor_hours: number;
  labor_rate: number;
  labor_total: number;
  markup_percent: number;
  markup_total: number;
  total: number;
  margin_percent: number;
  is_margin_below_minimum: boolean;
  min_margin_percent: number;
  has_unpriced_items: boolean;
}
