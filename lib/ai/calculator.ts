import {
  AiQuoteLineOutput,
  CompanySettingsForAi,
  CalculatedQuoteSummary,
} from "./schemas";

/**
 * Calculates financial totals and margin for an HVAC quote following docs/MVP_PLAN.md wireframe rules:
 * - Parts subtotal = sum(item.unit_price * item.quantity)
 * - Labor total = labor_hours * labor_rate
 * - Job subtotal = parts subtotal + labor total
 * - Markup = markup_percent applied to parts (or job subtotal)
 * - Total = job subtotal + markup
 * - Margin = ((total - estimated_cost) / total) * 100
 */
export function calculateQuoteTotals(
  lines: AiQuoteLineOutput[],
  laborHours: number,
  settings: CompanySettingsForAi
): CalculatedQuoteSummary {
  const partsSubtotal = lines.reduce((acc, line) => {
    if (line.is_unpriced) return acc;
    return acc + (line.unit_price || 0) * (line.quantity || 1);
  }, 0);

  const laborRate = settings.labor_rate || 95;
  const laborTotal = Math.round(laborHours * laborRate * 100) / 100;

  // Job subtotal before markup
  const subtotal = Math.round((partsSubtotal + laborTotal) * 100) / 100;

  // Markup percentage applied to job subtotal
  const markupPercent = settings.markup_percent ?? 20;
  const markupTotal = Math.round((subtotal * (markupPercent / 100)) * 100) / 100;

  const total = Math.round((subtotal + markupTotal) * 100) / 100;

  // Estimated direct cost basis:
  // Parts cost (or ~60% wholesale benchmark if cost field omitted) + tech labor cost (~$40/hr benchmark)
  const partsCost = lines.reduce((acc, line) => {
    if (line.is_unpriced) return acc;
    const cost = line.cost && line.cost > 0 ? line.cost : (line.unit_price || 0) * 0.55;
    return acc + cost * (line.quantity || 1);
  }, 0);

  const laborCostBasis = laborHours * 45; // ~$45/hr tech wage & burden
  const totalCost = partsCost + laborCostBasis;

  const marginPercent =
    total > 0
      ? Math.round(((total - totalCost) / total) * 1000) / 10
      : 0;

  const minMargin = settings.min_margin_percent ?? 25;
  const isMarginBelowMinimum = marginPercent < minMargin;
  const hasUnpricedItems = lines.some((l) => l.is_unpriced);

  return {
    subtotal,
    labor_hours: laborHours,
    labor_rate: laborRate,
    labor_total: laborTotal,
    markup_percent: markupPercent,
    markup_total: markupTotal,
    total,
    margin_percent: marginPercent,
    is_margin_below_minimum: isMarginBelowMinimum,
    min_margin_percent: minMargin,
    has_unpriced_items: hasUnpricedItems,
  };
}
