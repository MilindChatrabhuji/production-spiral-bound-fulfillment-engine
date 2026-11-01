/**
 * Production Printed Digital Product Physical Spiral-Bound Fulfillment Engine
 * Package: @nexus/spiral-bound-fulfillment-engine
 * Module: engine/edge_fulfillment_gateway/dynamic_shipping_rate_and_margin_calculator.ts
 *
 * Real-time landed print cost calculator, multi-carrier shipping estimator,
 * and dynamic gross profit margin modeler for physical spiral-bound books.
 */

export interface LandedPrintCostInput {
  pageCount: number;
  printQuantity: number;
  destinationCountry: string; // 'US', 'IN', 'GB', 'DE', etc.
  coverType: 'FrostedPoly' | 'GlossMatteLam' | 'SyntheticTeslin';
  paperWeight: '60#Text' | '80#Opaque' | 'SyntheticWaterproof';
  retailPriceUsd: number;
  carrierService: 'STANDARD' | 'EXPEDITED';
}

export interface LandedPrintEconomicsResult {
  unitPrintCostUsd: number;
  packagingMailerCostUsd: number;
  shippingRateUsd: number;
  totalLandedCostPerUnitUsd: number;
  retailPriceUsd: number;
  grossMarginUsd: number;
  grossMarginPercent: number;
  totalBatchRevenueUsd: number;
  totalBatchProfitUsd: number;
  calculatedAtIso: string;
}

export class DynamicShippingRateAndMarginCalculator {
  /**
   * Computes unit print cost, carrier freight, and author margin.
   */
  public static calculateLandedCost(input: LandedPrintCostInput): LandedPrintEconomicsResult {
    // 1. Base print cost
    let pageCostPerSheet = 0.024;
    if (input.paperWeight === '80#Opaque') pageCostPerSheet = 0.032;
    if (input.paperWeight === 'SyntheticWaterproof') pageCostPerSheet = 0.065;

    let coverBase = 1.80;
    if (input.coverType === 'FrostedPoly') coverBase = 2.40;
    if (input.coverType === 'SyntheticTeslin') coverBase = 3.20;

    const sheets = Math.ceil(input.pageCount / 2);
    const coilBindingHardwareCost = 1.25; // 16mm spiral coil + labor
    const unitPrint = Number((coverBase + (sheets * pageCostPerSheet) + coilBindingHardwareCost).toFixed(2));

    // 2. Rigid mailer packaging
    const packagingMailer = 0.85;

    // 3. Shipping rate
    let shipping = 4.95;
    if (input.destinationCountry === 'IN') {
      shipping = 1.80;
    } else if (input.destinationCountry !== 'US') {
      shipping = 8.50;
    }
    if (input.carrierService === 'EXPEDITED') {
      shipping += 7.00;
    }

    const totalLandedUnit = Number((unitPrint + packagingMailer + shipping).toFixed(2));
    const grossMargin = Number((input.retailPriceUsd - totalLandedUnit).toFixed(2));
    const grossMarginPct = Number(((grossMargin / input.retailPriceUsd) * 100).toFixed(1));

    const batchRevenue = Number((input.retailPriceUsd * input.printQuantity).toFixed(2));
    const batchProfit = Number((grossMargin * input.printQuantity).toFixed(2));

    return {
      unitPrintCostUsd: unitPrint,
      packagingMailerCostUsd: packagingMailer,
      shippingRateUsd: Number(shipping.toFixed(2)),
      totalLandedCostPerUnitUsd: totalLandedUnit,
      retailPriceUsd: input.retailPriceUsd,
      grossMarginUsd: grossMargin,
      grossMarginPercent: grossMarginPct,
      totalBatchRevenueUsd: batchRevenue,
      totalBatchProfitUsd: batchProfit,
      calculatedAtIso: new Date().toISOString()
    };
  }
}
